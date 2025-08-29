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

    console.log('📧 Envoi email pour session:', sessionId);

    // 1. Récupérer les détails de l'achat depuis la table purchases
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
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Purchase not found' }),
      };
    }

    // 2. Préparer les données pour EmailJS
    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID_PURCHASE,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: purchase.customer_email,
        poster_title: purchase.poster?.title || 'Affiche',
        canva_link: purchase.poster?.canva_link || purchase.canva_link,
        receipt_url: purchase.receipt_url || '',
        purchase_date: new Date(purchase.created_at).toLocaleDateString('fr-FR')
      }
    };

    console.log('📤 Envoi via EmailJS...');

    // 3. Envoyer l'email via EmailJS
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Email sent successfully'
      }),
    };

  } catch (error) {
    console.error('💥 Erreur envoi email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};