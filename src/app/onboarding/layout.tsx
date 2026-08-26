"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  { path: "/onboarding/current-band", label: "Current" },
  { path: "/onboarding/target-band", label: "Target" },
  { path: "/onboarding/goal", label: "Goal" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = STEPS.findIndex((s) => s.path === pathname);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirectTo=/onboarding/current-band");
      }
    }
    checkAuth();
  }, [router]);

  function handleBack() {
    if (currentIndex <= 0) {
      router.push("/signup");
    } else {
      router.push(STEPS[currentIndex - 1]?.path ?? "/onboarding/current-band");
    }
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(380px,1fr)_minmax(520px,1.4fr)]">
      {/* LEFT PANEL — mint */}
      <aside
        className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden"
        style={{ backgroundColor: "#9efff5" }}
      >
        {/* Back arrow */}
        <button
          onClick={handleBack}
          className="w-fit p-2 -ml-2 rounded-full hover:bg-navy/5 transition-colors"
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#123C6B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Animated illustration */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatedIllustration />
        </div>

        {/* Logo bottom left */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-2.5 shadow-card">
            <Image
              src="/logo.png"
              alt="IELTS Beta"
              width={40}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </div>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: "#123C6B", fontFamily: "var(--font-display)" }}
          >
            IELTS Beta
          </span>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <section className="flex min-h-screen flex-col bg-paper">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-mist transition-colors lg:hidden"
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center px-6 pb-12 sm:px-10">
          <div className="w-full max-w-[440px] mx-auto">
            {/* STEPPER — fixed */}
            <div className="mb-10">
              <div className="flex items-center">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx < currentIndex;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div key={step.path} className="flex items-center flex-1 last:flex-initial">
                      {/* Circle + label */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 ${
                            isCompleted
                              ? "bg-teal text-white"
                              : isCurrent
                              ? "bg-teal text-white ring-4 ring-teal/15"
                              : "bg-white text-slate-soft border-2 border-mist"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isCurrent ? "text-ink" : "text-slate-soft"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {/* Connecting line — NOT on last item */}
                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-[3px] bg-mist rounded-full mx-3 relative overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 bg-teal rounded-full transition-all duration-500 ${
                              isCompleted ? "w-full" : "w-0"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Animated illustration ---------- */
function AnimatedIllustration() {
  return (
    <div className="relative w-72 h-72 flex items-center justify-center">
      <style>{`
        @keyframes onb-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes onb-pulse {
          0% { transform: scale(0.65); opacity: 0.45; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes onb-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .onb-float { animation: onb-float 4s ease-in-out infinite; }
        .onb-pulse { animation: onb-pulse 3s cubic-bezier(0.4,0,0.6,1) infinite; }
        .onb-orbit { animation: onb-orbit 20s linear infinite; }
        .onb-orbit-slow { animation: onb-orbit 26s linear infinite reverse; }
      `}</style>

      {/* Expanding rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-40 h-40 rounded-full onb-pulse"
          style={{ background: "rgba(18, 60, 107, 0.1)" }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-40 h-40 rounded-full onb-pulse"
          style={{ background: "rgba(18, 60, 107, 0.07)", animationDelay: "1.2s" }}
        />
      </div>

      {/* Main floating icon */}
      <div className="relative onb-float">
        <div className="w-32 h-32 rounded-[24px] bg-white shadow-float flex items-center justify-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#123C6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="#0EA599" stroke="none" />
          </svg>
        </div>
      </div>

      {/* Orbiting accents */}
      <div className="absolute inset-0 onb-orbit">
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-navy/20" />
      </div>
      <div className="absolute inset-0 onb-orbit-slow">
        <div className="absolute bottom-8 right-8 w-3.5 h-3.5 rounded-full bg-teal/30" />
      </div>
      <div className="absolute inset-0 onb-orbit" style={{ animationDuration: "30s" }}>
        <div className="absolute top-1/2 left-4 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/80" />
      </div>
    </div>
  );
}