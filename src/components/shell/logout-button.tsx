"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/toast";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  // Animate in
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(t);
    }
    setShow(false);
    const t = setTimeout(() => {
      document.body.style.overflow = "";
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        notify.error("Couldn't log you out — try again.");
        setLoading(false);
        return;
      }

      setOpen(false);
      notify.goodbye("Signed out. See you next time!");
      router.push("/login");
    } catch {
      notify.error("Something went wrong.");
      setLoading(false);
    }
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center justify-center rounded-full border border-mist px-4 py-2 text-sm font-medium text-slate transition-all duration-200 hover:border-danger hover:text-danger dark:border-slate/20 dark:text-slate-soft dark:hover:border-danger dark:hover:text-danger"
        }
      >
        {children ?? "Log out"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-navy-deep/60 transition-opacity duration-200 ${
              show ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => !loading && setOpen(false)}
          />

          {/* Card */}
          <div
            className={`relative w-full max-w-[360px] transition-all duration-200 ${
              show ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-mist bg-surface shadow-2xl dark:border-slate/20 dark:bg-navy-deep">
              <div className="flex flex-col items-center p-8">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                  <svg
                    className="h-6 w-6 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-ink dark:text-white">
                  Sign Out
                </h3>
                <p className="mt-2 text-center text-sm leading-relaxed text-slate dark:text-slate-soft">
                  Are you sure you want to sign out of your IELTS Beta account?
                </p>

                <div className="mt-7 flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-mist px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-slate/20 active:scale-[0.98] disabled:opacity-50 dark:bg-slate/10 dark:text-slate-soft dark:hover:bg-slate/20"
                  >
                    Stay logged in
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-danger/25 transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing out...
                      </span>
                    ) : (
                      "Yes, Sign out"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}