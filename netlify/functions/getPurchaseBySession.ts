import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body || '{}');

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' }),
      };
    }

    console.log('🔍 Recherche achat pour session:', sessionId);
    console.log('🔑 Variables env disponibles:', {
      hasSupabaseUrl: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY
    });

    // D'abord essayer sans jointure pour voir si l'achat existe
    const { data: basicPurchase, error: basicError } = await supabase
      .from('purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (basicError) {
      console.error('❌ Achat non trouvé (basic):', basicError);
      
      // Essayer de lister tous les achats récents pour debug
      const { data: recentPurchases, error: recentError } = await supabase
        .from('purchases')
        .select('stripe_session_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('📊 Achats récents:', recentPurchases);
      console.log('🔍 Session recherchée:', sessionId);
      
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Purchase not found',
          sessionId,
          recentPurchases: recentPurchases?.map(p => p.stripe_session_id) || [],
          debug: {
            basicError: basicError,
            recentError: recentError
          }
        }),
      };
    }

    console.log('✅ Achat trouvé (basic):', basicPurchase.id);

    // Maintenant essayer avec la jointure pour les détails
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`
        *,
        poster:posters(title, canva_link)
      `)
      .eq('stripe_session_id', sessionId)
      .single();

    if (error) {
      console.error('⚠️ Erreur jointure, utilisation données de base:', error);
      // Utiliser les données de base si la jointure échoue
      const response = {
        canva_link: basicPurchase.canva_link,
        receipt_url: basicPurchase.receipt_url,
        poster_title: `Affiche ID: ${basicPurchase.poster_id}`
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response),
      };
    }

    console.log('✅ Achat trouvé:', purchase.id);

    // Retourner les données formatées avec le lien Canva de la table posters
    const response = {
      canva_link: purchase.poster?.canva_link || purchase.canva_link,
      receipt_url: purchase.receipt_url,
      poster_title: purchase.poster?.title || 'Affiche'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('💥 Erreur récupération achat:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to retrieve purchase',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};