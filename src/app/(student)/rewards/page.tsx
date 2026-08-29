import { createClient } from "@/lib/supabase/server";
import { GamificationRepository } from "@/lib/repositories/gamification.repository";
import RewardsClient from "./rewards-client";

const DEMO_STATS = {
  xpTotal: 24500,
  streak: {
    current_streak: 12,
    longest_streak: 21,
  },
  achievements: [
    { code: "first_steps", earned_at: "2024-01-15" },
    { code: "xp_100", earned_at: "2024-01-20" },
    { code: "xp_500", earned_at: "2024-02-01" },
    { code: "on_fire", earned_at: "2024-02-10" },
  ],
  levelInfo: {
    level: 5,
    title: "Expert",
    currentXp: 24500,
    xpForNextLevel: 50000,
    progressPercent: 49,
  },
  challenge: {
    type: "complete_test",
    target: 1,
    progress: 0,
    completed: false,
  },
  recentXp: [
    {
      entryid: "1",
      reason: "practice_test_completed",
      amount: 1000,
    },
    {
      entryid: "2",
      reason: "daily_login",
      amount: 100,
    },
    {
      entryid: "3",
      reason: "perfect_score_bonus",
      amount: 250,
    },
    {
      entryid: "4",
      reason: "lesson_completed",
      amount: 100,
    },
    {
      entryid: "5",
      reason: "streak_maintained",
      amount: 150,
    },
  ],
};

export default async function RewardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * Real database mode
   *
   * Authenticated users receive their actual gamification data.
   * The repository remains the single source of truth.
   */
  if (user) {
    const repo = new GamificationRepository(supabase);
    const stats = await repo.getAllActivityStats(user.id);

    return (
      <RewardsClient
        stats={stats}
        mode="real"
      />
    );
  }

  /*
   * Demo mode
   *
   * This allows the cinematic rewards page to still be previewed
   * without authentication/database data.
   */
  return (
    <RewardsClient
      stats={DEMO_STATS}
      mode="demo"
    />
  );
}
