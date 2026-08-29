"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { notify } from "@/lib/toast";
import { createPassageAction, updatePassageAction, deletePassageAction } from "./actions";
import type { Passage } from "@/types/assessment";

type ActionResult = { error?: string; success?: boolean } | null;

export function PassageRow({ passage }: { passage: Passage }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updatePassageAction, null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Passage updated.");
      setEditing(false);
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  if (editing) {
    return (
      <form action={formAction} className="flex flex-col gap-2 rounded-md border border-mist p-3">
        <input type="hidden" name="passageid" value={passage.passageid} />
        <div className="flex items-center gap-2">
          <input name="title" defaultValue={passage.title} required className="flex-1 rounded-md border border-mist px-2 py-1.5 text-sm" />
          <input name="order_index" type="number" defaultValue={passage.order_index} className="w-16 rounded-md border border-mist px-2 py-1.5 text-sm" />
        </div>
        <textarea name="passage_text" defaultValue={passage.passage_text} required rows={8} className="rounded-md border border-mist p-2 text-sm" />
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-pill bg-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-md border border-mist p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">
            Passage {passage.order_index}: {passage.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-soft">{passage.passage_text}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-slate hover:text-teal">
            Edit
          </button>
          <DeletePassageButton passageid={passage.passageid} />
        </div>
      </div>
    </div>
  );
}

function DeletePassageButton({ passageid }: { passageid: string }) {
  const [pending, setPending] = useState(false);
  function handleClick() {
    notify.confirm("Delete this passage? Questions linked to it will be unlinked, not deleted.", async () => {
      setPending(true);
      const result = await deletePassageAction(passageid);
      setPending(false);
      if (result?.error) notify.error(result.error);
      else notify.success("Passage deleted.");
    }, "Delete");
  }
  return (
    <button type="button" onClick={handleClick} disabled={pending} className="text-xs font-semibold text-danger hover:underline disabled:opacity-50">
      Delete
    </button>
  );
}

export function CreatePassageForm({ testid, nextOrder }: { testid: string; nextOrder: number }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createPassageAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Passage added.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2 rounded-md border border-dashed border-mist p-3">
      <input type="hidden" name="testid" value={testid} />
      <div className="flex items-center gap-2">
        <input name="title" placeholder="Passage title" required className="flex-1 rounded-md border border-mist px-2 py-1.5 text-sm" />
        <input name="order_index" type="number" defaultValue={nextOrder} className="w-16 rounded-md border border-mist px-2 py-1.5 text-sm" />
      </div>
      <textarea name="passage_text" placeholder="Paste the reading passage text" required rows={6} className="rounded-md border border-mist p-2 text-sm" />
      <button type="submit" disabled={pending} className="w-fit rounded-pill bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
        {pending ? "Adding..." : "Add passage"}
      </button>
    </form>
  );
}
