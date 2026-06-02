import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Briefcase, Sparkles, Award, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SuccessStory } from "@/hooks/useSuccessStories";

const typeMeta: Record<string, { label: string; icon: any; color: string }> = {
  job_secured: { label: "Job secured", icon: Briefcase, color: "text-blue-500" },
  freelance_gig: { label: "Freelance gig", icon: Sparkles, color: "text-purple-500" },
  business_launched: { label: "Business launched", icon: TrendingUp, color: "text-emerald-500" },
  certification_earned: { label: "Certification earned", icon: Award, color: "text-amber-500" },
  revenue_milestone: { label: "Revenue milestone", icon: Trophy, color: "text-orange-500" },
};

export const SuccessStoryCard = ({ story }: { story: SuccessStory }) => {
  const meta = typeMeta[story.type] ?? typeMeta.job_secured;
  const Icon = meta.icon;
  const initials = (story.profile?.full_name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      {story.media_url && (
        <div className="aspect-[16/9] bg-muted overflow-hidden">
          <img
            src={story.media_url}
            alt={story.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs">
            <Icon className={`w-3 h-3 ${meta.color}`} />
            {meta.label}
          </Badge>
          {story.status === "featured" && (
            <Badge className="text-xs">Featured</Badge>
          )}
        </div>
        <h3 className="font-semibold leading-tight">{story.title}</h3>
        {story.body && (
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {story.body}
          </p>
        )}
        {story.amount && (
          <div className="text-sm font-medium tabular-nums">
            {story.currency ?? "USD"} {story.amount.toLocaleString()}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6">
              <AvatarImage src={story.profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {story.profile?.full_name ?? "DIM member"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
