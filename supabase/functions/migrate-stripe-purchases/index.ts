import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('🔄 Migration des achats Stripe vers Supabase...')

    // Récupérer toutes les sessions Stripe complétées
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete'
    })

    console.log(`📊 ${sessions.data.length} sessions trouvées`)

    let created = 0
    let skipped = 0
    let errors = 0

    for (const session of sessions.data) {
      try {
        // Vérifier si déjà existant
        const { data: existing } = await supabaseAdmin
          .from('purchases')
          .select('id')
          .eq('stripe_session_id', session.id)
          .maybeSingle()

        if (existing) {
          skipped++
          continue
        }

        // Récupérer le reçu si disponible
        let receiptUrl = null
        if (session.payment_intent) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
            if (paymentIntent.charges.data[0]?.receipt_url) {
              receiptUrl = paymentIntent.charges.data[0].receipt_url
            }
          } catch (receiptError) {
            console.warn('⚠️ Impossible de récupérer le reçu pour:', session.id)
          }
        }

        // Créer l'enregistrement
        const purchaseData = {
          stripe_session_id: session.id,
          poster_id: session.metadata?.poster_id || 'unknown',
          customer_email: session.customer_email || session.metadata?.customer_email,
          status: 'completed',
          receipt_url: receiptUrl,
          canva_link: session.metadata?.canva_link || ''
        }

        const { error } = await supabaseAdmin
          .from('purchases')
          .insert(purchaseData)

        if (error) {
          console.error(`❌ Erreur pour ${session.id}:`, error)
          errors++
        } else {
          console.log(`✅ Migré: ${session.id} - ${session.customer_email}`)
          created++
        }

      } catch (sessionError) {
        console.error(`💥 Erreur traitement ${session.id}:`, sessionError)
        errors++
      }
    }

    const summary = {
      totalSessions: sessions.data.length,
      created,
      skipped,
      errors,
      message: `Migration terminée: ${created} créés, ${skipped} ignorés, ${errors} erreurs`
    }

    console.log('📋 Résumé:', summary)

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Erreur migration:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Migration failed',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})