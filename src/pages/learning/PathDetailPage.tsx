import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Sparkles, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/SEOHead";
import { findPath } from "@/data/starterMissionPaths";
import { useMissionProgress } from "@/hooks/useMissionProgress";

const PathDetailPage = () => {
  const { pathId = "" } = useParams();
  const navigate = useNavigate();
  const path = findPath(pathId);
  const { pathStats, courseStats, loading } = useMissionProgress();

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-3">Path not found.</p>
          <Button onClick={() => navigate("/learning-paths")}>Back to paths</Button>
        </div>
      </div>
    );
  }

  const stats = pathStats(path.id);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${path.title} — Learning Path`} description={path.description} />

      {/* Header */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${path.gradient}`}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 text-white">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:text-white hover:bg-white/10 mb-4 -ml-2"
            onClick={() => navigate("/learning-paths")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Paths
          </Button>
          <div className="flex items-start gap-4">
            <div className="text-4xl sm:text-5xl bg-white/15 backdrop-blur w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg">
              {path.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                {path.title}
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-1">{path.description}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 max-w-xl">
            <div className="bg-white/15 backdrop-blur rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Courses</div>
              <div className="text-xl font-bold">{path.courses.length}</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Missions</div>
              <div className="text-xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Done</div>
              <div className="text-xl font-bold">{loading ? "—" : `${stats.pct}%`}</div>
            </div>
          </div>

          <div className="mt-4 max-w-xl">
            <Progress value={stats.pct} className="h-2 bg-white/20" />
          </div>
        </div>
      </section>

      {/* Outcome banner */}
      <section className="container mx-auto px-4 sm:px-6 py-5">
        <Card className="p-4 border-success/30 bg-success/5 flex items-center gap-3">
          <Target className="h-5 w-5 text-success flex-shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-success font-semibold">
              Your Outcome
            </div>
            <div className="text-sm font-medium">{path.outcome}</div>
          </div>
        </Card>
      </section>

      {/* Courses roadmap */}
      <section className="container mx-auto px-4 sm:px-6 pb-16">
        <h2 className="font-bold text-lg sm:text-xl mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Course Roadmap
        </h2>
        <div className="space-y-3">
          {path.courses.map((course, i) => {
            const cstats = courseStats(path.id, course.id);
            const previous = i === 0 ? null : path.courses[i - 1];
            const previousStats = previous ? courseStats(path.id, previous.id) : null;
            const locked = previous && previousStats!.pct < 100 && cstats.completed === 0;
            const done = cstats.pct === 100;

            return (
              <Card
                key={course.id}
                onClick={() => !locked && navigate(`/learning-paths/${path.id}/${course.id}`)}
                className={`relative p-4 sm:p-5 transition border-l-4 ${
                  done
                    ? "border-l-success"
                    : cstats.completed > 0
                    ? "border-l-primary"
                    : "border-l-border"
                } ${locked ? "opacity-60" : "cursor-pointer hover:shadow-md"}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      done
                        ? "bg-success text-success-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base truncate">
                        {course.title}
                      </h3>
                      {done && (
                        <Badge className="text-[10px] bg-success/15 text-success border-success/20">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 max-w-xs">
                        <Progress value={cstats.pct} className="h-1.5" />
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {cstats.completed}/{cstats.total}
                      </span>
                    </div>
                  </div>
                  {locked ? (
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
                {locked && (
                  <p className="text-[11px] text-muted-foreground mt-2 ml-14">
                    Complete "{previous!.title}" to unlock.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PathDetailPage;
