import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailTemplate {
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

function generateInvoiceEmailTemplate(
  customerName: string,
  posterTitle: string,
  invoiceNumber: string,
  canvaLink: string,
  companyName: string = 'Yad La\'Shlouhim'
): EmailTemplate {
  const subject = `Votre facture ${invoiceNumber} et votre lien Canva - ${companyName}`;
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre facture et lien Canva</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 18px;
            color: #2563eb;
            margin-bottom: 20px;
        }
        .main-message {
            background-color: #f0f9ff;
            padding: 20px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
        }
        .canva-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .canva-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            margin: 10px 0;
        }
        .invoice-section {
            background-color: #fff7ed;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e5e7eb;
        }
        .contact-info {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 ${companyName}</h1>
            <p>Votre commande est prête !</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Bonjour ${customerName} ! 👋
            </div>
            
            <div class="main-message">
                <p><strong>Excellente nouvelle !</strong></p>
                <p>Votre affiche personnalisée <span class="highlight">"${posterTitle}"</span> est maintenant disponible.</p>
                <p>Vous trouverez ci-joint votre facture officielle ainsi que les liens pour accéder à votre création.</p>
            </div>

            <div class="canva-section">
                <h3>🎯 Accédez à votre création Canva</h3>
                <p>Cliquez sur le bouton ci-dessous pour ouvrir votre affiche personnalisée dans Canva :</p>
                <a href="${canvaLink}" class="canva-button" target="_blank">
                    🚀 Ouvrir dans Canva
                </a>
                <p><small>Vous pourrez modifier, télécharger et personnaliser votre affiche selon vos besoins.</small></p>
            </div>

            <div class="invoice-section">
                <h3>📄 Votre facture</h3>
                <p>Vous trouverez votre facture officielle <strong>${invoiceNumber}</strong> en pièce jointe de cet email.</p>
                <p>Cette facture confirme le règlement de votre commande et peut servir de justificatif comptable.</p>
            </div>

            <div style="margin: 30px 0; padding: 20px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                <h3 style="color: #059669; margin-top: 0;">💡 Conseils d'utilisation</h3>
                <ul style="margin-bottom: 0;">
                    <li><strong>Personnalisation :</strong> Modifiez les textes, couleurs et images selon vos besoins</li>
                    <li><strong>Téléchargement :</strong> Exportez en haute résolution pour l'impression</li>
                    <li><strong>Partage :</strong> Partagez directement depuis Canva ou téléchargez le fichier</li>
                    <li><strong>Sauvegarde :</strong> Votre création reste accessible dans votre compte Canva</li>
                </ul>
            </div>

            <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Nous sommes là pour vous accompagner ! 😊</p>
            
            <p>Merci pour votre confiance et nous espérons que votre affiche vous plaira !</p>
            
            <p style="margin-top: 30px;">
                Cordialement,<br>
                <strong>L'équipe ${companyName}</strong>
            </p>
        </div>

        <div class="footer">
            <p><strong>${companyName}</strong></p>
            <p>Création d'affiches personnalisées de qualité</p>
            <div class="contact-info">
                <p>Pour toute question : contact@yad-lashlouhim.com</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  return { subject, html };
}

async function sendEmailWithResend(
  toEmail: string,
  template: EmailTemplate,
  pdfBuffer?: Uint8Array,
  invoiceNumber?: string
): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const emailData: any = {
    from: 'Yad La\'Shlouhim <noreply@yad-lashlouhim.com>',
    to: [toEmail],
    subject: template.subject,
    html: template.html,
  };

  // Add PDF attachment if available
  if (pdfBuffer && invoiceNumber) {
    emailData.attachments = [{
      filename: `${invoiceNumber.replace('/', '_')}.pdf`,
      content: Array.from(pdfBuffer),
      contentType: 'application/pdf'
    }];
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return true;
}

