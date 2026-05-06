import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  PartyPopper,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { findCourse, findMission, findPath } from "@/data/starterMissionPaths";
import { useMissionProgress } from "@/hooks/useMissionProgress";

type Step = "learn" | "do" | "output" | "reward";

const MissionPage = () => {
  const { pathId = "", courseId = "", missionId = "" } = useParams();
  const navigate = useNavigate();
  const path = findPath(pathId);
  const course = findCourse(pathId, courseId);
  const mission = findMission(pathId, courseId, missionId);

  const { completeMission, isCompleted, getOutput } = useMissionProgress();

  const [step, setStep] = useState<Step>("learn");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const alreadyDone = mission ? isCompleted(mission.id) : false;
  const previousOutput = mission ? getOutput(mission.id) : null;

  useEffect(() => {
    if (alreadyDone && previousOutput) {
      setOutput(previousOutput);
    }
  }, [alreadyDone, previousOutput]);

  const nextMission = useMemo(() => {
    if (!course || !mission) return null;
    const idx = course.missions.findIndex((m) => m.id === mission.id);
    return idx >= 0 && idx < course.missions.length - 1 ? course.missions[idx + 1] : null;
  }, [course, mission]);

  if (!path || !course || !mission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-3">Mission not found.</p>
          <Button onClick={() => navigate("/learning-paths")}>Back to paths</Button>
        </div>
      </div>
    );
  }

  const runMission = async () => {
    if (!input.trim()) {
      toast({ title: "Add your input first", description: "Tell the AI what to work with." });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("mission-ai", {
        body: {
          systemPrompt: mission.systemPrompt,
          userInput: input,
          missionTitle: mission.title,
        },
      });
      if (error) throw error;
      const text = (data as any)?.output ?? "";
      if (!text) throw new Error("No output returned");
      setOutput(text);
      setStep("output");
      // Auto-save
      await completeMission(path.id, course.id, mission.id, text);
    } catch (e: any) {
      toast({
        title: "AI couldn't run",
        description: e.message || "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const goNext = () => {
    if (nextMission) {
      navigate(`/learning-paths/${path.id}/${course.id}/${nextMission.id}`);
      setStep("learn");
      setInput("");
      setOutput("");
    } else {
      navigate(`/learning-paths/${path.id}/${course.id}`);
    }
  };

  const STEPS: { key: Step; label: string }[] = [
    { key: "learn", label: "Learn" },
    { key: "do", label: "Do" },
    { key: "output", label: "Output" },
    { key: "reward", label: "Reward" },
  ];

  return (
    <div className="min-h-screen bg-background pb-10">
      <SEOHead title={`${mission.title} — Mission`} description={mission.learn} />

      {/* Header */}
      <section className={`bg-gradient-to-br ${path.gradient} text-white`}>
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:text-white hover:bg-white/10 mb-3 -ml-2"
            onClick={() => navigate(`/learning-paths/${path.id}/${course.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {course.title}
          </Button>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
              Mission · +{mission.xp} XP
            </Badge>
            {alreadyDone && (
              <Badge className="bg-success/20 text-white border-white/30 text-[10px]">
                ✓ Completed
              </Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            {mission.title}
          </h1>

          {/* Step indicator */}
          <div className="mt-4 flex items-center gap-1.5">
            {STEPS.map((s, i) => {
              const activeIdx = STEPS.findIndex((x) => x.key === step);
              const isDone = i < activeIdx || (alreadyDone && i < 3);
              const isActive = s.key === step;
              return (
                <div key={s.key} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`h-1.5 flex-1 rounded-full transition ${
                      isActive ? "bg-white" : isDone ? "bg-white/80" : "bg-white/25"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] mt-1.5 text-white/80">
            {STEPS.map((s) => (
              <span key={s.key} className="flex-1 text-center">{s.label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-4 sm:px-6 max-w-2xl py-6 space-y-4">
        {/* LEARN */}
        {step === "learn" && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Play className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-base">1. Learn</h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{mission.learn}</p>
            <Button className="w-full mt-5" onClick={() => setStep("do")}>
              Got it — let's do it <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Card>
        )}

        {/* DO */}
        {step === "do" && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-base">2. Do</h2>
            </div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {mission.inputLabel}
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mission.inputPlaceholder}
              rows={4}
              className="mt-1.5"
              maxLength={2000}
            />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">
              {input.length}/2000
            </p>
            <Button
              className="w-full mt-3"
              onClick={runMission}
              disabled={generating || !input.trim()}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> AI is working...
                </>
              ) : (
                <>Generate output <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setStep("learn")}
            >
              Back to lesson
            </Button>
          </Card>
        )}

        {/* OUTPUT */}
        {step === "output" && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-base">3. Your Output</h2>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
              {output}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("do")}
              >
                Tweak input
              </Button>
              <Button className="flex-1" onClick={() => setStep("reward")}>
                Claim reward <Trophy className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Card>
        )}

        {/* REWARD */}
        {step === "reward" && (
          <Card className="p-6 text-center border-success/30 bg-gradient-to-br from-success/10 via-background to-warning/10">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-3">
              <PartyPopper className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold mb-1">Mission complete!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You earned <span className="font-bold text-warning">+{mission.xp} XP</span>
            </p>
            <Badge className="bg-warning/15 text-warning border-warning/20 mb-5">
              <Trophy className="h-3 w-3 mr-1" /> Builder Badge
            </Badge>
            <div className="space-y-2">
              {nextMission ? (
                <Button className="w-full" onClick={goNext}>
                  Next mission: {nextMission.title} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button className="w-full" onClick={goNext}>
                  Back to course <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setStep("output")}
              >
                Review my output
              </Button>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
};

export default MissionPage;
