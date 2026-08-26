"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAnnouncementAction } from "./actions";
import { notify } from "@/lib/toast";

type ActionResult = { error?: string; success?: boolean } | null;

export function CreateAnnouncementForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createAnnouncementAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Announcement posted.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-lg bg-surface p-6 shadow-card">
      <input name="title" placeholder="Title" required className="rounded-md border border-mist px-3 py-2 text-sm" />
      <textarea name="message" placeholder="Message" required rows={3} className="rounded-md border border-mist px-3 py-2 text-sm" />
      <button type="submit" disabled={pending} className="w-fit rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "Posting..." : "Post announcement"}
      </button>
    </form>
  );
}
