"use client";

import { useActionState, useEffect, useState } from "react";
import { notify } from "@/lib/toast";
import { updateAnnouncementAction, deleteAnnouncementAction } from "./actions";
import type { Announcement } from "@/lib/repositories/announcement.repository";

type ActionResult = { error?: string; success?: boolean } | null;

export function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateAnnouncementAction, null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Announcement updated.");
      setEditing(false);
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  if (editing) {
    return (
      <form action={formAction} className="flex flex-col gap-2 rounded-md border border-teal bg-surface p-4">
        <input type="hidden" name="announcementid" value={announcement.announcementid} />
        <input name="title" defaultValue={announcement.title} required className="rounded-md border border-mist px-3 py-2 text-sm" />
        <textarea name="message" defaultValue={announcement.message} required rows={3} className="rounded-md border border-mist px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-pill bg-teal px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-pill border border-mist px-4 py-1.5 text-xs font-semibold text-slate">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-md border border-mist bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink">{announcement.title}</h2>
        <span className="text-xs text-slate-soft">{new Date(announcement.created_at).toLocaleDateString()}</span>
      </div>
      <p className="mt-1 text-sm text-slate">{announcement.message}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-slate hover:text-teal">
          Edit
        </button>
        <DeleteButton announcementid={announcement.announcementid} />
      </div>
    </div>
  );
}

function DeleteButton({ announcementid }: { announcementid: string }) {
  const [pending, setPending] = useState(false);
  function handleClick() {
    notify.confirm("Delete this announcement?", async () => {
      setPending(true);
      const result = await deleteAnnouncementAction(announcementid);
      setPending(false);
      if (result?.error) notify.error(result.error);
      else notify.success("Announcement deleted.");
    }, "Delete");
  }
  return (
    <button type="button" onClick={handleClick} disabled={pending} className="text-xs font-semibold text-danger hover:underline disabled:opacity-50">
      Delete
    </button>
  );
}
