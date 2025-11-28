import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const requestSchema = z.object({
  prompt: z.string().min(1).max(5000), // Limit prompt length
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validation = requestSchema.safeParse(body)
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: validation.error.issues }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { prompt } = validation.data

    const response = await fetch("https://router.huggingface.co/hf-inference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("HF_TOKEN")}`
      },
      body: JSON.stringify({
        model: "google/gemma-2-2b-it",
        inputs: prompt
      })
    })

    if (!response.ok) {
      console.error(`HuggingFace API error: ${response.status}`)
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      )
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (e) {
    const error = e as Error
    console.error('Error in hugging-face-proxy:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
