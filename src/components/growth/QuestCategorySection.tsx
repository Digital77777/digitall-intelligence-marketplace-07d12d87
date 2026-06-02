import { QuestCard } from "@/components/programs/QuestCard";
import { Progress } from "@/components/ui/progress";

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  icon: string;
  difficulty: string;
  status?: "not_started" | "in_progress" | "completed";
  progress?: number;
}

interface Props {
  label: string;
  description: string;
  quests: Quest[];
  onStart?: (id: string) => void;
}

export const QuestCategorySection = ({
  label,
  description,
  quests,
  onStart,
}: Props) => {
  if (quests.length === 0) return null;
  const completed = quests.filter((q) => q.status === "completed").length;
  const pct = Math.round((completed / quests.length) * 100);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{label}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs tabular-nums text-muted-foreground">
            {completed}/{quests.length}
          </div>
        </div>
      </div>
      <Progress value={pct} className="h-1" />
      <div className="grid gap-3 md:grid-cols-2">
        {quests.map((q) => (
          <QuestCard key={q.id} quest={q} onStart={onStart} />
        ))}
      </div>
    </section>
  );
};
