import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key to bypass RLS
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

    const { sessionId, stripeData } = await req.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('💾 Enregistrement achat pour session:', sessionId)

    // Vérifier si l'achat existe déjà pour éviter les doublons
    const { data: existingPurchase, error: existingError } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    if (existingPurchase) {
      console.log('ℹ️ Achat déjà existant')
      return new Response(
        JSON.stringify({ 
          message: 'Purchase already exists',
          existingId: existingPurchase.id 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Créer l'enregistrement d'achat
    const purchaseData = {
      stripe_session_id: sessionId,
      poster_id: stripeData?.metadata?.poster_id || 'unknown',
      customer_email: stripeData?.customer_email || stripeData?.metadata?.customer_email,
      status: 'completed',
      receipt_url: stripeData?.receipt_url || null,
      canva_link: stripeData?.metadata?.canva_link || ''
    }

    console.log('📊 Données à insérer:', purchaseData)

    // Utilisation du client admin pour contourner RLS
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert(purchaseData)
      .select()
      .single()

    if (purchaseError) {
      console.error('❌ Erreur insertion:', purchaseError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save purchase',
          details: purchaseError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Achat enregistré:', purchase?.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Purchase saved successfully',
        purchaseId: purchase?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Erreur:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})