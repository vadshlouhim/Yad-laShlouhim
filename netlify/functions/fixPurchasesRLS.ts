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
    console.log('🔧 Diagnostic et correction de la table purchases');

    // 1. Test de connexion basique
    const { data: connectionTest, error: connectionError } = await supabase
      .from('purchases')
      .select('count(*)', { count: 'exact', head: true });

    console.log('📊 Test connexion:', { connectionTest, connectionError });

    // 2. Vérifier les permissions actuelles avec le service role
    const { data: serviceRoleTest, error: serviceRoleError } = await supabase
      .from('purchases')
      .select('*')
      .limit(5);

    console.log('🔑 Test service role:', { count: serviceRoleTest?.length, serviceRoleError });

    // 3. Essayer une insertion de test
    const testData = {
      stripe_session_id: `test_diagnostic_${Date.now()}`,
      poster_id: 'test',
      customer_email: 'diagnostic@test.com',
      status: 'test',
      receipt_url: null,
      canva_link: 'https://test.com'
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('purchases')
      .insert(testData)
      .select();

    console.log('📝 Test insertion:', { insertTest, insertError });

    // 4. Nettoyer le test si l'insertion a réussi
    if (insertTest && insertTest[0]) {
      await supabase
        .from('purchases')
        .delete()
        .eq('stripe_session_id', testData.stripe_session_id);
      console.log('🧹 Test data nettoyé');
    }

    // 5. Diagnostic des variables d'environnement
    const envDiagnostic = {
      hasSupabaseUrl: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'MISSING'
    };

    console.log('🔍 Variables environnement:', envDiagnostic);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        diagnostic: {
          connection: connectionTest,
          connectionError: connectionError?.message,
          serviceRoleTest: { count: serviceRoleTest?.length, error: serviceRoleError?.message },
          insertTest: { success: !!insertTest, error: insertError?.message },
          environment: envDiagnostic
        }
      }),
    };

  } catch (error) {
    console.error('💥 Erreur diagnostic:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Diagnostic failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};