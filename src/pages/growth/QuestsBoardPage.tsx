import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityPrograms } from "@/hooks/useCommunityPrograms";
import { SEOHead } from "@/components/SEOHead";
import { QuestCategorySection } from "@/components/growth/QuestCategorySection";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { key: string; label: string; description: string }[] = [
  { key: "onboarding", label: "Onboarding", description: "Set up your profile so the community can find you." },
  { key: "learning", label: "Learning", description: "Build skills lesson by lesson." },
  { key: "creator", label: "Building", description: "Ship projects, listings, and challenges." },
  { key: "community", label: "Community", description: "Show up. Help others. Be present." },
  { key: "engagement", label: "Growth", description: "Invite the world. Earn together." },
];

export default function QuestsBoardPage() {
  const { user, loading: authLoading } = useAuth();
  const { quests, loading, startQuest } = useCommunityPrograms();

  const grouped = useMemo(() => {
    const map: Record<string, typeof quests> = {};
    for (const c of CATEGORIES) map[c.key] = [];
    for (const q of quests) {
      (map[q.category] ??= []).push(q);
    }
    return map;
  }, [quests]);

  const handleStart = async (id: string) => {
    const r = await startQuest(id);
    if (r.error) toast.error(r.error);
    else toast.success("Quest started!");
  };

  if (authLoading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6 animate-fade-in">
      <SEOHead title="Quests — DIM Growth Hub" description="Complete quests across onboarding, learning, building, community, and growth to earn XP, badges, and unlock new opportunities." />
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Quests</p>
        <h1 className="text-2xl md:text-3xl font-bold">Progress through DIM</h1>
        <p className="text-sm text-muted-foreground">
          Every action earns XP, builds your badges, and raises your DIM career score.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((c) => (
            <QuestCategorySection
              key={c.key}
              label={c.label}
              description={c.description}
              quests={grouped[c.key] ?? []}
              onStart={handleStart}
            />
          ))}
        </div>
      )}
    </main>
  );
}
