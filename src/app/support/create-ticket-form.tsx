"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSupportTicketAction } from "./actions";
import { notify } from "@/lib/toast";

type ActionResult = { error?: string; success?: boolean } | null;

export function CreateTicketForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createSupportTicketAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Ticket submitted — we'll get back to you soon.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-lg bg-surface p-6 shadow-card">
      <h2 className="font-display text-lg font-semibold text-ink">Open a ticket</h2>
      <input name="subject" placeholder="What's this about?" required className="rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal" />
      <textarea name="message" placeholder="Tell us more..." required rows={4} className="rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal" />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-pill bg-teal px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit ticket"}
      </button>
    </form>
  );
}
