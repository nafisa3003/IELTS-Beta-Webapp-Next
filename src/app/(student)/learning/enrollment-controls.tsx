"use client";

import { useState } from "react";
import { notify } from "@/lib/toast";
import { enrollInCourseAction, dropCourseAction } from "./actions";

export function EnrollButton({ courseid, batchid, title }: { courseid: string; batchid?: string | null; title: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await enrollInCourseAction(courseid, batchid);
    setPending(false);
    if (result?.error) notify.error(result.error);
    else notify.success(`Enrolled in ${title}.`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="mt-1 w-fit rounded-pill bg-teal px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Enrolling..." : "Enroll"}
    </button>
  );
}

export function DropCourseButton({ enrollid, title }: { enrollid: string; title: string }) {
  const [pending, setPending] = useState(false);

  function handleClick() {
    notify.confirm(
      `Drop "${title}"? You can re-enroll anytime.`,
      async () => {
        setPending(true);
        const result = await dropCourseAction(enrollid);
        setPending(false);
        if (result?.error) notify.error(result.error);
        else notify.success("Course dropped.");
      },
      "Drop course"
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-pill border border-mist px-3 py-1 text-xs font-semibold text-slate transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
    >
      Drop
    </button>
  );
}
