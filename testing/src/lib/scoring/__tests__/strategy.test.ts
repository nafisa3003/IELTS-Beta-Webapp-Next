import {
  ObjectiveScoringStrategy,
  SubjectiveScoringStrategy,
  strategyFor,
} from "@/lib/scoring/strategy";
import type { Question, AnswerOption } from "@/types/assessment";

function q(overrides: Partial<Question> = {}): Question {
  return {
    questionid: "q1",
    testid: "t1",
    question: "Sample question",
    skill: "Listening",
    marks: 1,
    ...overrides,
  } as Question;
}

function opt(overrides: Partial<AnswerOption> = {}): AnswerOption {
  return {
    optionid: "o1",
    questionid: "q1",
    option_text: "Option",
    is_correct: false,
    ...overrides,
  } as AnswerOption;
}

describe("ObjectiveScoringStrategy", () => {
  const strategy = new ObjectiveScoringStrategy("Listening");

  it("awards marks when the chosen option matches the correct option", () => {
    const questions = [q({ questionid: "q1", marks: 2 })];
    const options = [
      opt({ optionid: "correct", questionid: "q1", is_correct: true }),
      opt({ optionid: "wrong", questionid: "q1", is_correct: false }),
    ];
    const result = strategy.score(questions, options, { q1: "correct" });
    expect(result.raw).toBe(2);
    expect(result.maxRaw).toBe(2);
    expect(result.band).not.toBeNull();
  });

  it("awards no marks for a wrong answer", () => {
    const questions = [q({ questionid: "q1", marks: 1 })];
    const options = [
      opt({ optionid: "correct", questionid: "q1", is_correct: true }),
      opt({ optionid: "wrong", questionid: "q1", is_correct: false }),
    ];
    const result = strategy.score(questions, options, { q1: "wrong" });
    expect(result.raw).toBe(0);
  });

  it("awards no marks when the question is left unanswered", () => {
    const questions = [q({ questionid: "q1", marks: 1 })];
    const options = [opt({ optionid: "correct", questionid: "q1", is_correct: true })];
    const result = strategy.score(questions, options, {});
    expect(result.raw).toBe(0);
    expect(result.maxRaw).toBe(1);
  });

  it("sums marks correctly across multiple questions", () => {
    const questions = [
      q({ questionid: "q1", marks: 1 }),
      q({ questionid: "q2", marks: 3 }),
    ];
    const options = [
      opt({ optionid: "c1", questionid: "q1", is_correct: true }),
      opt({ optionid: "c2", questionid: "q2", is_correct: true }),
    ];
    const result = strategy.score(questions, options, { q1: "c1", q2: "c2" });
    expect(result.raw).toBe(4);
    expect(result.maxRaw).toBe(4);
  });

  it("maps 0% raw score to band 1", () => {
    const questions = [q({ questionid: "q1", marks: 1 })];
    const options = [opt({ optionid: "correct", questionid: "q1", is_correct: true })];
    const result = strategy.score(questions, options, {});
    expect(result.band).toBe(1);
  });

  it("maps 100% raw score to band 9", () => {
    const questions = [q({ questionid: "q1", marks: 1 })];
    const options = [opt({ optionid: "correct", questionid: "q1", is_correct: true })];
    const result = strategy.score(questions, options, { q1: "correct" });
    expect(result.band).toBe(9);
  });

  it("rounds the band to the nearest 0.5", () => {
    // 1 of 3 correct -> pct = 1/3 -> band = 1 + (1/3)*8 = 3.666 -> rounds to 3.5
    const questions = [
      q({ questionid: "q1", marks: 1 }),
      q({ questionid: "q2", marks: 1 }),
      q({ questionid: "q3", marks: 1 }),
    ];
    const options = [
      opt({ optionid: "c1", questionid: "q1", is_correct: true }),
      opt({ optionid: "c2", questionid: "q2", is_correct: true }),
      opt({ optionid: "c3", questionid: "q3", is_correct: true }),
    ];
    const result = strategy.score(questions, options, { q1: "c1" });
    expect(result.band).toBe(3.5);
  });
});

describe("SubjectiveScoringStrategy", () => {
  const strategy = new SubjectiveScoringStrategy("Writing");

  it("always returns a null band regardless of input", () => {
    const questions = [q({ skill: "Writing", marks: 5 }), q({ skill: "Writing", marks: 3 })];
    const result = strategy.score(questions, [], {});
    expect(result.band).toBeNull();
    expect(result.raw).toBe(0);
  });

  it("sums maxRaw from question marks even though nothing is auto-graded", () => {
    const questions = [q({ skill: "Writing", marks: 5 }), q({ skill: "Writing", marks: 3 })];
    const result = strategy.score(questions, [], {});
    expect(result.maxRaw).toBe(8);
  });
});

describe("strategyFor", () => {
  it("returns an ObjectiveScoringStrategy for Listening", () => {
    expect(strategyFor("Listening")).toBeInstanceOf(ObjectiveScoringStrategy);
  });

  it("returns an ObjectiveScoringStrategy for Reading", () => {
    expect(strategyFor("Reading")).toBeInstanceOf(ObjectiveScoringStrategy);
  });

  it("returns a SubjectiveScoringStrategy for Writing", () => {
    expect(strategyFor("Writing")).toBeInstanceOf(SubjectiveScoringStrategy);
  });

  it("returns a SubjectiveScoringStrategy for Speaking", () => {
    expect(strategyFor("Speaking")).toBeInstanceOf(SubjectiveScoringStrategy);
  });
});
