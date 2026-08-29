"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import confetti from "canvas-confetti";
import {
  TrendingUp,
  Zap,
  Gift,
  Trophy,
} from "lucide-react";

import { AnimatedFlame } from "@/components/gamification/animated-flame";
import { XpGem } from "@/components/gamification/xp-gem";
import { LevelBadge } from "@/components/gamification/level-badge";
import { AchievementCard } from "@/components/gamification/achievement-card";
import { DailyChallengeCard } from "@/components/gamification/daily-challenge";
import { EmptyState } from "@/components/ui/empty-state";

type RewardsStats = {
  xpTotal: number;

  streak: {
    current_streak: number;
    longest_streak: number;
  } | null;

  achievements: Array<{
    code: string;
    earned_at?: string | null;
  }>;

  recentXp: Array<{
    entryid: string;
    reason: string;
    amount: number;
  }>;

  levelInfo: {
    level: number;
    title: string;
    currentXp: number;
    xpForNextLevel: number;
    progressPercent: number;
  };

  challenge: {
    type: string;
    target: number;
    progress: number;
    completed: boolean;
  } | null;
};

type RewardsClientProps = {
  stats: RewardsStats;
  mode: "demo" | "real";
};

function XpPopup({
  amount,
  x,
  y,
  onDone,
}: {
  amount: number;
  x: number;
  y: number;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1200);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        y: -60,
        scale: 1.2,
      }}
      exit={{
        opacity: 0,
        y: -100,
        scale: 0.8,
      }}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
      className="fixed pointer-events-none z-[100] flex items-center gap-1 font-black text-xl text-green-600"
      style={{
        left: x,
        top: y,
      }}
    >
      <Zap className="h-5 w-5 fill-xp text-xp" />
      +{amount.toLocaleString()} XP
    </motion.div>
  );
}

