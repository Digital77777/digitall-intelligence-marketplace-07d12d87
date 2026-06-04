import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Payload {
  creator_type: string;
  project_details: Record<string, unknown>;
  goals: string[];
  business_stage: string;
  revenue_stage: string;
  skills: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You are an AI strategist for the Digital Intelligence Marketplace (DIM).
Given a creator's onboarding answers, classify them, score them, and recommend resources.
Pick recommendations from these DIM surfaces ONLY:
- Learning Paths: Foundation, Practical Skills, Technical Developer, Business Careers, AI Entrepreneurship, AI Product Design, Applied AI Industry, Advanced Technical AI, Responsible AI
- Marketplace categories: AI Tools, SaaS, Templates, Courses, Datasets, Automations, APIs, Services
- Community groups: Builders, Founders, Designers, Developers, Marketers, Researchers, Educators
- Growth opportunities: Referral Program, Creator Challenges, Quests, Ambassador Program, Success Wall, Partner Program
Return concise, actionable picks.`;

    const tools = [{
      type: 'function',
      function: {
        name: 'creator_recommendations',
        description: 'Classify and recommend resources for a creator',
        parameters: {
          type: 'object',
          properties: {
            creator_category: { type: 'string' },
            creator_score: { type: 'number' },
            ai_summary: { type: 'string' },
            recommended_paths: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, reason: { type: 'string' } }, required: ['title', 'reason'] } },
            recommended_marketplace: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, reason: { type: 'string' } }, required: ['category', 'reason'] } },
            recommended_communities: { type: 'array', items: { type: 'object', properties: { group: { type: 'string' }, reason: { type: 'string' } }, required: ['group', 'reason'] } },
            growth_opportunities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, reason: { type: 'string' } }, required: ['name', 'reason'] } },
            dashboard_config: {
              type: 'object',
              properties: {
                primary_focus: { type: 'string' },
                widgets: { type: 'array', items: { type: 'string' } },
                next_action: { type: 'string' },
              },
              required: ['primary_focus', 'widgets', 'next_action'],
            },
          },
          required: ['creator_category', 'creator_score', 'ai_summary', 'recommended_paths', 'recommended_marketplace', 'recommended_communities', 'growth_opportunities', 'dashboard_config'],
          additionalProperties: false,
        },
      },
    }];

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Creator onboarding answers:\n${JSON.stringify(body, null, 2)}\n\nReturn the recommendations now.` },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'creator_recommendations' } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const t = await resp.text();
      console.error('AI gateway error', resp.status, t);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error('No recommendations returned');
    const parsed = JSON.parse(args);

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('creator-onboarding-ai error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
