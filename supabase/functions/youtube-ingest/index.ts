import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

function extractYouTubeId(url: string): { id: string | null; isShort: boolean } {
  if (!url) return { id: null, isShort: false }
  const patterns: { re: RegExp; isShort?: boolean }[] = [
    { re: /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, isShort: true },
    { re: /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/ },
    { re: /youtu\.be\/([a-zA-Z0-9_-]{11})/ },
    { re: /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/ },
    { re: /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/ },
  ]
  for (const { re, isShort } of patterns) {
    const m = url.match(re)
    if (m) return { id: m[1], isShort: !!isShort }
  }
  return { id: null, isShort: false }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json().catch(() => ({ url: '' }))
    if (typeof url !== 'string' || url.length === 0 || url.length > 500) {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { id: youtubeId, isShort } = extractYouTubeId(url)
    if (!youtubeId) {
      return new Response(JSON.stringify({ error: 'Not a valid YouTube URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Duplicate check
    const { data: existing } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_id', youtubeId)
      .maybeSingle()
    if (existing) {
      return new Response(JSON.stringify({ error: 'This video has already been added' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch oEmbed metadata
    const canonical = `https://www.youtube.com/watch?v=${youtubeId}`
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonical)}&format=json`
    const oembedRes = await fetch(oembedUrl)
    if (!oembedRes.ok) {
      return new Response(JSON.stringify({ error: 'Video is private, removed, or unavailable' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const meta = await oembedRes.json() as { title?: string; author_name?: string; thumbnail_url?: string }

    const { data: inserted, error } = await supabase
      .from('videos')
      .insert({
        youtube_id: youtubeId,
        url: canonical,
        title: meta.title ?? null,
        author: meta.author_name ?? null,
        thumbnail: meta.thumbnail_url ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        is_short: isShort,
        like_count: 0,
      })
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ video: inserted }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
