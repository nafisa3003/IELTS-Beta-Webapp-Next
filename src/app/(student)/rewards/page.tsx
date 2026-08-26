import { createClient } from "@/lib/supabase/server";
import { GamificationRepository } from "@/lib/repositories/gamification.repository";
import { AnimatedFlame } from "@/components/gamification/animated-flame";
import { XpGem } from "@/components/gamification/xp-gem";
import { LevelBadge } from "@/components/gamification/level-badge";
import { AchievementCard } from "@/components/gamification/achievement-card";
import { DailyChallengeCard } from "@/components/gamification/daily-challenge";
import { ProgressRing } from "@/components/gamification/progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendIcon } from "@/components/icons/stat-icons";

function humanize(code: string) {
  return code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function RewardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-sm text-slate">You need to be logged in to view rewards.</p>;
  }

  const repo = new GamificationRepository(supabase);
  const stats = await repo.getAllActivityStats(user.id);

  const { xpTotal, streak, achievements, recentXp, levelInfo, challenge } = stats;

  // All possible achievements with unlock status
  const allAchievementCodes = [
    "first_steps", "vocab_builder", "on_fire", "unstoppable", "legendary",
    "xp_100", "xp_500", "xp_1000",
  ];
  const earnedCodes = new Set(achievements.map((a) => a.code));
  const achievementGrid = allAchievementCodes.map((code) => ({
    code,
    earned: earnedCodes.has(code),
    earnedAt: achievements.find((a) => a.code === code)?.earned_at,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header with Level */}
      <div className="flex items-center gap-4">
        <LevelBadge level={levelInfo.level} title={levelInfo.title} size="lg" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Rewards</h1>
          <p className="text-sm text-slate">
            {levelInfo.title} · {xpTotal} XP total
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-soft">Level {levelInfo.level}</span>
          <span className="text-sm font-bold text-slate-soft">Level {levelInfo.level + 1}</span>
        </div>
        <div className="h-4 bg-mist rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full 
              transition-all duration-1000 ease-out animate-progress-fill"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate mt-2 text-center">
          {levelInfo.xpForNextLevel - levelInfo.currentXp} XP to next level
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total XP */}
        <div className="rounded-2xl bg-surface p-6 shadow-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="animate-bounce-slow">
              <XpGem size={40} />
            </div>
            <div>
              <p className="text-xs text-slate-soft font-medium uppercase tracking-wider">Total XP</p>
              <p className="font-display text-3xl font-bold text-green-600">{xpTotal}</p>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-card 
          border-2 border-orange-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <AnimatedFlame size={40} />
            <div>
              <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">Current Streak</p>
              <p className="font-display text-3xl font-bold text-orange-600">
                {streak?.current_streak ?? 0}{" "}
                <span className="text-sm font-normal text-orange-400">days</span>
              </p>
            </div>
          </div>
          {streak && streak.current_streak > 0 && (
            <p className="text-xs text-orange-500 mt-2 font-medium">
              {streak.current_streak >= 7
                ? "🔥 You're on fire!"
                : streak.current_streak >= 3
                ? "🔥 Keep it going!"
                : "🔥 Start building your streak!"}
            </p>
          )}
        </div>

        {/* Longest Streak */}
        <div className="rounded-2xl bg-surface p-6 shadow-card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="text-teal animate-pulse-slow">
              <TrendIcon size={40} className="text-teal" />
            </div>
            <div>
              <p className="text-xs text-slate-soft font-medium uppercase tracking-wider">Longest Streak</p>
              <p className="font-display text-3xl font-bold text-navy dark:text-white">
                {streak?.longest_streak ?? 0}{" "}
                <span className="text-sm font-normal text-slate">days</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenge */}
      <DailyChallengeCard challenge={challenge} />

      {/* Achievements Grid */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-ink flex items-center gap-2">
          🏆 Achievements
          <span className="text-sm font-normal text-slate">
            ({achievements.length}/{allAchievementCodes.length})
          </span>
        </h2>
        {achievements.length === 0 ? (
          <EmptyState
            icon={<span className="text-4xl">🏅</span>}
            title="No badges yet"
            body="Keep practicing to unlock your first one!"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievementGrid.map((a, i) => (
              <AchievementCard
                key={a.code}
                code={a.code}
                earned={a.earned}
                earnedAt={a.earnedAt}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Recent Activity</h2>
        {recentXp.length === 0 ? (
          <EmptyState
            icon={<TrendIcon size={28} />}
            title="No XP earned yet"
            body="Complete a practice test or create flashcards to start earning!"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {recentXp.map((entry, i) => (
              <div
                key={entry.entryid}
                className="flex items-center justify-between rounded-xl border border-mist bg-surface px-5 py-3 
                  hover:shadow-md transition-all duration-200 animate-slide-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <XpGem size={16} />
                  </div>
                  <span className="text-sm font-medium text-ink">{humanize(entry.reason)}</span>
                </div>
                <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                  +{entry.amount} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}