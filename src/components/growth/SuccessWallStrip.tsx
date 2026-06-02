import { Link } from "react-router-dom";
import { Trophy, ArrowRight } from "lucide-react";
import { useSuccessStories } from "@/hooks/useSuccessStories";
import { SuccessStoryCard } from "./SuccessStoryCard";

export const SuccessWallStrip = () => {
  const { data, isLoading } = useSuccessStories({ limit: 6 });
  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Success Wall
        </h2>
        <Link
          to="/growth/success"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-thin">
        {(data ?? []).slice(0, 6).map((s) => (
          <div key={s.id} className="snap-start shrink-0 w-[280px]">
            <SuccessStoryCard story={s} />
          </div>
        ))}
      </div>
    </section>
  );
};
