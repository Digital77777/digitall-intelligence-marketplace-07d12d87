import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { STARTER_PATHS } from "@/data/starterMissionPaths";

export interface MissionRecord {
  id: string;
  path_id: string;
  course_id: string;
  mission_id: string;
  status: string;
  output: string | null;
  xp_awarded: number;
  completed_at: string;
}

export const useMissionProgress = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("mission_progress")
      .select("*")
      .eq("user_id", user.id);
    if (!error && data) setRecords(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeMission = useCallback(
    async (
      pathId: string,
      courseId: string,
      missionId: string,
      output: string
    ) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("mission_progress")
        .upsert(
          {
            user_id: user.id,
            path_id: pathId,
            course_id: courseId,
            mission_id: missionId,
            status: "completed",
            output,
            xp_awarded: 10,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,mission_id" }
        )
        .select()
        .single();
      if (!error && data) {
        setRecords((prev) => {
          const next = prev.filter((r) => r.mission_id !== missionId);
          return [...next, data as any];
        });
      }
      return data;
    },
    [user]
  );

  const isCompleted = (missionId: string) =>
    records.some((r) => r.mission_id === missionId);

  const getOutput = (missionId: string) =>
    records.find((r) => r.mission_id === missionId)?.output ?? null;

  const totalXp = records.reduce((sum, r) => sum + (r.xp_awarded || 0), 0);

  const pathStats = (pathId: string) => {
    const path = STARTER_PATHS.find((p) => p.id === pathId);
    if (!path) return { total: 0, completed: 0, pct: 0 };
    const total = path.courses.reduce((s, c) => s + c.missions.length, 0);
    const completed = records.filter((r) => r.path_id === pathId).length;
    return { total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
  };

  const courseStats = (pathId: string, courseId: string) => {
    const course = STARTER_PATHS.find((p) => p.id === pathId)?.courses.find(
      (c) => c.id === courseId
    );
    if (!course) return { total: 0, completed: 0, pct: 0 };
    const total = course.missions.length;
    const completed = records.filter(
      (r) => r.path_id === pathId && r.course_id === courseId
    ).length;
    return { total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
  };

  return {
    records,
    loading,
    totalXp,
    refresh,
    completeMission,
    isCompleted,
    getOutput,
    pathStats,
    courseStats,
  };
};
