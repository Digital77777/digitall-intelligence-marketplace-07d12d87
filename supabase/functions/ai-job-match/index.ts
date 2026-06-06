// AI Job Matching engine. Scores opportunities against a candidate's
// completed/in-progress certifications, skills, badges, projects, interests,
// and learning progress. Returns ranked matches with match %, matched skills,
// missing skills, and a readiness score.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: string;
  requiredSkills: string[];
  niceToHave: string[];
  preferredCerts: string[];
  summary: string;
}

interface CandidateProfile {
  completedCerts: string[];   // cert slugs
  inProgressCerts: string[];  // cert slugs
  skills: string[];
  badges?: string[];
  projects?: number;
  interests?: string[];
  xp?: number;
  level?: string;
  certProgressAvg?: number;
}

interface Body {
  candidate: CandidateProfile;
  opportunities: Opportunity[];
  topK?: number;
}

const norm = (s: string) => s.toLowerCase().trim();

function deterministicScore(c: CandidateProfile, op: Opportunity) {
  const skillSet = new Set(c.skills.map(norm));
  const required = op.requiredSkills.map(norm);
  const nice = op.niceToHave.map(norm);

  const matchedSkills = required.filter((s) => skillSet.has(s));
  const missingSkills = required.filter((s) => !skillSet.has(s));
  const niceMatched = nice.filter((s) => skillSet.has(s));

  const skillScore = required.length === 0 ? 100 : (matchedSkills.length / required.length) * 100;
  const niceBonus = nice.length === 0 ? 0 : (niceMatched.length / nice.length) * 10;

  const certHit = op.preferredCerts.some((c2) => c.completedCerts.includes(c2)) ? 15 : 0;
  const certInProgress = op.preferredCerts.some((c2) => c.inProgressCerts.includes(c2)) ? 8 : 0;

  const projectBonus = Math.min(5, (c.projects || 0));
  const learningBonus = Math.min(10, Math.round((c.certProgressAvg || 0) / 10));

  const match = Math.min(
    100,
    Math.round(skillScore * 0.7 + niceBonus + certHit + certInProgress + projectBonus * 0.4 + learningBonus * 0.3)
  );

  // Readiness considers cert depth + learning progress + project signal.
  const readiness = Math.min(
    100,
    Math.round(
      (matchedSkills.length / Math.max(1, required.length)) * 60 +
        (c.completedCerts.length > 0 ? 15 : 0) +
        Math.min(15, (c.certProgressAvg || 0) / 7) +
        Math.min(10, (c.projects || 0) * 2)
    )
  );

  // Original (non-normalised) labels for UI display.
  const originalRequired = op.requiredSkills;
  const matchedSkillsOrig = originalRequired.filter((s) => skillSet.has(norm(s)));
  const missingSkillsOrig = originalRequired.filter((s) => !skillSet.has(norm(s)));

  return {
    opportunityId: op.id,
    match,
    readiness,
    matchedSkills: matchedSkillsOrig,
    missingSkills: missingSkillsOrig,
    certBoost: certHit > 0,
    rationale: '',
  };
}

async function aiRerank(scored: any[], candidate: CandidateProfile, opps: Opportunity[]) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey || scored.length === 0) return scored;

  const topForRationale = scored.slice(0, 8);
  const oppMap = new Map(opps.map((o) => [o.id, o]));

  try {
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI career advisor. For each opportunity, write ONE short rationale (≤22 words) explaining why it fits or how to close gaps. Return JSON only.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              candidate: {
                skills: candidate.skills,
                completedCerts: candidate.completedCerts,
                level: candidate.level,
                xp: candidate.xp,
              },
              opportunities: topForRationale.map((s) => ({
                id: s.opportunityId,
                title: oppMap.get(s.opportunityId)?.title,
                matched: s.matchedSkills,
                missing: s.missingSkills,
              })),
            }),
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'rationales',
              description: 'Return one-line rationale per opportunity id.',
              parameters: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        rationale: { type: 'string' },
                      },
                      required: ['id', 'rationale'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['items'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'rationales' } },
      }),
    });

    if (!res.ok) {
      console.error('AI rerank failed', res.status, await res.text());
      return scored;
    }

    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return scored;
    const parsed = JSON.parse(args);
    const map = new Map<string, string>((parsed.items || []).map((i: any) => [i.id, i.rationale]));
    return scored.map((s) => ({ ...s, rationale: map.get(s.opportunityId) || '' }));
  } catch (e) {
    console.error('rerank exception', e);
    return scored;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.candidate || !Array.isArray(body?.opportunities)) {
      return new Response(JSON.stringify({ error: 'Invalid body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const scored = body.opportunities
      .map((op) => deterministicScore(body.candidate, op))
      .sort((a, b) => b.match - a.match);

    const topK = body.topK ?? 12;
    const top = scored.slice(0, topK);
    const withRationale = await aiRerank(top, body.candidate, body.opportunities);

    return new Response(JSON.stringify({ matches: withRationale }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('ai-job-match error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
