import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription } = await req.json();

    if (!transcription || typeof transcription !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid transcription" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch all active products from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error: dbError } = await supabase
      .from("marketplace_listings")
      .select("id, title, description, listing_type, tags, creation_link, images")
      .eq("status", "active")
      .limit(100);

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Failed to fetch products");
    }

    // 2. Build the product list for the system prompt
    const productLines = (products || [])
      .map((p: any) => `- ${p.title}: ${(p.description || "").substring(0, 150)}`)
      .join("\n");

    const systemPrompt = `You are the AI assistant for the Digital Intelligence Marketplace.
Current tools and products available:
${productLines}

User spoken need: "${transcription}"

Return ONLY valid JSON — an array of matching products. Each object:
[
  {
    "product_name": "exact name from the list above",
    "match_score": 85,
    "explanation": "one short sentence why this solves the exact need",
    "action": "View [product name] details"
  }
]
Rules:
- Only include products from the list above.
- match_score is 0-100 based on relevance.
- Return up to 5 best matches, sorted by match_score descending.
- If nothing matches well (all scores < 30), return an empty array [].
- Return ONLY the JSON array, no markdown, no explanation outside the array.`;

    // 3. Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: transcription },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    // 4. Parse the AI response - handle markdown code blocks
    let recommendations: any[] = [];
    try {
      let jsonStr = content.trim();
      // Strip markdown code fences if present
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      recommendations = JSON.parse(jsonStr);
      if (!Array.isArray(recommendations)) {
        recommendations = [];
      }
    } catch {
      console.error("Failed to parse AI JSON:", content);
      recommendations = [];
    }

    // 5. Enrich recommendations with product IDs and images
    const enriched = recommendations.map((rec: any) => {
      const match = (products || []).find(
        (p: any) => p.title.toLowerCase() === rec.product_name?.toLowerCase()
      );
      return {
        ...rec,
        product_id: match?.id || null,
        images: match?.images || [],
        listing_type: match?.listing_type || "product",
        creation_link: match?.creation_link || null,
      };
    }).filter((r: any) => r.product_id !== null);

    return new Response(JSON.stringify({ recommendations: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("voice-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
