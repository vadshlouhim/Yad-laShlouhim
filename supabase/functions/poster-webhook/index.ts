import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ Signature Stripe manquante');
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      );
    } catch (err) {
      console.error('❌ Signature invalide:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Webhook vérifié:', stripeEvent.type);

    // Handle checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      
      console.log('💳 Session complétée:', session.id);
      console.log('📋 Metadata:', session.metadata);

      // 1. Create purchase record
      const purchaseData = {
        stripe_session_id: session.id,
        poster_id: session.metadata?.poster_id,
        customer_email: session.metadata?.customer_email || session.customer_email,
        status: 'completed',
        receipt_url: null,
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

      // 2. Get Stripe receipt if available
      try {
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          if (paymentIntent.charges.data[0]?.receipt_url) {
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

      // 3. Send confirmation email (optional)
      try {
        console.log('📧 Envoi email de confirmation...');
        
        const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-purchase-email`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
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

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Erreur webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});