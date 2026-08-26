import type { SupabaseClient } from "@supabase/supabase-js";
import type { XpEntry, Streak, Achievement } from "@/types/gamification";

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export interface DailyChallenge {
  type: string;
  target: number;
  progress: number;
  completed: boolean;
}

const LEVEL_TITLES = [
  "Novice", "Beginner", "Intermediate", "Advanced", 
  "Proficient", "Expert", "Master", "Grandmaster", "Legend"
];

export class GamificationRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getXpTotal(userid: string): Promise<number> {
    const { data, error } = await this.db
      .from("xp_ledger")
      .select("amount")
      .eq("userid", userid);
    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + (row.amount as number), 0);
  }

  async getRecentXp(userid: string, limit = 10): Promise<XpEntry[]> {
    const { data, error } = await this.db
      .from("xp_ledger")
      .select("*")
      .eq("userid", userid)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as XpEntry[];
  }

  async getStreak(userid: string): Promise<Streak | null> {
    const { data, error } = await this.db
      .from("streaks")
      .select("*")
      .eq("userid", userid)
      .maybeSingle();
    if (error) throw error;
    return data as Streak | null;
  }

  async getAchievements(userid: string): Promise<Achievement[]> {
    const { data, error } = await this.db
      .from("achievements")
      .select("*")
      .eq("userid", userid)
      .order("earned_at", { ascending: false });
    if (error) throw error;
    return data as Achievement[];
  }

  async recordActivity(userid: string, activityType: string): Promise<{
    xp_awarded: number;
    streak_updated: boolean;
    current_streak: number;
    longest_streak: number;
  } | null> {
    const { data, error } = await this.db.rpc("record_activity", {
      p_userid: userid,
      p_activity_type: activityType,
    });
    if (error) {
      console.error("record_activity error:", error.message || error);
      return null;
    }
    return data as any;
  }

  getLevelInfo(totalXp: number): LevelInfo {
    const level = Math.floor(totalXp / 100) + 1;
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const currentXp = totalXp - xpForCurrentLevel;
    const progressPercent = Math.min(100, Math.round((currentXp / 100) * 100));
    
    const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);
    
    return {
      level,
      title: LEVEL_TITLES[titleIndex] ?? "",
      currentXp,
      xpForNextLevel,
      progressPercent,
    };
  }

  async getDailyChallenge(userid: string): Promise<DailyChallenge | null> {
    const { data, error } = await this.db.rpc("get_daily_challenge", {
      p_userid: userid,
    });
    if (error) {
      console.error("get_daily_challenge error:", error);
      return null;
    }
    return data as any;
  }

  async getAllActivityStats(userid: string) {
    const [xpTotal, streak, achievements, recentXp, challenge] = await Promise.all([
      this.getXpTotal(userid),
      this.getStreak(userid),
      this.getAchievements(userid),
      this.getRecentXp(userid, 20),
      this.getDailyChallenge(userid),
    ]);

    const levelInfo = this.getLevelInfo(xpTotal);

    return {
      xpTotal,
      streak,
      achievements,
      recentXp,
      levelInfo,
      challenge,
    };
  }
}