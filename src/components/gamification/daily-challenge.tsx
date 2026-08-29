"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProgressRing } from "./progress-ring";
import { XpGem } from "./xp-gem";

interface DailyChallengeProps {
  challenge: {
    type: string;
    target: number;
    progress: number;
    completed: boolean;
  } | null;
}

const CHALLENGE_NAMES: Record<string, string> = {
  complete_test: "Complete a practice test",
  create_vocab: "Create vocabulary cards",
  save_words: "Save new words",
  study_lesson: "Study a lesson",
};

export function DailyChallengeCard({
  challenge,
}: DailyChallengeProps) {
  if (!challenge) return null;

  const percent =
    challenge.target > 0
      ? Math.min(
          100,
          Math.round(
            (challenge.progress / challenge.target) * 100
          )
        )
      : 0;

  const isComplete = challenge.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
      }}
      className={`rounded-2xl p-5 shadow-hard border-3 transition-all duration-300 ${
        isComplete
          ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-400"
          : "bg-white border-ink"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Progress ring */}
        <ProgressRing
          progress={percent}
          size={60}
          strokeWidth={5}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
          >
            {isComplete ? (
              <span className="text-lg">✅</span>
            ) : (
              <span className="text-lg">🎯</span>
            )}
          </motion.div>
        </ProgressRing>

        {/* Challenge information */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">
            Daily Challenge
          </p>

          <p className="font-display font-black text-ink">
            {CHALLENGE_NAMES[challenge.type] ||
              challenge.type}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2.5 bg-mist rounded-full overflow-hidden border border-mist">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${percent}%`,
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                }}
              />
            </div>

            <span className="text-xs font-black text-slate tabular-nums">
              {challenge.progress}/
              {challenge.target}
            </span>
          </div>
        </div>

        {/* XP reward */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <XpGem size={20}/>

          <span className="text-xs font-black text-green-600">
            +50
          </span>
        </div>
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
            }}
            transition={{
              type: "spring",
              stiffness: 250,
            }}
            className="mt-3 text-center text-sm font-black text-green-600"
          >
            🎉 Challenge complete! +50 XP earned!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
