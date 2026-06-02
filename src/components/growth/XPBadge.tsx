import { Sparkles, TrendingUp } from "lucide-react";
import { useXP } from "@/hooks/useXP";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface XPBadgeProps {
  className?: string;
  compact?: boolean;
}

export const XPBadge = ({ className, compact }: XPBadgeProps) => {
  const { data } = useXP();
  if (!data) return null;

  if (compact) {
    return (
      <Link
        to="/growth"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 bg-card/60 hover:bg-accent/50 transition-colors text-xs font-medium",
          className
        )}
        aria-label={`${data.total} XP`}
      >
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="tabular-nums">{data.total.toLocaleString()}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/growth"
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md border border-border/60 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-colors",
        className
      )}
    >
      <div className="p-1.5 rounded bg-primary/10">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground capitalize">{data.level}</div>
        <div className="text-sm font-semibold tabular-nums">
          {data.total.toLocaleString()} XP
        </div>
      </div>
      {data.week > 0 && (
        <div className="flex items-center gap-1 text-xs text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          <span className="tabular-nums">+{data.week}</span>
        </div>
      )}
    </Link>
  );
};
