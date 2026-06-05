import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Clock, TrendingUp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Certification } from '@/data/certifications';
import { CertProgress } from '@/hooks/useCertificationProgress';
import { cn } from '@/lib/utils';

interface Props {
  cert: Certification;
  progress?: CertProgress;
  onStart: () => void;
}

const diffColor: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export const CertificationCard = ({ cert, progress, onStart }: Props) => {
  const navigate = useNavigate();
  const status = progress?.status || 'not_started';
  const pct = progress?.progress_pct || 0;
  const isDone = status === 'completed';
  const isActive = status === 'in_progress';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-0.5 cursor-pointer',
        isDone && 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-transparent',
        isActive && 'border-primary/40 bg-gradient-to-br from-primary/5 to-transparent',
      )}
      onClick={() => navigate(`/career-certification/${cert.slug}`)}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <CardContent className="p-4 space-y-3 relative">
        {/* Header: provider badge + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-[11px] shadow-sm">
              {cert.providerCode}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                {cert.provider}
              </div>
              <Badge variant="outline" className={cn('mt-0.5 text-[10px] h-4 px-1.5 font-medium border', diffColor[cert.difficulty])}>
                {cert.difficulty}
              </Badge>
            </div>
          </div>
          {isDone && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {cert.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{cert.duration}</span>
          <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" />{cert.salary}</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {cert.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {s}
            </span>
          ))}
        </div>

        {/* Progress */}
        {status !== 'not_started' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground font-medium">{isDone ? 'Completed' : 'Prep progress'}</span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        )}

        {/* CTA */}
        <Button
          size="sm"
          variant={isDone ? 'outline' : isActive ? 'default' : 'default'}
          className="w-full h-8 text-xs gap-1.5 mt-1"
          onClick={(e) => {
            e.stopPropagation();
            if (status === 'not_started') onStart();
            else navigate(`/career-certification/${cert.slug}`);
          }}
        >
          {isDone ? (<><Award className="h-3.5 w-3.5" />View Certificate</>)
            : isActive ? (<>Continue<ArrowRight className="h-3.5 w-3.5" /></>)
            : (<><Sparkles className="h-3.5 w-3.5" />Start Learning</>)}
        </Button>
      </CardContent>
    </Card>
  );
};
