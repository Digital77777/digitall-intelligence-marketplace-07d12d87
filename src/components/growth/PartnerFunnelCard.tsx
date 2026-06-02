import { Card, CardContent } from "@/components/ui/card";
import { MousePointerClick, UserPlus, Flame, DollarSign } from "lucide-react";
import { PartnerStats } from "@/hooks/usePartnerStats";

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const PartnerFunnelCard = ({ stats }: { stats: PartnerStats }) => {
  const steps = [
    { icon: MousePointerClick, label: "Clicks", value: fmt(stats.clicks), color: "text-blue-500" },
    { icon: UserPlus, label: "Signups", value: fmt(stats.registrations), color: "text-purple-500" },
    { icon: Flame, label: "Active", value: fmt(stats.active), color: "text-orange-500" },
    { icon: DollarSign, label: "Revenue", value: `$${fmt(stats.revenue)}`, color: "text-emerald-500" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((s) => (
            <div key={s.label} className="rounded-md border border-border/60 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.label}
              </div>
              <div className="text-lg font-semibold tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Conversion rate:{" "}
          <span className="font-medium text-foreground">
            {stats.conversionRate.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
