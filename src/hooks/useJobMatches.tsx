import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CERTIFICATIONS, getCertBySlug } from '@/data/certifications';
import { OPPORTUNITIES, type Opportunity } from '@/data/jobOpportunities';
import { useCertificationProgress } from '@/hooks/useCertificationProgress';

export interface JobMatch {
  opportunityId: string;
  match: number;
  readiness: number;
  matchedSkills: string[];
  missingSkills: string[];
  certBoost: boolean;
  rationale: string;
  opportunity: Opportunity;
}

export function useJobMatches() {
  const { user } = useAuth();
  const { items, stats } = useCertificationProgress();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidate = useMemo(() => {
    const completedCerts: string[] = [];
    const inProgressCerts: string[] = [];
    const skillSet = new Set<string>();

    CERTIFICATIONS.forEach((c) => {
      const p = items[c.slug];
      if (!p) return;
      if (p.status === 'completed') {
        completedCerts.push(c.slug);
        c.skills.forEach((s) => skillSet.add(s));
      } else if (p.status === 'in_progress') {
        inProgressCerts.push(c.slug);
        // Half-credit skills proportional to progress (>30%)
        if ((p.progress_pct || 0) >= 30) c.skills.forEach((s) => skillSet.add(s));
      }
    });

    return {
      completedCerts,
      inProgressCerts,
      skills: Array.from(skillSet),
      projects: completedCerts.length, // proxy
      certProgressAvg: stats.avg,
      xp: stats.xp,
      level: stats.completed >= 5 ? 'AI Specialist' : stats.completed >= 2 ? 'AI Builder' : 'AI Explorer',
    };
  }, [items, stats]);

  const fetchMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-job-match', {
        body: { candidate, opportunities: OPPORTUNITIES, topK: 20 },
      });
      if (fnError) throw fnError;
      const raw = (data as any)?.matches || [];
      const oppMap = new Map(OPPORTUNITIES.map((o) => [o.id, o]));
      setMatches(
        raw
          .map((m: any) => ({ ...m, opportunity: oppMap.get(m.opportunityId)! }))
          .filter((m: JobMatch) => m.opportunity)
      );
    } catch (e: any) {
      console.error('useJobMatches error', e);
      setError(e?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [user, candidate]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  return { matches, loading, error, refresh: fetchMatches, candidate };
}

// Build a skill graph: domains -> level (0-100) derived from completed/in-progress certs.
export function useSkillsGraph() {
  const { items } = useCertificationProgress();

  return useMemo(() => {
    const domainMap: Record<string, { weight: number; count: number; sources: Set<string> }> = {
      'Cloud & Infrastructure': { weight: 0, count: 0, sources: new Set() },
      'Generative AI': { weight: 0, count: 0, sources: new Set() },
      'AI Agents & Automation': { weight: 0, count: 0, sources: new Set() },
      'Business & Strategy': { weight: 0, count: 0, sources: new Set() },
      'Responsible AI': { weight: 0, count: 0, sources: new Set() },
      'Data & ML': { weight: 0, count: 0, sources: new Set() },
    };

    const skillToDomain = (s: string): string | null => {
      const k = s.toLowerCase();
      if (/(cloud|aws|azure|gcp|oci|infra|network)/.test(k)) return 'Cloud & Infrastructure';
      if (/(generative|prompt|bedrock)/.test(k)) return 'Generative AI';
      if (/(agent|workflow|orchestration|automation|tool use|memory)/.test(k)) return 'AI Agents & Automation';
      if (/(strategy|business|roi|governance|change|org|transformation|crm)/.test(k)) return 'Business & Strategy';
      if (/(responsible|ethic|safety)/.test(k)) return 'Responsible AI';
      if (/(ml|machine learning|data|nlp|vision|model)/.test(k)) return 'Data & ML';
      return null;
    };

    CERTIFICATIONS.forEach((c) => {
      const p = items[c.slug];
      if (!p) return;
      const weight = p.status === 'completed' ? 1 : (p.progress_pct || 0) / 100;
      if (weight <= 0) return;
      c.skills.forEach((s) => {
        const d = skillToDomain(s);
        if (!d) return;
        domainMap[d].weight += weight;
        domainMap[d].count += 1;
        domainMap[d].sources.add(c.slug);
      });
    });

    const result = Object.entries(domainMap).map(([domain, v]) => ({
      domain,
      level: Math.min(100, Math.round(v.weight * 30 + v.count * 4)),
      sources: v.sources.size,
    }));

    const employability = Math.round(
      result.reduce((sum, r) => sum + r.level, 0) / Math.max(1, result.length)
    );

    return { domains: result, employability };
  }, [items]);
}
