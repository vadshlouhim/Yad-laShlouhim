import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

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

    console.log('🔍 Récupération session Stripe:', sessionId);

    // Récupérer la session Stripe avec ses métadonnées
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    console.log('✅ Session trouvée:', session.id);
    console.log('📋 Métadonnées:', session.metadata);

    // Récupérer l'URL de reçu si disponible
    let receipt_url = null;
    if (session.payment_intent && typeof session.payment_intent === 'object') {
      const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
      if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object') {
        const charge = paymentIntent.latest_charge as Stripe.Charge;
        receipt_url = charge.receipt_url;
      }
    }

    // Retourner les données dans le format attendu
    const response = {
      metadata: session.metadata,
      receipt_url: receipt_url,
      session_id: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('💥 Erreur récupération session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to retrieve session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};