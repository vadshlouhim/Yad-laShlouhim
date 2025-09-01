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
  console.log('🎯 Webhook Stripe reçu');

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
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
    const sig = event.headers['stripe-signature'];
    
    if (!sig) {
      console.error('❌ Signature Stripe manquante');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing Stripe signature' }),
      };
    }

    // Vérifier la signature du webhook
    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body!,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('❌ Signature invalide:', err);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    console.log('✅ Webhook vérifié:', stripeEvent.type);

    // Traiter l'événement checkout.session.completed
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      
      console.log('💳 Session complétée:', session.id);
      console.log('📋 Metadata:', session.metadata);

      // 1. Créer l'enregistrement d'achat dans la table purchases
      const purchaseData = {
        stripe_session_id: session.id,
        poster_id: session.metadata?.poster_id,
        customer_email: session.metadata?.customer_email || session.customer_email,
        status: 'completed',
        receipt_url: null, // Sera mis à jour plus tard si disponible
        canva_link: session.metadata?.canva_link || ''
      };

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();

      if (purchaseError) {
        console.error('❌ Erreur création purchase:', purchaseError);
      } else {
        console.log('✅ Purchase créé:', purchase.id);
      }

      // 2. Récupérer le reçu Stripe si disponible
      try {
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          if (paymentIntent.charges.data[0]?.receipt_url) {
            // Mettre à jour avec l'URL du reçu
            await supabase
              .from('purchases')
              .update({ receipt_url: paymentIntent.charges.data[0].receipt_url })
              .eq('stripe_session_id', session.id);
            
            console.log('✅ Reçu Stripe ajouté');
          }
        }
      } catch (receiptError) {
        console.error('⚠️ Impossible de récupérer le reçu:', receiptError);
      }

      // 3. Envoyer l'email de confirmation
      try {
        console.log('📧 Envoi email de confirmation...');
        
        const emailResponse = await fetch(`${process.env.SITE_URL || 'http://localhost:3000'}/.netlify/functions/sendPurchaseEmail`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id })
        });

        if (emailResponse.ok) {
          console.log('✅ Email envoyé avec succès');
        } else {
          console.error('❌ Erreur envoi email:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('❌ Erreur email:', emailError);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    console.error('💥 Erreur webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};