import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    // Récupérer l'achat avec les détails de l'affiche depuis la table posters
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`
        *,
        poster:posters(title, canva_link)
      `)
      .eq('stripe_session_id', sessionId)
      .single();

    if (error || !purchase) {
      console.error('❌ Achat non trouvé:', error);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Purchase not found' }),
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