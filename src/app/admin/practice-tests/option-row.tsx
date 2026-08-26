"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { notify } from "@/lib/toast";
import { createOptionAction, updateOptionAction, deleteOptionAction } from "./actions";
import { CheckIcon } from "@/components/icons/stat-icons";
import type { AnswerOption } from "@/types/assessment";

type ActionResult = { error?: string; success?: boolean } | null;

export function OptionRow({ option }: { option: AnswerOption }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateOptionAction, null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Option updated.");
      setEditing(false);
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  if (editing) {
    return (
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="optionid" value={option.optionid} />
        <input name="option_text" defaultValue={option.option_text} required className="flex-1 rounded-md border border-mist px-2 py-1 text-xs" />
        <label className="flex items-center gap-1 text-xs text-slate">
          <input type="checkbox" name="is_correct" defaultChecked={option.is_correct} /> correct
        </label>
        <button type="submit" disabled={pending} className="text-xs font-semibold text-teal disabled:opacity-50">
          Save
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs font-semibold text-slate">
          Cancel
        </button>
      </form>
    );
  }

  return (
    <li className="flex items-center gap-2 text-xs text-slate">
      {option.is_correct ? (
        <CheckIcon size={14} />
      ) : (
        <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-mist" />
      )}
      <span className="flex-1">{option.option_text}</span>
      <button type="button" onClick={() => setEditing(true)} className="font-semibold text-slate hover:text-teal">
        Edit
      </button>
      <DeleteOptionButton optionid={option.optionid} />
    </li>
  );
}

function DeleteOptionButton({ optionid }: { optionid: string }) {
  const [pending, setPending] = useState(false);
  async function handleClick() {
    setPending(true);
    const result = await deleteOptionAction(optionid);
    setPending(false);
    if (result?.error) notify.error(result.error);
    else notify.success("Option deleted.");
  }
  return (
    <button type="button" onClick={handleClick} disabled={pending} className="font-semibold text-danger hover:underline disabled:opacity-50">
      Delete
    </button>
  );
}

export function CreateOptionForm({ questionid }: { questionid: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createOptionAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Option added.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-2 flex items-center gap-2">
      <input type="hidden" name="questionid" value={questionid} />
      <input name="option_text" placeholder="Option text" required className="flex-1 rounded-md border border-mist px-2 py-1 text-xs" />
      <label className="flex items-center gap-1 text-xs text-slate">
        <input type="checkbox" name="is_correct" /> correct
      </label>
      <button type="submit" disabled={pending} className="text-xs font-semibold text-teal disabled:opacity-50">
        {pending ? "Adding..." : "Add option"}
      </button>
    </form>
  );
}
