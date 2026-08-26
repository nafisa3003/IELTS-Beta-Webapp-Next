import type { Question, AnswerOption, Skill, SubmittedAnswers } from "@/types/assessment";

export interface SkillScore {
  skill: Skill;
  raw: number;
  maxRaw: number;
  /** null when the skill needs a teacher/rubric pass before it has a band. */
  band: number | null;
}

export interface ScoringStrategy {
  readonly skill: Skill;
  score(questions: Question[], options: AnswerOption[], answers: SubmittedAnswers): SkillScore;
}

/**
 * Listening & Reading: every question has exactly one correct option.
 * Score is deterministic — count correct, convert to an approximate band
 * on the standard IELTS 40-question raw-to-band curve.
 */
export class ObjectiveScoringStrategy implements ScoringStrategy {
  constructor(readonly skill: Skill) {}

  score(questions: Question[], options: AnswerOption[], answers: SubmittedAnswers): SkillScore {
    let raw = 0;
    let maxRaw = 0;

    for (const q of questions) {
      maxRaw += q.marks;
      const chosenOptionId = answers[q.questionid];
      const correctOption = options.find((o) => o.questionid === q.questionid && o.is_correct);
      if (chosenOptionId && correctOption && chosenOptionId === correctOption.optionid) {
        raw += q.marks;
      }
    }

    return { skill: this.skill, raw, maxRaw, band: rawToBand(raw, maxRaw) };
  }
}

/**
 * Writing & Speaking: no automated grading in V2 (no AI chatbot — see
 * architecture §11). The attempt is recorded and flagged for a teacher to
 * grade against the rubric; band stays null until then.
 */
export class SubjectiveScoringStrategy implements ScoringStrategy {
  constructor(readonly skill: Skill) {}

  score(questions: Question[]): SkillScore {
    const maxRaw = questions.reduce((sum, q) => sum + q.marks, 0);
    return { skill: this.skill, raw: 0, maxRaw, band: null };
  }
}

export function strategyFor(skill: Skill): ScoringStrategy {
  return skill === "Listening" || skill === "Reading"
    ? new ObjectiveScoringStrategy(skill)
    : new SubjectiveScoringStrategy(skill);
}

/** Approximate IELTS raw-score-to-band conversion, out of a 40-point scale. */
function rawToBand(raw: number, maxRaw: number): number {
  if (maxRaw === 0) return 0;
  const pct = raw / maxRaw;
  const band = 1 + pct * 8; // maps 0%→band 1, 100%→band 9
  return Math.round(band * 2) / 2; // nearest 0.5
}
