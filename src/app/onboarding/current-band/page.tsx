"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveOnboarding } from "../action";

const BAND_SCORES = [
  "1.0", "1.5", "2.0", "2.5", "3.0", "3.5",
  "4.0", "4.5", "5.0", "5.5", "6.0", "6.5",
  "7.0", "7.5", "8.0", "8.5", "9.0",
];

export default function CurrentBandPage() {
  const router = useRouter();
  const [hasTaken, setHasTaken] = useState<boolean | null>(null);
  const [currentBand, setCurrentBand] = useState("");
  const [saving, setSaving] = useState(false);

  // Load existing data from Supabase on mount
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_onboarding")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        if (data.has_taken_ielts !== null) setHasTaken(data.has_taken_ielts);
        if (data.current_band) setCurrentBand(String(data.current_band));
      }
    }
    load();
  }, []);

  async function handleContinue() {
    if (hasTaken === null) return;
    setSaving(true);

    try {
      await saveOnboarding({
        has_taken_ielts: hasTaken,
        current_band: hasTaken && currentBand ? parseFloat(currentBand) : null,
        onboarding_step: 1,
      });
      router.push("/onboarding/target-band");
    } catch (err) {
      console.error(err);
      // You could show a toast here
    } finally {
      setSaving(false);
    }
  }

  const canContinue =
    hasTaken !== null && (hasTaken === false || (hasTaken === true && currentBand !== ""));

  return (
    <div className="w-full">
      <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-[32px]">
        Have you taken the IELTS test before?
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate">
        This helps us understand where you&rsquo;re starting from so we can
        personalize your practice.
      </p>

      <div className="mt-8 space-y-3">
        <ChoiceCard
          selected={hasTaken === true}
          onClick={() => setHasTaken(true)}
          title="Yes, I have a score"
          subtitle="I've taken the test and know my band"
        />
        <ChoiceCard
          selected={hasTaken === false}
          onClick={() => {
            setHasTaken(false);
            setCurrentBand("");
          }}
          title="No, I'm new to IELTS"
          subtitle="I'm just starting my preparation"
        />
      </div>

      {hasTaken === true && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-ink mb-2">
            What was your latest band score?
          </label>
          <div className="relative">
            <select
              value={currentBand}
              onChange={(e) => setCurrentBand(e.target.value)}
              className="w-full h-12 px-4 pr-10 rounded-xl border border-mist bg-white text-ink appearance-none focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all cursor-pointer"
            >
              <option value="" disabled>Select your band score</option>
              {BAND_SCORES.map((score) => (
                <option key={score} value={score}>Band {score}</option>
              ))}
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate" width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {hasTaken === false && (
        <div className="mt-6 rounded-xl bg-teal/5 border border-teal/10 p-4 text-sm leading-6 text-slate">
          That&rsquo;s perfectly okay! Most of our students start from scratch.
          We&rsquo;ll build your skills from the ground up.
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!canContinue || saving}
        className="mt-8 w-full h-12 rounded-lg bg-teal px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-teal-deep hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving…" : "Continue"}
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