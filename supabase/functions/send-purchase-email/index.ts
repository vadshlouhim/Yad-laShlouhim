import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📧 Envoi email pour session:', sessionId);

    // 1. Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        *,
        poster:posters(title, canva_link)
      `)
      .eq('stripe_session_id', sessionId)
      .single();

    if (purchaseError || !purchase) {
      console.error('❌ Achat non trouvé:', purchaseError);
      return new Response(
        JSON.stringify({ error: 'Purchase not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. Prepare email data for EmailJS
    const emailData = {
      service_id: Deno.env.get('EMAILJS_SERVICE_ID'),
      template_id: Deno.env.get('EMAILJS_TEMPLATE_ID_PURCHASE'),
      user_id: Deno.env.get('EMAILJS_PUBLIC_KEY'),
      template_params: {
        to_email: purchase.customer_email,
        poster_title: purchase.poster?.title || 'Affiche',
        canva_link: purchase.poster?.canva_link || purchase.canva_link,
        receipt_url: purchase.receipt_url || '',
        purchase_date: new Date(purchase.created_at).toLocaleDateString('fr-FR')
      }
    };

    console.log('📤 Envoi via EmailJS...');

    // 3. Send email via EmailJS
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('❌ Erreur EmailJS:', errorText);
      throw new Error(`EmailJS error: ${errorText}`);
    }

    console.log('✅ Email envoyé avec succès');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Erreur envoi email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});