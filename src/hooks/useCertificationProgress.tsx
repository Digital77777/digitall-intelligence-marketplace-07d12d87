import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CERTIFICATIONS } from '@/data/certifications';

export interface CertProgress {
  cert_slug: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_pct: number;
  prep_notes: string | null;
  started_at: string;
  completed_at: string | null;
}

export function useCertificationProgress() {
  const { user } = useAuth();
  const [items, setItems] = useState<Record<string, CertProgress>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setItems({}); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('certification_progress')
      .select('cert_slug,status,progress_pct,prep_notes,started_at,completed_at')
      .eq('user_id', user.id);
    const map: Record<string, CertProgress> = {};
    (data || []).forEach((r: any) => { map[r.cert_slug] = r; });
    setItems(map);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const start = useCallback(async (slug: string) => {
    if (!user) return;
    await supabase.from('certification_progress').upsert(
      { user_id: user.id, cert_slug: slug, status: 'in_progress', progress_pct: 5 },
      { onConflict: 'user_id,cert_slug' }
    );
    load();
  }, [user, load]);

  const updateProgress = useCallback(async (slug: string, pct: number) => {
    if (!user) return;
    const isDone = pct >= 100;
    await supabase.from('certification_progress').upsert(
      {
        user_id: user.id,
        cert_slug: slug,
        progress_pct: Math.max(0, Math.min(100, pct)),
        status: isDone ? 'completed' : 'in_progress',
        completed_at: isDone ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,cert_slug' }
    );
    load();
  }, [user, load]);

  const saveNotes = useCallback(async (slug: string, notes: string) => {
    if (!user) return;
    await supabase.from('certification_progress').upsert(
      { user_id: user.id, cert_slug: slug, prep_notes: notes, status: items[slug]?.status || 'in_progress' },
      { onConflict: 'user_id,cert_slug' }
    );
    load();
  }, [user, items, load]);

  // Aggregate stats for the hero
  const stats = (() => {
    const total = CERTIFICATIONS.length;
    const started = Object.values(items).filter(i => i.status !== 'not_started').length;
    const completed = Object.values(items).filter(i => i.status === 'completed').length;
    const avg = started === 0
      ? 0
      : Math.round(
          Object.values(items).reduce((s, i) => s + (i.progress_pct || 0), 0) / started
        );
    const xp = completed * 500 + Object.values(items).reduce((s, i) => s + Math.floor((i.progress_pct || 0) / 10) * 25, 0);
    return { total, started, completed, avg, xp };
  })();

  return { items, loading, start, updateProgress, saveNotes, stats, refresh: load };
}
