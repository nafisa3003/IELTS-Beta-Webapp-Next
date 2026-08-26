"use client";

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

export function DailyChallengeCard({ challenge }: DailyChallengeProps) {
  if (!challenge) return null;

  const percent = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  const isComplete = challenge.completed;

  return (
    <div
      className={`rounded-2xl p-5 shadow-card transition-all duration-300 ${
        isComplete
          ? "bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400"
          : "bg-surface border-2 border-mist"
      }`}
    >
      <div className="flex items-center gap-4">
        <ProgressRing progress={percent} size={60} strokeWidth={5}>
          <span className="text-lg">{isComplete ? "✅" : "🎯"}</span>
        </ProgressRing>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-soft uppercase tracking-wider mb-1">Daily Challenge</p>
          <p className="font-display font-semibold text-ink">
            {CHALLENGE_NAMES[challenge.type] || challenge.type}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-mist rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate">
              {challenge.progress}/{challenge.target}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <XpGem size={20} />
          <span className="text-xs font-bold text-green-600">+20</span>
        </div>
      </div>
    </div>
  );
}