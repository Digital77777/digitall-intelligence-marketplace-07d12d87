import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Network } from 'lucide-react';
import { useSkillsGraph } from '@/hooks/useJobMatches';

export const SkillsGraph = () => {
  const { domains, employability } = useSkillsGraph();
  const max = Math.max(1, ...domains.map((d) => d.level));

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Your Skills Graph</h3>
          </div>
          <div className="text-xs text-muted-foreground">Live from certifications</div>
        </div>

        {/* Radar-ish bar visualization (compact) */}
        <div className="space-y-2.5">
          {domains.map((d) => (
            <div key={d.domain} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium truncate">{d.domain}</span>
                <span className="tabular-nums text-muted-foreground">{d.level}/100</span>
              </div>
              <Progress value={(d.level / max) * 100} className="h-1.5" />
            </div>
          ))}
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Employability score</span>
          <span className="text-lg font-bold tabular-nums">{employability}<span className="text-xs text-muted-foreground">/100</span></span>
        </div>
      </CardContent>
    </Card>
  );
};
