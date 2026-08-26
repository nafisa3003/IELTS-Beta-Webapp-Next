"use client";

import { useState } from "react";
import type { TestWithQuestions } from "@/lib/services/assessment-service";
import { submitAttemptAction } from "../../actions";

export function AttemptForm({
  attemptid,
  testid,
  data,
}: {
  attemptid: string;
  testid: string;
  data: TestWithQuestions;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <form action={submitAttemptAction} className="flex flex-col gap-8">
      <input type="hidden" name="attemptid" value={attemptid} />
      <input type="hidden" name="testid" value={testid} />
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />

      {(Object.entries(data.questionsBySkill) as [string, typeof data.questionsBySkill[keyof typeof data.questionsBySkill]][]).map(
        ([skill, items]) => (
          <section key={skill}>
            <h2 className="mb-3 font-display text-lg font-semibold text-navy">{skill}</h2>
            <div className="flex flex-col gap-4">
              {items?.map(({ question, options }) => (
                <div key={question.questionid} className="rounded-md border border-mist bg-surface p-4">
                  <p className="mb-3 text-sm font-medium text-ink">{question.question}</p>
                  <div className="flex flex-col gap-2">
                    {options.map((opt) => (
                      <label key={opt.optionid} className="flex items-center gap-2 text-sm text-slate">
                        <input
                          type="radio"
                          name={question.questionid}
                          value={opt.optionid}
                          checked={answers[question.questionid] === opt.optionid}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [question.questionid]: opt.optionid }))
                          }
                        />
                        {opt.option_text}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      )}

      <button
        type="submit"
        className="w-fit rounded-pill bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Submit test
      </button>
    </form>
  );
}
