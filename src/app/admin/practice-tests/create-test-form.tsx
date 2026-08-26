"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTestAction } from "./actions";
import { notify } from "@/lib/toast";
import type { Course } from "@/types/courses";

type ActionResult = { error?: string; success?: boolean } | null;

export function CreateTestForm({ courses }: { courses: Course[] }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createTestAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Practice test created.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Course</label>
        <select name="courseid" required className="rounded-md border border-mist px-3 py-2 text-sm">
          {courses.map((c) => (
            <option key={c.courseid} value={c.courseid}>{c.title}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Title</label>
        <input name="title" required className="rounded-md border border-mist px-3 py-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Category</label>
        <select name="category" required className="rounded-md border border-mist px-3 py-2 text-sm">
          <option value="Academic">Academic</option>
          <option value="General">General</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Duration (min)</label>
        <input name="duration" type="number" required className="w-24 rounded-md border border-mist px-3 py-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Total marks</label>
        <input name="total_marks" type="number" required className="w-24 rounded-md border border-mist px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={pending} className="rounded-pill bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "Creating..." : "Create test"}
      </button>
    </form>
  );
}
