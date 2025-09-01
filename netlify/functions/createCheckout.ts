import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { posterId, customerData } = JSON.parse(event.body || '{}');

    console.log('📝 Données reçues:', { posterId, customerData });

    if (!posterId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Poster ID is required' }),
      };
    }

    if (!customerData || !customerData.customer_name || !customerData.customer_email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer data is required' }),
      };
    }

    // 1. Récupérer les détails de l'affiche depuis la table posters existante
    console.log('🔍 Récupération de l\'affiche:', posterId);
    const { data: poster, error: posterError } = await supabase
      .from('posters')
      .select('*')
      .eq('id', posterId)
      .eq('is_published', true)
      .single();

    if (posterError || !poster) {
      console.error('❌ Affiche non trouvée:', posterError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Poster not found' }),
      };
    }

    console.log('✅ Affiche trouvée:', poster.title);

    // 2. Créer la session Stripe Checkout
    console.log('💳 Création session Stripe...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: poster.currency.toLowerCase(),
            product_data: {
              name: poster.title,
              description: poster.description,
              images: poster.image_url ? [poster.image_url] : [],
            },
            unit_amount: poster.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SITE_URL || 'http://localhost:3000'}/achat/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:3000'}/achat/annule`,
      customer_email: customerData.customer_email,
      metadata: {
        poster_id: posterId,
        poster_title: poster.title,
        canva_link: poster.canva_link,
        customer_name: customerData.customer_name,
        customer_email: customerData.customer_email,
        customer_phone: customerData.phone || '',
        organization: customerData.organization || '',
        notes: customerData.notes || '',
      },
    });

    console.log('✅ Session Stripe créée:', session.url);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};