"use client";

import { useState, useEffect, useRef } from "react";
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
  const [secondsLeft, setSecondsLeft] = useState(data.test.duration * 60);
  const formRef = useRef<HTMLFormElement>(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!autoSubmitted.current) {
        autoSubmitted.current = true;
        formRef.current?.requestSubmit();
      }
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const low = secondsLeft <= 60;

  const passageFor = (passageid: string | null) =>
    passageid ? data.passages.find((p) => p.passageid === passageid) : null;

  return (
    <form ref={formRef} action={submitAttemptAction} className="flex flex-col gap-8">
      <input type="hidden" name="attemptid" value={attemptid} />
      <input type="hidden" name="testid" value={testid} />
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />

      <div
        className={`sticky top-0 z-10 self-end rounded-pill px-4 py-1.5 text-sm font-semibold ${
          low ? "bg-danger text-white" : "bg-surface text-ink shadow-card"
        }`}
      >
        {mm}:{ss}
      </div>

      {data.test.audio_url && (
        <audio controls src={data.test.audio_url} className="w-full rounded-md" />
      )}

      {(Object.entries(data.questionsBySkill) as [string, typeof data.questionsBySkill[keyof typeof data.questionsBySkill]][]).map(
        ([skill, items]) => {
          const isSubjective = skill === "Writing" || skill === "Speaking";
          const byPassage = new Map<string, typeof items>();
          const noPassage: NonNullable<typeof items> = [];
          items?.forEach((item) => {
            const pid = item.question.passageid;
            if (pid) {
              const list = byPassage.get(pid) ?? [];
              list.push(item);
              byPassage.set(pid, list as typeof items);
            } else {
              noPassage.push(item);
            }
          });

          return (
            <section key={skill}>
              <h2 className="mb-3 font-display text-lg font-semibold text-navy">{skill}</h2>

              {Array.from(byPassage.entries()).map(([pid, groupItems]) => {
                const passage = passageFor(pid);
                return (
                  <div key={pid} className="mb-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-mist bg-surface p-4 text-sm leading-relaxed text-slate max-h-[500px] overflow-y-auto">
                      <h3 className="mb-2 font-display font-semibold text-ink">{passage?.title}</h3>
                      <p className="whitespace-pre-line">{passage?.passage_text}</p>
                    </div>
                    <div className="flex flex-col gap-4">
                      {groupItems?.map(({ question, options }) => (
                        <QuestionBlock
                          key={question.questionid}
                          question={question}
                          options={options}
                          isSubjective={false}
                          answers={answers}
                          setAnswers={setAnswers}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col gap-4">
                {noPassage.map(({ question, options }) => (
                  <QuestionBlock
                    key={question.questionid}
                    question={question}
                    options={options}
                    isSubjective={isSubjective}
                    answers={answers}
                    setAnswers={setAnswers}
                  />
                ))}
              </div>
            </section>
          );
        }
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

function QuestionBlock({
  question,
  options,
  isSubjective,
  answers,
  setAnswers,
}: {
  question: { questionid: string; question: string };
  options: { optionid: string; option_text: string }[];
  isSubjective: boolean;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <div className="rounded-md border border-mist bg-surface p-4">
      <p className="mb-3 text-sm font-medium text-ink">{question.question}</p>
      {isSubjective ? (
        <textarea
          rows={8}
          className="w-full rounded-md border border-mist p-3 text-sm"
          value={answers[question.questionid] ?? ""}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [question.questionid]: e.target.value }))}
          placeholder="Write your response here..."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label key={opt.optionid} className="flex items-center gap-2 text-sm text-slate">
              <input
                type="radio"
                name={question.questionid}
                value={opt.optionid}
                checked={answers[question.questionid] === opt.optionid}
                onChange={() => setAnswers((prev) => ({ ...prev, [question.questionid]: opt.optionid }))}
              />
              {opt.option_text}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
