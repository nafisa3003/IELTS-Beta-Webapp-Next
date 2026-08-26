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

export default function TargetBandPage() {
  const router = useRouter();
  const [targetBand, setTargetBand] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_onboarding")
        .select("target_band")
        .eq("user_id", user.id)
        .single();

      if (data?.target_band) setTargetBand(String(data.target_band));
    }
    load();
  }, []);

  async function handleContinue() {
    if (!targetBand) return;
    setSaving(true);

    try {
      await saveOnboarding({
        target_band: parseFloat(targetBand),
        onboarding_step: 2,
      });
      router.push("/onboarding/goal");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const bandNum = targetBand ? parseFloat(targetBand) : 0;

  return (
    <div className="w-full">
      <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-[32px]">
        What band score do you need?
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate">
        Different goals require different scores. Select the band you&rsquo;re
        working toward.
      </p>

      <div className="mt-8">
        <label className="block text-sm font-medium text-ink mb-2">
          Target band score
        </label>
        <div className="relative">
          <select
            value={targetBand}
            onChange={(e) => setTargetBand(e.target.value)}
            className="w-full h-12 px-4 pr-10 rounded-xl border border-mist bg-white text-ink appearance-none focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all cursor-pointer"
          >
            <option value="" disabled>Choose your target</option>
            {BAND_SCORES.map((score) => (
              <option key={score} value={score}>Band {score}</option>
            ))}
          </select>
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate" width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {targetBand && (
        <div className="mt-6 rounded-xl bg-mist/60 border border-mist p-4 text-sm leading-6 text-slate">
          {bandNum >= 7.5 ? (
            <><span className="font-semibold text-ink">Excellent ambition.</span> Band {targetBand} is typically required for top-tier universities, medical registration, and legal practice.</>
          ) : bandNum >= 6.5 ? (
            <><span className="font-semibold text-ink">Great target.</span> Band {targetBand} meets the requirement for most university programs and professional visas.</>
          ) : bandNum >= 5.5 ? (
            <><span className="font-semibold text-ink">Solid goal.</span> Band {targetBand} is a common threshold for foundation courses and some work visas.</>
          ) : (
            <><span className="font-semibold text-ink">Good start.</span> We&rsquo;ll help you build a strong foundation and work your way up from Band {targetBand}.</>
          )}
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!targetBand || saving}
        className="mt-8 w-full h-12 rounded-lg bg-teal px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-teal-deep hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}