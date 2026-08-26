"use client";

import { useActionState, useEffect, useState } from "react";
import { notify } from "@/lib/toast";
import { updateContentAction, deleteContentAction } from "./actions";
import { VideoTypeIcon, PdfTypeIcon, YoutubeTypeIcon, NotesTypeIcon } from "@/components/icons/stat-icons";
import type { Content, ContentType } from "@/types/courses";

type ActionResult = { error?: string; success?: boolean } | null;

const CONTENT_ICON: Record<ContentType, typeof VideoTypeIcon> = {
  Video: VideoTypeIcon,
  PDF: PdfTypeIcon,
  YouTube: YoutubeTypeIcon,
  Notes: NotesTypeIcon,
};

export function ContentRow({ content }: { content: Content }) {
  const [editing, setEditing] = useState(false);

  if (editing) return <EditContentForm content={content} onDone={() => setEditing(false)} />;

  const Icon = CONTENT_ICON[content.content_type];

  return (
    <li className="flex items-center gap-3 rounded-md border border-mist bg-surface px-4 py-3 text-sm">
      <Icon size={18} className="shrink-0 text-teal" />
      <span className="flex-1 text-ink">{content.title}</span>
      <span className="text-xs text-slate-soft">{content.content_type}</span>
      <button type="button" onClick={() => setEditing(true)} className="rounded-pill border border-mist px-3 py-1 text-xs font-semibold text-slate hover:border-teal hover:text-teal">
        Edit
      </button>
      <DeleteContentButton contentid={content.contentid} title={content.title} />
    </li>
  );
}

function EditContentForm({ content, onDone }: { content: Content; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateContentAction, null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Content updated.");
      onDone();
    }
    if (state?.error) notify.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-md border border-teal bg-surface px-4 py-3">
      <input type="hidden" name="contentid" value={content.contentid} />
      <input name="title" defaultValue={content.title} required className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <select name="content_type" defaultValue={content.content_type} className="rounded-md border border-mist px-2 py-1.5 text-sm">
        <option value="Video">Video</option>
        <option value="PDF">PDF</option>
        <option value="YouTube">YouTube</option>
        <option value="Notes">Notes</option>
      </select>
      <input name="youtube_link" defaultValue={content.youtube_link ?? ""} placeholder="YouTube link" className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <input name="file_url" defaultValue={content.file_url ?? ""} placeholder="File URL" className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <button type="submit" disabled={pending} className="rounded-pill bg-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
        {pending ? "Saving..." : "Save"}
      </button>
      <button type="button" onClick={onDone} className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate">
        Cancel
      </button>
    </form>
  );
}

function DeleteContentButton({ contentid, title }: { contentid: string; title: string }) {
  const [pending, setPending] = useState(false);

  function handleClick() {
    notify.confirm(`Delete "${title}"?`, async () => {
      setPending(true);
      const result = await deleteContentAction(contentid);
      setPending(false);
      if (result?.error) notify.error(result.error);
      else notify.success("Content deleted.");
    }, "Delete");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-pill border border-danger/40 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger hover:text-white disabled:opacity-50"
    >
      Delete
    </button>
  );
}
