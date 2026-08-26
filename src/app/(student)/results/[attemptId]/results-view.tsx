"use client";

import { motion } from "framer-motion";
import { TargetIcon, CheckIcon, ListeningIcon, ReadingIcon, WritingIcon, SpeakingIcon } from "@/components/icons/stat-icons";
import type { AssessmentService } from "@/lib/services/assessment-service";

const SKILL_META = [
  { key: "listening", label: "Listening", Icon: ListeningIcon },
  { key: "reading", label: "Reading", Icon: ReadingIcon },
  { key: "writing", label: "Writing", Icon: WritingIcon },
  { key: "speaking", label: "Speaking", Icon: SpeakingIcon },
] as const;

export function ResultsView({ result }: { result: NonNullable<Awaited<ReturnType<AssessmentService["getResult"]>>> }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        {result.overall_band && result.overall_band >= 6.5 ? <CheckIcon size={48} /> : <TargetIcon size={48} />}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <p className="text-sm text-slate-soft">Overall band</p>
        <p className="font-display text-5xl font-bold text-navy dark:text-white">{result.overall_band ?? "—"}</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SKILL_META.map(({ key, label, Icon }, i) => {
          const value = result[key as keyof typeof result] as number | null;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
              className="flex flex-col items-center gap-1.5 rounded-lg bg-surface px-5 py-4 shadow-card"
            >
              <Icon size={20} className="text-teal" />
              <p className="text-xs text-slate-soft">{label}</p>
              <p className="font-display text-2xl font-semibold text-ink">{value ?? "Pending"}</p>
            </motion.div>
          );
        })}
      </div>
      {result.feedback && <p className="max-w-md text-sm text-slate">{result.feedback}</p>}
    </div>
  );
}
