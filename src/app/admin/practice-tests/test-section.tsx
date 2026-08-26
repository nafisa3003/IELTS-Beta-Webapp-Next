"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { notify } from "@/lib/toast";
import { updateTestAction, deleteTestAction, createQuestionAction } from "./actions";
import { QuestionRow } from "./question-row";
import type { PracticeTest, Question, AnswerOption } from "@/types/assessment";

type ActionResult = { error?: string; success?: boolean } | null;

export function TestSection({
  test,
  questions,
  optionsByQuestion,
}: {
  test: PracticeTest;
  questions: Question[];
  optionsByQuestion: Map<string, AnswerOption[]>;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <section className="rounded-lg bg-surface p-6 shadow-card">
      {editing ? (
        <EditTestForm test={test} onDone={() => setEditing(false)} />
      ) : (
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{test.title}</h2>
            <p className="text-xs text-slate-soft">
              {test.category} · {test.duration} min · {test.total_marks} marks
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setEditing(true)} className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate hover:border-teal hover:text-teal">
              Edit
            </button>
            <DeleteTestButton testid={test.testid} title={test.title} />
          </div>
        </div>
      )}

      <CreateQuestionForm testid={test.testid} />

      <div className="mt-4 flex flex-col gap-3">
        {questions.map((q) => (
          <QuestionRow key={q.questionid} question={q} options={optionsByQuestion.get(q.questionid) ?? []} />
        ))}
      </div>
    </section>
  );
}

function EditTestForm({ test, onDone }: { test: PracticeTest; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateTestAction, null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Test updated.");
      onDone();
    }
    if (state?.error) notify.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="mb-4 flex flex-wrap items-end gap-2">
      <input type="hidden" name="testid" value={test.testid} />
      <input name="title" defaultValue={test.title} required className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <select name="category" defaultValue={test.category} className="rounded-md border border-mist px-2 py-1.5 text-sm">
        <option value="Academic">Academic</option>
        <option value="General">General</option>
      </select>
      <input name="duration" type="number" defaultValue={test.duration} className="w-20 rounded-md border border-mist px-2 py-1.5 text-sm" />
      <input name="total_marks" type="number" defaultValue={test.total_marks} className="w-20 rounded-md border border-mist px-2 py-1.5 text-sm" />
      <button type="submit" disabled={pending} className="rounded-pill bg-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
        {pending ? "Saving..." : "Save"}
      </button>
      <button type="button" onClick={onDone} className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate">
        Cancel
      </button>
    </form>
  );
}

function DeleteTestButton({ testid, title }: { testid: string; title: string }) {
  const [pending, setPending] = useState(false);
  function handleClick() {
    notify.confirm(`Delete "${title}"? This removes all its questions and options too.`, async () => {
      setPending(true);
      const result = await deleteTestAction(testid);
      setPending(false);
      if (result?.error) notify.error(result.error);
      else notify.success("Test deleted.");
    }, "Delete");
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-pill border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-white disabled:opacity-50"
    >
      Delete
    </button>
  );
}

function CreateQuestionForm({ testid }: { testid: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createQuestionAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Question added.");
      formRef.current?.reset();
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="testid" value={testid} />
      <input name="question" placeholder="Question text" required className="flex-1 rounded-md border border-mist px-3 py-2 text-sm" />
      <select name="skill" required className="rounded-md border border-mist px-3 py-2 text-sm">
        <option value="Listening">Listening</option>
        <option value="Reading">Reading</option>
        <option value="Writing">Writing</option>
        <option value="Speaking">Speaking</option>
      </select>
      <input name="marks" type="number" defaultValue={1} className="w-16 rounded-md border border-mist px-3 py-2 text-sm" />
      <button type="submit" disabled={pending} className="rounded-pill bg-teal px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
        {pending ? "Adding..." : "Add question"}
      </button>
    </form>
  );
}
