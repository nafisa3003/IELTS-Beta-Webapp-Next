"use client";

import { useEffect } from "react";
import { ErrorIcon } from "@/components/icons/stat-icons";

export function ErrorState({ error, reset, label = "Something went wrong" }: { error: Error & { digest?: string }; reset: () => void; label?: string }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <ErrorIcon size={40} />
      <p className="font-display text-lg font-semibold text-ink">{label}</p>
      <p className="max-w-sm text-sm text-slate-soft">
        That didn&apos;t load the way it should have. It&apos;s probably temporary — try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-pill bg-teal px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