async function sendEmailWithEmailJS(
  toEmail: string,
  template: EmailTemplate,
  customerName: string,
  posterTitle: string,
  canvaLink: string,
  invoiceNumber: string
): Promise<boolean> {
  const emailData = {
    service_id: Deno.env.get('EMAILJS_SERVICE_ID'),
    template_id: Deno.env.get('EMAILJS_TEMPLATE_ID_INVOICE'), // New template for invoices
    user_id: Deno.env.get('EMAILJS_PUBLIC_KEY'),
    template_params: {
      to_email: toEmail,
      customer_name: customerName,
      poster_title: posterTitle,
      canva_link: canvaLink,
      invoice_number: invoiceNumber,
      subject: template.subject,
      // Note: EmailJS doesn't support attachments easily, so we'll include PDF link in email
    }
  };

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`EmailJS error: ${error}`);
  }

  return true;
}

Deno.serve(async (req) => {
  try {
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

    const { sessionId, invoiceId } = await req.json();

    if (!sessionId && !invoiceId) {
      return new Response(
        JSON.stringify({ error: 'sessionId ou invoiceId requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📧 Envoi facture par email pour session:', sessionId);

    // 1. Get or create invoice
    let invoice;
    if (invoiceId) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
      
      if (error) throw error;
      invoice = data;
    } else {
      // Try to get existing invoice or create one
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (existingInvoice) {
        invoice = existingInvoice;
      } else {
        // Create invoice
        const { data: newInvoiceId, error: createError } = await supabase
          .rpc('create_invoice_from_order', { p_stripe_session_id: sessionId });

        if (createError) throw createError;

        const { data: createdInvoice, error: fetchError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', newInvoiceId)
          .single();

        if (fetchError) throw fetchError;
        invoice = createdInvoice;
      }
    }

    if (!invoice) {
      throw new Error('Invoice not found or created');
    }

    // 2. Get purchase/order details for Canva link
    const { data: purchase } = await supabase
      .from('purchases')
      .select('canva_link, poster:posters(title)')
      .eq('stripe_session_id', invoice.stripe_session_id)
      .single();

    const canvaLink = purchase?.canva_link || '';
    const posterTitle = purchase?.poster?.title || invoice.poster_title;

    // 3. Get company settings
    const { data: settings } = await supabase
      .from('invoice_settings')
      .select('company_name')
      .single();

    const companyName = settings?.company_name || 'Yad La\'Shlouhim';

    // 4. Generate email template
    const emailTemplate = generateInvoiceEmailTemplate(
      invoice.customer_name,
      posterTitle,
      invoice.invoice_number,
      canvaLink,
      companyName
    );

    // 5. Get PDF if available
    let pdfBuffer: Uint8Array | undefined;
    if (invoice.pdf_url) {
      try {
        const pdfResponse = await fetch(invoice.pdf_url);
        if (pdfResponse.ok) {
          pdfBuffer = new Uint8Array(await pdfResponse.arrayBuffer());
        }
      } catch (error) {
        console.warn('Could not fetch PDF for attachment:', error);
      }
    }

    // 6. Send email - try Resend first, fallback to EmailJS
    let emailSent = false;
    let emailMethod = '';

    try {
      await sendEmailWithResend(
        invoice.customer_email,
        emailTemplate,
        pdfBuffer,
        invoice.invoice_number
      );
      emailSent = true;
      emailMethod = 'Resend';
    } catch (resendError) {
      console.log('Resend failed, trying EmailJS:', resendError);
      
      try {
        await sendEmailWithEmailJS(
          invoice.customer_email,
          emailTemplate,
          invoice.customer_name,
          posterTitle,
          canvaLink,
          invoice.invoice_number
        );
        emailSent = true;
        emailMethod = 'EmailJS';
      } catch (emailJSError) {
        console.error('Both email methods failed:', emailJSError);
        throw new Error('Failed to send email with both Resend and EmailJS');
      }
    }

    // 7. Update invoice
    if (emailSent) {
      await supabase
        .from('invoices')
        .update({ 
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          email_count: invoice.email_count + 1,
          status: 'sent'
        })
        .eq('id', invoice.id);
    }

    console.log(`✅ Email envoyé avec succès via ${emailMethod}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Email envoyé via ${emailMethod}`,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Erreur envoi facture email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send invoice email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});