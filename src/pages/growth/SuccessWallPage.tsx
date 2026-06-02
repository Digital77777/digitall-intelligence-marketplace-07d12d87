import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSuccessStories, SuccessStoryType } from "@/hooks/useSuccessStories";
import { SEOHead } from "@/components/SEOHead";
import { SuccessStoryCard } from "@/components/growth/SuccessStoryCard";
import { ShareWinDialog } from "@/components/growth/ShareWinDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

const TYPES: { value: SuccessStoryType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "job_secured", label: "Jobs" },
  { value: "freelance_gig", label: "Freelance" },
  { value: "business_launched", label: "Businesses" },
  { value: "certification_earned", label: "Certifications" },
  { value: "revenue_milestone", label: "Revenue" },
];

export default function SuccessWallPage() {
  const { user, loading } = useAuth();
  const [filter, setFilter] = useState<SuccessStoryType | "all">("all");
  const { data, isLoading } = useSuccessStories({ type: filter });

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl space-y-5 animate-fade-in">
      <SEOHead title="Success Wall — DIM Growth Hub" description="Real wins from real DIM members: jobs secured, freelance gigs won, businesses launched, certifications earned, and revenue milestones." />
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">DIM Wins</p>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Success Wall
          </h1>
          <p className="text-sm text-muted-foreground">
            Proof of progress from the DIM community. Share yours.
          </p>
        </div>
        <ShareWinDialog />
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <Button
            key={t.value}
            size="sm"
            variant={filter === t.value ? "default" : "outline"}
            onClick={() => setFilter(t.value)}
            className="shrink-0"
          >
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="border border-dashed rounded-md p-12 text-center text-sm text-muted-foreground">
          No wins in this category yet. Be the first to share.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => <SuccessStoryCard key={s.id} story={s} />)}
        </div>
      )}
    </main>
  );
}
