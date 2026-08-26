"use client";

import { useActionState, useEffect, useState } from "react";
import { notify } from "@/lib/toast";
import { updateQuestionAction, deleteQuestionAction } from "./actions";
import { OptionRow, CreateOptionForm } from "./option-row";
import { ListeningIcon, ReadingIcon, WritingIcon, SpeakingIcon } from "@/components/icons/stat-icons";
import type { Question, AnswerOption } from "@/types/assessment";

type ActionResult = { error?: string; success?: boolean } | null;

const SKILL_ICON = {
  Listening: ListeningIcon,
  Reading: ReadingIcon,
  Writing: WritingIcon,
  Speaking: SpeakingIcon,
} as const;

export function QuestionRow({ question, options }: { question: Question; options: AnswerOption[] }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateQuestionAction, null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Question updated.");
      setEditing(false);
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  const isObjective = question.skill === "Listening" || question.skill === "Reading";

  return (
    <div className="rounded-md border border-mist p-3">
      {editing ? (
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="questionid" value={question.questionid} />
          <input name="question" defaultValue={question.question} required className="flex-1 rounded-md border border-mist px-2 py-1.5 text-sm" />
          <select name="skill" defaultValue={question.skill} className="rounded-md border border-mist px-2 py-1.5 text-sm">
            <option value="Listening">Listening</option>
            <option value="Reading">Reading</option>
            <option value="Writing">Writing</option>
            <option value="Speaking">Speaking</option>
          </select>
          <input name="marks" type="number" defaultValue={question.marks} className="w-16 rounded-md border border-mist px-2 py-1.5 text-sm" />
          <button type="submit" disabled={pending} className="rounded-pill bg-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            {pending ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate">
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-start gap-2 text-sm font-medium text-ink">
            {(() => {
              const SkillIcon = SKILL_ICON[question.skill];
              return <SkillIcon size={16} className="mt-0.5 shrink-0 text-teal" />;
            })()}
            <span>
              {question.question}{" "}
              <span className="text-xs text-slate-soft">
                ({question.skill}, {question.marks}pt)
              </span>
            </span>
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-slate hover:text-teal">
              Edit
            </button>
            <DeleteQuestionButton questionid={question.questionid} />
          </div>
        </div>
      )}

      <ul className="mt-2 flex flex-col gap-1">
        {options.map((o) => (
          <OptionRow key={o.optionid} option={o} />
        ))}
      </ul>
      {isObjective && <CreateOptionForm questionid={question.questionid} />}
    </div>
  );
}

function DeleteQuestionButton({ questionid }: { questionid: string }) {
  const [pending, setPending] = useState(false);
  function handleClick() {
    notify.confirm("Delete this question and its options?", async () => {
      setPending(true);
      const result = await deleteQuestionAction(questionid);
      setPending(false);
      if (result?.error) notify.error(result.error);
      else notify.success("Question deleted.");
    }, "Delete");
  }
  return (
    <button type="button" onClick={handleClick} disabled={pending} className="text-xs font-semibold text-danger hover:underline disabled:opacity-50">
      Delete
    </button>
  );
}
