"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { scheduleLiveClassAction, cancelLiveClassAction } from "./actions";
import { notify } from "@/lib/toast";

type ActionResult = { error?: string; success?: boolean } | null;

export function ScheduleClassForm({ links }: { links: { teachercourseid: string; courseTitle: string }[] }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(scheduleLiveClassAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Class scheduled.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Course</label>
        <select name="teachercourseid" required className="rounded-md border border-mist px-3 py-2 text-sm">
          {links.map((l) => (
            <option key={l.teachercourseid} value={l.teachercourseid}>
              {l.courseTitle}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Meeting link</label>
        <input name="meeting_link" placeholder="https://…" required className="rounded-md border border-mist px-3 py-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Date & time</label>
        <input name="class_date" type="datetime-local" required className="rounded-md border border-mist px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={pending} className="rounded-pill bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "Scheduling..." : "Schedule"}
      </button>
    </form>
  );
}

export function CancelClassButton({ classid }: { classid: string }) {
  const [pending, setPending] = useState(false);

  function handleClick() {
    notify.confirm("Cancel this class?", async () => {
      setPending(true);
      const result = await cancelLiveClassAction(classid);
      setPending(false);
      if (result?.error) notify.error(result.error);
      else notify.success("Class canceled.");
    }, "Cancel class");
  }

  return (
    <button type="button" onClick={handleClick} disabled={pending} className="text-xs font-semibold text-danger hover:underline disabled:opacity-50">
      Cancel
    </button>
  );
}
