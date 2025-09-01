import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceData {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_address?: string
  poster_title: string
  quantity: number
  unit_price_cents: number
  subtotal_cents: number
  vat_rate: number
  vat_amount_cents: number
  total_amount_cents: number
  currency: string
}

interface CompanySettings {
  company_name: string
  company_address: string
  company_city: string
  company_postal_code: string
  company_country: string
  company_email: string
  company_phone: string
  company_siret?: string
  company_vat_number?: string
  logo_url?: string
}

function formatPrice(cents: number, currency: string = 'EUR'): string {
  const amount = cents / 100
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('fr-FR').format(date)
}

function generateInvoiceHTML(invoice: InvoiceData, settings: CompanySettings): string {
  const logoSection = settings.logo_url 
    ? `<img src="${settings.logo_url}" alt="${settings.company_name}" style="max-height: 80px; max-width: 200px;">` 
    : `<h1 style="color: #2563eb; margin: 0; font-size: 28px;">${settings.company_name}</h1>`

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture ${invoice.invoice_number}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        .company-info {
            flex: 1;
        }
        .company-info h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .company-details {
            color: #666;
            font-size: 14px;
            line-height: 1.4;
        }
        .invoice-info {
            text-align: right;
            flex: 1;
        }
        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .invoice-dates {
            font-size: 14px;
            color: #666;
        }
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin: 40px 0;
        }
        .billing-info {
            flex: 1;
            margin-right: 40px;
        }
        .billing-info h3 {
            color: #2563eb;
            margin-bottom: 15px;
            font-size: 16px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .billing-details {
            line-height: 1.8;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .items-table th {
            background: #f8fafc;
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid #2563eb;
            font-weight: 600;
            color: #2563eb;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table .text-right {
            text-align: right;
        }
        .totals-section {
            margin-top: 30px;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
        }
        .totals-table {
            width: 100%;
            max-width: 400px;
            margin-left: auto;
        }
        .totals-table td {
            padding: 8px 15px;
            border: none;
        }
        .totals-table .label {
            text-align: right;
            font-weight: 500;
            color: #666;
        }
        .totals-table .amount {
            text-align: right;
            font-weight: 600;
            min-width: 100px;
        }
        .total-row {
            border-top: 2px solid #2563eb;
            background: #f8fafc;
        }
        .total-row td {
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .payment-info {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin: 30px 0;
        }
        .payment-info h3 {
            color: #2563eb;
            margin-top: 0;
            margin-bottom: 10px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .header { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            ${logoSection}
            <div class="company-details">
                ${settings.company_address}<br>
                ${settings.company_postal_code} ${settings.company_city}<br>
                ${settings.company_country}<br><br>
                📧 ${settings.company_email}<br>
                📞 ${settings.company_phone}
                ${settings.company_siret ? `<br>SIRET: ${settings.company_siret}` : ''}
                ${settings.company_vat_number ? `<br>N° TVA: ${settings.company_vat_number}` : ''}
            </div>
        </div>
        <div class="invoice-info">
            <div class="invoice-number">FACTURE</div>
            <div class="invoice-number">${invoice.invoice_number}</div>
            <div class="invoice-dates">
                <strong>Date:</strong> ${formatDate(invoice.invoice_date)}<br>
                <strong>Échéance:</strong> ${formatDate(invoice.due_date)}
            </div>
        </div>
    </div>

    <div class="billing-section">
        <div class="billing-info">
            <h3>🏢 Facturé à</h3>
            <div class="billing-details">
                <strong>${invoice.customer_name}</strong><br>
                📧 ${invoice.customer_email}
                ${invoice.customer_phone ? `<br>📞 ${invoice.customer_phone}` : ''}
                ${invoice.customer_address ? `<br><br>${invoice.customer_address}` : ''}
            </div>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 50%;">Description</th>
                <th class="text-right" style="width: 15%;">Quantité</th>
                <th class="text-right" style="width: 17.5%;">Prix unitaire</th>
                <th class="text-right" style="width: 17.5%;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>🎨 ${invoice.poster_title}</strong><br>
                    <small style="color: #666;">Affiche personnalisée avec lien Canva inclus</small>
                </td>
                <td class="text-right">${invoice.quantity}</td>
                <td class="text-right">${formatPrice(invoice.unit_price_cents, invoice.currency)}</td>
                <td class="text-right"><strong>${formatPrice(invoice.subtotal_cents, invoice.currency)}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="label">Sous-total:</td>
                <td class="amount">${formatPrice(invoice.subtotal_cents, invoice.currency)}</td>
            </tr>
            ${invoice.vat_amount_cents > 0 ? `
            <tr>
                <td class="label">TVA (${(invoice.vat_rate * 100).toFixed(1)}%):</td>
                <td class="amount">${formatPrice(invoice.vat_amount_cents, invoice.currency)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
                <td class="label">TOTAL:</td>
                <td class="amount">${formatPrice(invoice.total_amount_cents, invoice.currency)}</td>
            </tr>
        </table>
    </div>

    <div class="payment-info">
        <h3>💳 Informations de paiement</h3>
        <p><strong>✅ Cette facture a été réglée par carte bancaire via Stripe.</strong></p>
        <p>Paiement sécurisé effectué le ${formatDate(invoice.invoice_date)}.</p>
    </div>

    <div class="footer">
        <p>Merci pour votre confiance ! 🙏</p>
        <p>${settings.company_name} - ${settings.company_email}</p>
        <p><em>Facture générée automatiquement le ${formatDate(new Date().toISOString())}</em></p>
    </div>
</body>
</html>
  `
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, invoiceId } = await req.json()

    if (!sessionId && !invoiceId) {
      return new Response(
        JSON.stringify({ error: 'sessionId ou invoiceId requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get invoice data
    let invoice
    if (invoiceId) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()
      
      if (error) throw error
      invoice = data
    } else {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single()
      
      if (error) throw error
      invoice = data
    }

    if (!invoice) {
      return new Response(
        JSON.stringify({ error: 'Facture non trouvée' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get company settings
    const { data: settings, error: settingsError } = await supabase
      .from('invoice_settings')
      .select('*')
      .single()

    if (settingsError) throw settingsError

    // Generate HTML
    const html = generateInvoiceHTML(invoice, settings)

    // For now, return HTML (you can later integrate with PDF generation service)
    // In production, you would use a service like Puppeteer or jsPDF
    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})