function MysteryChest() {
  const [shaking, setShaking] = useState(false);
  const [opened, setOpened] = useState(false);
  const [gems, setGems] = useState(0);

  const handleOpen = () => {
    if (opened || shaking) return;

    setShaking(true);

    setTimeout(() => {
      setShaking(false);
      setOpened(true);

      const reward = Math.floor(Math.random() * 80) + 20;

      setGems(reward);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: 0.6,
        },
        colors: [
          "#3FC7EB",
          "#78FFF9",
          "#F5A524",
          "#FFD700",
        ],
      });
    }, 800);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl border-3 p-6 shadow-hard transition-all cursor-pointer ${
        opened
          ? "bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-400"
          : "bg-white border-ink"
      }`}
      onClick={handleOpen}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={
            shaking
              ? {
                  rotate: [-5, 5, -5, 5, 0],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
          className="text-4xl"
        >
          {opened ? "🎁" : "📦"}
        </motion.div>

        <div className="flex-1">
          <p className="text-sm font-black text-ink uppercase tracking-wider mb-1">
            {opened ? "Chest Opened!" : "Mystery Chest"}
          </p>

          <p className="text-xs font-bold text-slate">
            {opened
              ? `You won ${gems} gems! 🎉`
              : "Tap to open your daily reward"}
          </p>
        </div>

        {opened && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
            }}
            className="flex items-center gap-1 text-gems font-black text-lg"
          >
            <Gift className="h-5 w-5" />
            {gems}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function StreakHeatmap({
  streak,
}: {
  streak: number;
}) {
  const days = Array.from(
    { length: 30 },
    (_, i) => i < streak
  );

  return (
    <div className="rounded-2xl border-3 border-ink bg-white p-5 shadow-hard">
      <div className="flex items-center gap-3 mb-3">
        <AnimatedFlame size={28} />

        <div>
          <p className="text-sm font-black text-ink uppercase tracking-wider">
            Streak Heatmap
          </p>

          <p className="text-xs font-bold text-slate">
            {streak} days strong 🔥
          </p>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {days.map((active, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: i * 0.02,
              type: "spring",
              stiffness: 300,
            }}
            className={`aspect-square rounded-sm ${
              active ? "bg-flame" : "bg-mist"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function LevelUpModal({
  level,
  onClose,
}: {
  level: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: {
        y: 0.5,
      },
      colors: [
        "#F5A524",
        "#FFD700",
        "#FF6B4A",
        "#78FFF9",
      ],
    });

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center backdrop-blur-sm"
    >
      <motion.div
        initial={{
          scale: 0.5,
          y: 100,
        }}
        animate={{
          scale: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, -10, 10, -5, 5, 0],
          }}
          transition={{ duration: 0.6 }}
        >
          <LevelBadge
            level={level}
            title="LEVEL UP!"
            size="lg"
          />
        </motion.div>

        <h2 className="text-5xl font-black text-white mt-6 tracking-tighter">
          LEVEL UP!
        </h2>

        <p className="text-xl text-white/80 font-bold mt-2">
          You reached Level {level}
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center justify-center gap-2 text-gems font-black text-2xl"
        >
          <Gift className="h-6 w-6" />
          +100 Gems
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function humanize(code: string) {
  return code
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RewardsClient({
  stats,
  mode,
}: RewardsClientProps) {
  const [popups, setPopups] = useState<
    {
      id: number;
      amount: number;
      x: number;
      y: number;
    }[]
  >([]);

  const [showLevelUp, setShowLevelUp] =
    useState(false);

  const [xpTotal, setXpTotal] =
    useState(stats.xpTotal);

  const pageRef = useRef<HTMLDivElement | null>(
    null
  );

  const isInView = useInView(pageRef, {
    once: true,
  });

  /*
   * Keep the database XP as the initial value.
   *
   * Interactive demo XP is local UI state only.
   * It does NOT pretend to persist fake rewards into Supabase.
   */
  useEffect(() => {
    setXpTotal(stats.xpTotal);
  }, [stats.xpTotal]);

  useEffect(() => {
    if (isInView) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: {
          y: 0.4,
        },
        colors: [
          "#F5A524",
          "#FFD700",
          "#0EA599",
          "#78FFF9",
        ],
      });
    }
  }, [isInView]);

  const spawnXpPopup = useCallback(
    (amount: number) => {
      const id = Date.now() + Math.random();

      const w =
        typeof window !== "undefined"
          ? window.innerWidth
          : 1200;

      const h =
        typeof window !== "undefined"
          ? window.innerHeight
          : 800;

      const x =
        Math.random() * w * 0.6 + w * 0.2;

      const y = h * 0.5;

      setPopups((prev) => [
        ...prev,
        {
          id,
          amount,
          x,
          y,
        },
      ]);

      setXpTotal((prev) => prev + amount);
    },
    []
  );

  const allAchievementCodes = [
    "first_steps",
    "vocab_builder",
    "on_fire",
    "unstoppable",
    "legendary",
    "xp_100",
    "xp_500",
    "xp_1000",
    "xp_5000",
    "xp_10000",
  ];

  const earnedCodes = new Set(
    stats.achievements.map(
      (achievement) => achievement.code
    )
  );

  const achievementGrid =
    allAchievementCodes.map((code) => ({
      code,
      earned: earnedCodes.has(code),
      earnedAt:
        stats.achievements.find(
            (achievement) =>
            achievement.code === code
        )?.earned_at ?? undefined,
    }));

  const currentStreak =
    stats.streak?.current_streak ?? 0;

  const longestStreak =
    stats.streak?.longest_streak ?? 0;

  const progressToNextLevel = Math.max(
    0,
    stats.levelInfo.xpForNextLevel -
      stats.levelInfo.currentXp
  );

  return (
    <div
      ref={pageRef}
      className="flex flex-col gap-8 max-w-5xl mx-auto relative"
    >
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpModal
            level={stats.levelInfo.level + 1}
            onClose={() =>
              setShowLevelUp(false)
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {popups.map((popup) => (
          <XpPopup
            key={popup.id}
            amount={popup.amount}
            x={popup.x}
            y={popup.y}
            onDone={() =>
              setPopups((prev) =>
                prev.filter(
                  (item) =>
                    item.id !== popup.id
                )
              )
            }
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
        }}
        className="flex items-center gap-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            delay: 0.2,
          }}
        >
          <LevelBadge
            level={stats.levelInfo.level}
            title={stats.levelInfo.title}
            size="lg"
          />
        </motion.div>

        <div className="flex-1">
          <h1 className="font-display text-3xl md:text-4xl font-black text-navy dark:text-white tracking-tighter">
            Rewards Arcade 🎮
          </h1>

          <p className="text-sm font-bold text-slate mt-1">
            {stats.levelInfo.title} ·{" "}
            {xpTotal.toLocaleString()} XP total
          </p>
        </div>

        {/* Keep this button as a cinematic/demo interaction.
            It does not write fake XP to the database. */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => spawnXpPopup(500)}
          className="hidden sm:flex items-center gap-2 bg-xp/10 border-2 border-xp/30 text-xp px-4 py-2 rounded-xl font-black text-sm hover:bg-xp/20 transition-colors"
        >
          <Zap className="h-4 w-4" />
          Test XP Popup
        </motion.button>
      </motion.div>

      {/* Demo-only chest interaction.
          It is intentionally visual/local because the current
          repository does not expose a chest-claim mutation. */}
      <MysteryChest />

      {/* XP Progress */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border-3 border-ink bg-white p-6 shadow-hard"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-black text-slate uppercase tracking-wider">
            Level {stats.levelInfo.level}
          </span>

          <span className="text-sm font-black text-slate uppercase tracking-wider">
            Level {stats.levelInfo.level + 1}
          </span>
        </div>

        <div className="h-6 bg-mist rounded-full overflow-hidden border-2 border-ink relative">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{
              width: `${stats.levelInfo.progressPercent}%`,
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
              delay: 0.5,
            }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shine-sweep" />
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-ink drop-shadow-sm">
              {progressToNextLevel.toLocaleString()} XP
              {" "}to next level
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total XP */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.3,
            type: "spring",
          }}
          whileHover={{
            y: -5,
            scale: 1.02,
          }}
          className="rounded-2xl border-3 border-ink bg-white p-6 shadow-hard hover:shadow-brutalist transition-all cursor-pointer"
          onClick={() => spawnXpPopup(1000)}
        >
          <div className="flex items-center gap-4">
            <div className="animate-gem-sparkle">
              <XpGem size={48} />
            </div>

            <div>
              <p className="text-xs font-black text-slate uppercase tracking-wider">
                Total XP
              </p>

              <motion.p className="font-display text-4xl font-black text-green-600">
                {xpTotal.toLocaleString()}
              </motion.p>
            </div>
          </div>

          <p className="text-xs font-bold text-slate mt-2">
            Click to earn bonus XP! 🎉
          </p>
        </motion.div>

        {/* Current streak */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.4,
            type: "spring",
          }}
          className="rounded-2xl border-3 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-hard"
        >
          <div className="flex items-center gap-4">
            <AnimatedFlame size={48} />

            <div>
              <p className="text-xs font-black text-orange-600 uppercase tracking-wider">
                Current Streak
              </p>

              <p className="font-display text-4xl font-black text-orange-600">
                {currentStreak}{" "}
                <span className="text-base font-normal text-orange-400">
                  days
                </span>
              </p>
            </div>
          </div>

          {currentStreak > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-orange-500 mt-2 font-black"
            >
              {currentStreak >= 7
                ? "🔥 You're on fire! Keep the streak alive!"
                : "🔥 Keep it going! Don't break the chain!"}
            </motion.p>
          )}
        </motion.div>

        {/* Heatmap */}
        <StreakHeatmap
          streak={currentStreak}
        />

        {/* Longest streak */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.5,
            type: "spring",
          }}
          className="rounded-2xl border-3 border-ink bg-white p-6 shadow-hard"
        >
          <div className="flex items-center gap-4">
            <div className="text-teal animate-pulse-glow">
              <Trophy className="h-10 w-10" />
            </div>

            <div>
              <p className="text-xs font-black text-slate uppercase tracking-wider">
                Longest Streak
              </p>

              <p className="font-display text-4xl font-black text-navy dark:text-white">
                {longestStreak}{" "}
                <span className="text-base font-normal text-slate">
                  days
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Challenge */}
      <DailyChallengeCard
        challenge={stats.challenge}
      />

      {/* Achievements */}
      <section>
        <h2 className="mb-4 font-display text-2xl font-black text-ink flex items-center gap-2 tracking-tighter">
          <Trophy className="h-6 w-6 text-xp" />
          Achievements

          <span className="text-sm font-normal text-slate">
            ({stats.achievements.length}/
            {allAchievementCodes.length})
          </span>
        </h2>

        {stats.achievements.length === 0 ? (
          <EmptyState
            icon={
              <span className="text-4xl">
                🏅
              </span>
            }
            title="No badges yet"
            body="Keep practicing to unlock your first one!"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {achievementGrid.map(
              (achievement, i) => (
                <AchievementCard
                  key={achievement.code}
                  code={achievement.code}
                  earned={achievement.earned}
                  earnedAt={
                    achievement.earnedAt
                  }
                  index={i}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 font-display text-2xl font-black text-ink tracking-tighter">
          Recent Activity
        </h2>

        {stats.recentXp.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={28} />}
            title="No XP earned yet"
            body="Complete a practice test or create flashcards to start earning!"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {stats.recentXp.map(
              (entry, i) => (
                <motion.div
                  key={entry.entryid}
                  initial={{
                    opacity: 0,
                    x: -30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="flex items-center justify-between rounded-xl border-2 border-ink bg-white px-5 py-3 shadow-hard hover:shadow-brutalist transition-all cursor-pointer"
                  onClick={() =>
                    spawnXpPopup(
                      entry.amount
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-200">
                      <XpGem size={16} />
                    </div>

                    <span className="text-sm font-black text-ink">
                      {humanize(
                        entry.reason
                      )}
                    </span>
                  </div>

                  <motion.span
                    whileHover={{
                      scale: 1.1,
                    }}
                    className="font-black text-green-600 bg-green-50 border-2 border-green-200 px-3 py-1 rounded-full text-xs"
                  >
                    +
                    {entry.amount.toLocaleString()}{" "}
                    XP
                  </motion.span>
                </motion.div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
