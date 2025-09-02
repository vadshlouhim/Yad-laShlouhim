import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Client admin avec Service Role Key (contourne RLS)
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

    // Gérer FormData pour les uploads d'images
    const contentType = req.headers.get('content-type') ?? ''
    let operation, data

    if (contentType.includes('multipart/form-data')) {
      // Traitement FormData pour UPLOAD_IMAGE
      const formData = await req.formData()
      operation = formData.get('operation') as string
      
      if (operation === 'UPLOAD_IMAGE') {
        const file = formData.get('file') as File
        const fileName = formData.get('fileName') as string
        data = { file, fileName }
      }
    } else {
      // Traitement JSON pour les autres opérations
      const body = await req.json()
      operation = body.operation
      data = body.data
    }

    console.log('🔧 Opération admin:', operation, data?.fileName ? { fileName: data.fileName } : data)

    switch (operation) {
      case 'CREATE_POSTER':
        const { data: newPoster, error: createError } = await supabaseAdmin
          .from('posters')
          .insert(data.posterData)
          .select()
          .single()

        if (createError) throw createError
        
        return new Response(JSON.stringify({ success: true, data: newPoster }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'UPDATE_POSTER':
        const { data: updatedPoster, error: updateError } = await supabaseAdmin
          .from('posters')
          .update(data.posterData)
          .eq('id', data.id)
          .select()
          .single()

        if (updateError) throw updateError
        
        return new Response(JSON.stringify({ success: true, data: updatedPoster }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'DELETE_POSTER':
        const { error: deleteError } = await supabaseAdmin
          .from('posters')
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'TOGGLE_PUBLISHED':
        const { data: toggledPoster, error: toggleError } = await supabaseAdmin
          .from('posters')
          .update({ is_published: data.is_published })
          .eq('id', data.id)
          .select()
          .single()

        if (toggleError) throw toggleError
        
        return new Response(JSON.stringify({ success: true, data: toggledPoster }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'TOGGLE_FEATURED':
        const { data: featuredPoster, error: featuredError } = await supabaseAdmin
          .from('posters')
          .update({ is_featured: data.is_featured })
          .eq('id', data.id)
          .select()
          .single()

        if (featuredError) throw featuredError
        
        return new Response(JSON.stringify({ success: true, data: featuredPoster }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'SETUP_STORAGE':
        // Créer le bucket Affiches s'il n'existe pas
        const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
        
        const affichesExists = buckets?.some(bucket => bucket.name === 'Affiches')
        
        if (!affichesExists) {
          const { data: bucket, error: createBucketError } = await supabaseAdmin.storage.createBucket('Affiches', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
          })

          if (createBucketError) throw createBucketError
          console.log('✅ Bucket Affiches créé')
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Storage configuré',
          bucketExists: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'UPLOAD_IMAGE':
        // Upload d'image via Service Role
        const { file, fileName } = data
        const filePath = `affiches/${fileName}` // Organiser dans un sous-dossier
        
        console.log('📤 Upload Edge Function:', { fileName, fileSize: file?.size })
        
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('Affiches')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('❌ Erreur upload Edge Function:', uploadError)
          throw uploadError
        }

        console.log('✅ Upload Edge Function réussi:', uploadData)

        const { data: urlData } = supabaseAdmin.storage
          .from('Affiches')
          .getPublicUrl(filePath)

        console.log('🔗 URL publique Edge Function:', urlData.publicUrl)

        return new Response(JSON.stringify({ 
          success: true, 
          url: urlData.publicUrl 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        throw new Error(`Opération non supportée: ${operation}`)
    }

  } catch (error) {
    console.error('💥 Erreur admin operation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Opération échouée',
        details: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})