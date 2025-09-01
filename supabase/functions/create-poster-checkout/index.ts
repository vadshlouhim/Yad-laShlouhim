import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { posterId, customerData } = await req.json();

    console.log('📝 Données reçues:', { posterId, customerData });

    if (!posterId) {
      return new Response(
        JSON.stringify({ error: 'Poster ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!customerData || !customerData.customer_name || !customerData.customer_email) {
      return new Response(
        JSON.stringify({ error: 'Customer data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 1. Récupérer les détails de l'affiche
    console.log('🔍 Récupération de l\'affiche:', posterId);
    const { data: poster, error: posterError } = await supabase
      .from('posters')
      .select('*')
      .eq('id', posterId)
      .eq('is_published', true)
      .single();

    if (posterError || !poster) {
      console.error('❌ Affiche non trouvée:', posterError);
      return new Response(
        JSON.stringify({ error: 'Poster not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
      success_url: `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/achat/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/achat/annule`,
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

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});