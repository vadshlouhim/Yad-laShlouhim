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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('🧪 Test de la fonction testPurchase');
    
    // 1. Vérifier la connexion Supabase
    const { data: tables, error: tablesError } = await supabase
      .from('purchases')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tablesError) {
      console.error('❌ Erreur connexion:', tablesError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Connexion Supabase échouée',
          details: tablesError
        })
      };
    }

    console.log('✅ Connexion Supabase OK, nombre de purchases:', tables);

    // 2. Test d'insertion d'un achat
    const testPurchaseData = {
      stripe_session_id: `test_${Date.now()}`,
      poster_id: '1',
      customer_email: 'test@example.com',
      status: 'completed',
      receipt_url: null,
      canva_link: 'https://example.com/canva'
    };

    console.log('📝 Tentative insertion:', testPurchaseData);

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert(testPurchaseData)
      .select()
      .single();

    if (purchaseError) {
      console.error('❌ Erreur insertion:', purchaseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Insertion échouée',
          details: purchaseError,
          testData: testPurchaseData,
          envVars: {
            hasSupabaseUrl: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
            hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
            supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'MISSING'
          }
        })
      };
    }

    console.log('✅ Purchase test créé:', purchase);

    // 3. Test de récupération
    const { data: retrieved, error: retrieveError } = await supabase
      .from('purchases')
      .select('*')
      .eq('stripe_session_id', testPurchaseData.stripe_session_id)
      .single();

    if (retrieveError) {
      console.error('❌ Erreur récupération:', retrieveError);
    } else {
      console.log('✅ Purchase récupéré:', retrieved);
    }

    // 4. Nettoyage - supprimer le test
    await supabase
      .from('purchases')
      .delete()
      .eq('stripe_session_id', testPurchaseData.stripe_session_id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Test complet réussi',
        inserted: purchase,
        retrieved: retrieved
      })
    };

  } catch (error) {
    console.error('💥 Erreur test:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Test échoué',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};