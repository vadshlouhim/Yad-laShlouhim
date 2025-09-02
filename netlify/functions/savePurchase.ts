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
    const { sessionId, stripeData } = JSON.parse(event.body || '{}');

    if (!sessionId || !stripeData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID and Stripe data are required' }),
      };
    }

    console.log('💾 Enregistrement achat pour session:', sessionId);
    console.log('📋 Métadonnées Stripe:', stripeData.metadata);

    // Vérifier si l'achat existe déjà pour éviter les doublons
    const { data: existingPurchase, error: existingError } = await supabase
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (existingPurchase) {
      console.log('ℹ️ Achat déjà existant, pas de création');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Purchase already exists',
          existingId: existingPurchase.id 
        }),
      };
    }

    // Créer l'enregistrement d'achat
    const purchaseData = {
      stripe_session_id: sessionId,
      poster_id: stripeData.metadata?.poster_id || 'unknown',
      customer_email: stripeData.customer_email || stripeData.metadata?.customer_email,
      status: 'completed',
      receipt_url: stripeData.receipt_url || null,
      canva_link: stripeData.metadata?.canva_link || ''
    };

    console.log('📊 Données à insérer:', purchaseData);

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single();

    if (purchaseError) {
      console.error('❌ Erreur insertion:', purchaseError);
      
      // Essayer une approche alternative sans select()
      const { error: simpleError } = await supabase
        .from('purchases')
        .insert(purchaseData);
      
      if (simpleError) {
        console.error('❌ Échec insertion simple:', simpleError);
        throw simpleError;
      } else {
        console.log('✅ Insertion simple réussie');
      }
    } else {
      console.log('✅ Achat enregistré:', purchase?.id || 'ID inconnu');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Purchase saved successfully',
        purchaseId: purchase?.id || 'created'
      }),
    };

  } catch (error) {
    console.error('💥 Erreur enregistrement achat:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save purchase',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};