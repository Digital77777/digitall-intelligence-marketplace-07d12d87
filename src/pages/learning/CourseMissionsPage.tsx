import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEOHead } from "@/components/SEOHead";
import { findCourse, findPath } from "@/data/starterMissionPaths";
import { useMissionProgress } from "@/hooks/useMissionProgress";

const CourseMissionsPage = () => {
  const { pathId = "", courseId = "" } = useParams();
  const navigate = useNavigate();
  const path = findPath(pathId);
  const course = findCourse(pathId, courseId);
  const { isCompleted, courseStats } = useMissionProgress();

  if (!path || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-3">Course not found.</p>
          <Button onClick={() => navigate("/learning-paths")}>Back to paths</Button>
        </div>
      </div>
    );
  }

  const stats = courseStats(path.id, course.id);
  const allDone = stats.pct === 100;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${course.title} — ${path.title}`} description={path.description} />

      <section className={`bg-gradient-to-br ${path.gradient} text-white`}>
        <div className="container mx-auto px-4 sm:px-6 py-7">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:text-white hover:bg-white/10 mb-3 -ml-2"
            onClick={() => navigate(`/learning-paths/${path.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {path.title}
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{course.title}</h1>
          <div className="flex items-center gap-3 mt-3 max-w-md">
            <Progress value={stats.pct} className="h-2 bg-white/20 flex-1" />
            <span className="text-sm font-semibold whitespace-nowrap">
              {stats.completed}/{stats.total}
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-6">
        <h2 className="font-bold text-base mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Missions
        </h2>
        <div className="space-y-2.5">
          {course.missions.map((mission, i) => {
            const done = isCompleted(mission.id);
            const previousDone = i === 0 || isCompleted(course.missions[i - 1].id);
            const locked = !previousDone && !done;
            return (
              <Card
                key={mission.id}
                onClick={() =>
                  !locked &&
                  navigate(`/learning-paths/${path.id}/${course.id}/${mission.id}`)
                }
                className={`p-4 flex items-center gap-3 transition ${
                  locked ? "opacity-60" : "cursor-pointer hover:shadow-md hover:border-primary/40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    done
                      ? "bg-success text-success-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{mission.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {mission.learn}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">
                  +{mission.xp} XP
                </Badge>
                {locked ? (
                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </Card>
            );
          })}
        </div>

        {/* Real Opportunity Card */}
        <Card
          className={`mt-6 p-5 border-2 ${
            allDone
              ? "border-success bg-success/5"
              : "border-dashed border-warning/40 bg-warning/5"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                allDone ? "bg-success text-success-foreground" : "bg-warning/15 text-warning"
              }`}
            >
              <Trophy className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <Badge
                className={`text-[10px] mb-1 ${
                  allDone
                    ? "bg-success/15 text-success border-success/20"
                    : "bg-warning/15 text-warning border-warning/20"
                }`}
              >
                Real Opportunity
              </Badge>
              <p className="font-semibold text-sm">{course.opportunity}</p>
              {!allDone && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Unlocks fully when you complete all missions in this course.
                </p>
              )}
              {allDone && (
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate("/community/share-insight")}
                >
                  Share my work <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default CourseMissionsPage;
