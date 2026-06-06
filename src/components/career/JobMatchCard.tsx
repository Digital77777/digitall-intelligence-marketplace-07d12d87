import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building2, MapPin, Briefcase, Clock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { JobMatch } from '@/hooks/useJobMatches';

const typeLabel: Record<string, string> = {
  full_time: 'Full-time',
  internship: 'Internship',
  freelance: 'Freelance',
  gig: 'Gig',
};

export const JobMatchCard = ({ m }: { m: JobMatch }) => {
  const op = m.opportunity;
  const matchColor =
    m.match >= 85 ? 'text-emerald-500' : m.match >= 65 ? 'text-primary' : 'text-amber-500';

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-[10px]">{typeLabel[op.type] || op.type}</Badge>
              {m.certBoost && (
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Cert match
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight">{op.title}</h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {op.company}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {op.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {op.compensation}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {op.postedDaysAgo === 0 ? 'today' : `${op.postedDaysAgo}d ago`}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className={`text-2xl font-bold tabular-nums ${matchColor}`}>{m.match}%</div>
            <div className="text-[10px] text-muted-foreground">match</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{op.summary}</p>

        {m.rationale && (
          <div className="text-[11px] bg-primary/5 border border-primary/15 rounded-md px-2.5 py-1.5 text-foreground/80">
            <Sparkles className="h-3 w-3 inline mr-1 text-primary" />
            {m.rationale}
          </div>
        )}

        {/* Readiness */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Readiness</span>
            <span className="font-semibold tabular-nums">{m.readiness}/100</span>
          </div>
          <Progress value={m.readiness} className="h-1.5" />
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold mb-1">
              <CheckCircle2 className="h-3 w-3" /> Skills matched ({m.matchedSkills.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {m.matchedSkills.length === 0 && <span className="text-muted-foreground">—</span>}
              {m.matchedSkills.map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-600 font-semibold mb-1">
              <AlertCircle className="h-3 w-3" /> Skills to grow ({m.missingSkills.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {m.missingSkills.length === 0 && <span className="text-muted-foreground">All covered ✨</span>}
              {m.missingSkills.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" className="h-8 text-xs flex-1">Apply</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">Save</Button>
        </div>
      </CardContent>
    </Card>
  );
};
