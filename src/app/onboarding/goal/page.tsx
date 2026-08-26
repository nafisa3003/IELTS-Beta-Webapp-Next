"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveOnboarding } from "../action";

const TEST_TYPES = [
  { id: "academic" as const, title: "IELTS Academic", subtitle: "For university study and professional registration" },
  { id: "general" as const, title: "IELTS General Training", subtitle: "For work experience, training programs, and migration" },
];

const FOCUS_AREAS = [
  { id: "all", label: "All skills" },
  { id: "speaking", label: "Speaking" },
  { id: "writing", label: "Writing" },
  { id: "reading", label: "Reading" },
  { id: "listening", label: "Listening" },
] as const;

export default function GoalPage() {
  const router = useRouter();
  const [testType, setTestType] = useState<"academic" | "general" | "">("");
  const [examDate, setExamDate] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>(["all"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_onboarding")
        .select("test_type, exam_date, focus_areas")
        .eq("user_id", user.id)
        .single();

      if (data) {
        if (data.test_type) setTestType(data.test_type);
        if (data.exam_date) setExamDate(data.exam_date);
        if (data.focus_areas?.length) setFocusAreas(data.focus_areas);
      }
    }
    load();
  }, []);

  function toggleFocus(areaId: string) {
    if (areaId === "all") {
      setFocusAreas(["all"]);
      return;
    }
    setFocusAreas((prev) => {
      const withoutAll = prev.filter((a) => a !== "all");
      if (withoutAll.includes(areaId)) {
        const next = withoutAll.filter((a) => a !== areaId);
        return next.length === 0 ? ["all"] : next;
      }
      return [...withoutAll, areaId];
    });
  }

  async function handleFinish() {
    if (!testType) return;
    setSaving(true);

    try {
      await saveOnboarding({
        test_type: testType,
        exam_date: examDate || null,
        focus_areas: focusAreas,
        onboarding_step: 3,
        onboarding_completed: true,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const canFinish = testType !== "";
  const daysUntil = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="w-full">
      <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-[32px]">
        Final details
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate">
        Tell us about your test so we can build the perfect study plan.
      </p>

      <div className="mt-8 space-y-3">
        <p className="text-sm font-medium text-ink mb-1">Which test are you preparing for?</p>
        {TEST_TYPES.map((type) => (
          <ChoiceCard
            key={type.id}
            selected={testType === type.id}
            onClick={() => setTestType(type.id)}
            title={type.title}
            subtitle={type.subtitle}
          />
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-ink mb-2">
          When do you plan to take the exam? <span className="text-slate-soft font-normal">(optional)</span>
        </label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full h-12 px-4 rounded-xl border border-mist bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all cursor-pointer"
        />
        {daysUntil !== null && daysUntil > 0 && (
          <p className="mt-2 text-xs text-teal font-medium">
            {daysUntil} {daysUntil === 1 ? "day" : "days"} to go — let's make them count!
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-ink mb-3">
          What do you want to focus on? <span className="text-slate-soft font-normal">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((area) => {
            const isSelected = focusAreas.includes(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleFocus(area.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-teal text-white shadow-sm"
                    : "bg-white border border-mist text-slate hover:border-slate-soft"
                }`}
              >
                {area.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleFinish}
        disabled={!canFinish || saving}
        className="mt-8 w-full h-12 rounded-lg bg-teal px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-teal-deep hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Getting started…" : "Get started"}
      </button>
    </div>
  );
}

function ChoiceCard({ selected, onClick, title, subtitle }: {
  selected: boolean; onClick: () => void; title: string; subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
        selected
          ? "border-teal bg-teal/[0.04] shadow-sm"
          : "border-mist bg-white hover:border-slate-soft"
      }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        selected ? "border-teal" : "border-slate-soft"
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-teal" />}
      </div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-slate mt-0.5">{subtitle}</p>
      </div>
    </button>
  );
}