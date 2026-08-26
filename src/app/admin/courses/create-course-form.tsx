"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCourseAction } from "./actions";
import { notify } from "@/lib/toast";

type ActionResult = { error?: string; success?: boolean } | null;

export function CreateCourseForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createCourseAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Course created.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-lg bg-surface p-6 shadow-card">
      <h2 className="font-display text-lg font-semibold text-ink">Add a course</h2>
      <div className="grid grid-cols-2 gap-3">
        <input name="title" placeholder="Title" required className="rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal" />
        <input name="level" placeholder="Level (e.g. Intermediate)" className="rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal" />
        <input name="duration" placeholder="Duration (e.g. 8 weeks)" className="rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal" />
        <input name="description" placeholder="Short description" className="rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create course"}
      </button>
    </form>
  );
}
