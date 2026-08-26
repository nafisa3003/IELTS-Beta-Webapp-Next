import { AssessmentService } from "@/lib/services/assessment-service";
import { PracticeTestRepository } from "@/lib/repositories/practice-test.repository";
import { QuestionRepository } from "@/lib/repositories/question.repository";
import { AnswerOptionRepository } from "@/lib/repositories/answer-option.repository";
import { TestAttemptRepository } from "@/lib/repositories/test-attempt.repository";
import { TestResultRepository } from "@/lib/repositories/test-result.repository";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeQueryBuilder, makeFakeDb } from "../../repositories/__tests__/test-utils/supabase-mock";

jest.mock("@/lib/repositories/practice-test.repository");
jest.mock("@/lib/repositories/question.repository");
jest.mock("@/lib/repositories/answer-option.repository");
jest.mock("@/lib/repositories/test-attempt.repository");
jest.mock("@/lib/repositories/test-result.repository");
jest.mock("@/lib/supabase/admin", () => ({
  createAdminClient: jest.fn(() => ({})),
}));

const MockedPracticeTestRepo = PracticeTestRepository as jest.MockedClass<typeof PracticeTestRepository>;
const MockedQuestionRepo = QuestionRepository as jest.MockedClass<typeof QuestionRepository>;
const MockedAnswerOptionRepo = AnswerOptionRepository as jest.MockedClass<typeof AnswerOptionRepository>;
const MockedTestAttemptRepo = TestAttemptRepository as jest.MockedClass<typeof TestAttemptRepository>;
const MockedTestResultRepo = TestResultRepository as jest.MockedClass<typeof TestResultRepository>;

function question(id: string, skill: string, marks: number) {
  return { questionid: id, testid: "t1", question: "Q", skill, marks } as never;
}

function option(id: string, questionid: string, isCorrect: boolean) {
  return { optionid: id, questionid, option_text: "opt", is_correct: isCorrect } as never;
}

describe("AssessmentService.submitAttempt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("scores objective skills, leaves subjective skills ungraded, and averages only graded bands", async () => {
    // 2 Listening questions (1 correct, 1 wrong) + 1 Writing question (ungraded)
    MockedQuestionRepo.prototype.findByTest.mockResolvedValue([
      question("q1", "Listening", 1),
      question("q2", "Listening", 1),
      question("q3", "Writing", 1),
    ]);
    MockedAnswerOptionRepo.prototype.findAllByTest.mockResolvedValue([
      option("correct1", "q1", true),
      option("wrong1", "q1", false),
      option("correct2", "q2", true),
      option("wrong2", "q2", false),
    ]);
    MockedTestAttemptRepo.prototype.submit.mockResolvedValue({ attemptid: "a1" } as never);
    MockedTestResultRepo.prototype.create.mockResolvedValue({ attemptid: "a1" } as never);

    const service = new AssessmentService({} as never);
    const result = await service.submitAttempt("a1", "t1", { q1: "correct1", q2: "wrong2" });

    // Listening: 1 of 2 correct -> raw 1, maxRaw 2 -> band = 1 + 0.5*8 = 5
    expect(result.totalRaw).toBe(1);
    expect(result.totalMax).toBe(3); // 1 (q1) + 1 (q2) + 1 (q3, ungraded but still counted in maxRaw)

    expect(createAdminClient).toHaveBeenCalled();
    expect(MockedTestAttemptRepo.prototype.submit).toHaveBeenCalledWith("a1", 1, 5);
    expect(MockedTestResultRepo.prototype.create).toHaveBeenCalledWith(
      "a1",
      { Listening: 5 },
      5
    );
  });

  it("returns overall band 0 when every skill in the test is subjective (nothing graded yet)", async () => {
    MockedQuestionRepo.prototype.findByTest.mockResolvedValue([
      question("q1", "Writing", 5),
      question("q2", "Speaking", 5),
    ]);
    MockedAnswerOptionRepo.prototype.findAllByTest.mockResolvedValue([]);
    MockedTestAttemptRepo.prototype.submit.mockResolvedValue({ attemptid: "a2" } as never);
    MockedTestResultRepo.prototype.create.mockResolvedValue({ attemptid: "a2" } as never);

    const service = new AssessmentService({} as never);
    await service.submitAttempt("a2", "t1", {});

    expect(MockedTestAttemptRepo.prototype.submit).toHaveBeenCalledWith("a2", 0, 0);
    expect(MockedTestResultRepo.prototype.create).toHaveBeenCalledWith("a2", {}, 0);
  });
});

describe("AssessmentService.getTestForTaking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when the test doesn't exist", async () => {
    MockedPracticeTestRepo.prototype.findById.mockResolvedValue(null);
    const service = new AssessmentService({} as never);
    const result = await service.getTestForTaking("missing");
    expect(result).toBeNull();
  });

  it("groups questions by skill and attaches public (is_correct-free) options", async () => {
    MockedPracticeTestRepo.prototype.findById.mockResolvedValue({ testid: "t1" } as never);
    MockedQuestionRepo.prototype.findByTest.mockResolvedValue([
      question("q1", "Listening", 1),
      question("q2", "Reading", 1),
    ]);
    MockedAnswerOptionRepo.prototype.findPublicByQuestion.mockImplementation((questionid: string) =>
      Promise.resolve([{ optionid: `${questionid}-opt`, option_text: "opt" }] as never)
    );

    const service = new AssessmentService({} as never);
    const result = await service.getTestForTaking("t1");

    expect(result?.questionsBySkill.Listening).toHaveLength(1);
    expect(result?.questionsBySkill.Reading).toHaveLength(1);
    expect(result?.questionsBySkill.Listening?.[0].options[0].optionid).toBe("q1-opt");
  });
});

describe("AssessmentService.listTestsForSkill", () => {
  it("returns an empty array without querying when no course ids are given", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: [], error: null }));
    const service = new AssessmentService(db as never);
    const result = await service.listTestsForSkill([], "Listening");
    expect(result).toEqual([]);
    expect(db.from).not.toHaveBeenCalled();
  });

  it("dedupes tests that match multiple questions in the same skill", async () => {
    const rows = [
      { testid: "t1", courseid: "c1" },
      { testid: "t1", courseid: "c1" }, // same test, second matching question
      { testid: "t2", courseid: "c1" },
    ];
    const db = makeFakeDb(() => makeQueryBuilder({ data: rows, error: null }));
    const service = new AssessmentService(db as never);
    const result = await service.listTestsForSkill(["c1"], "Listening");
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.testid).sort()).toEqual(["t1", "t2"]);
  });

  it("throws when the underlying query errors", async () => {
    const db = makeFakeDb(() => makeQueryBuilder({ data: null, error: new Error("boom") }));
    const service = new AssessmentService(db as never);
    await expect(service.listTestsForSkill(["c1"], "Listening")).rejects.toThrow("boom");
  });
});

describe("AssessmentService delegate methods", () => {
  it("listTestsForCourse delegates to the practice test repository", async () => {
    MockedPracticeTestRepo.prototype.findByCourse.mockResolvedValue([{ testid: "t1" }] as never);
    const service = new AssessmentService({} as never);
    const result = await service.listTestsForCourse("c1");
    expect(MockedPracticeTestRepo.prototype.findByCourse).toHaveBeenCalledWith("c1");
    expect(result).toEqual([{ testid: "t1" }]);
  });

  it("startAttempt delegates to the test attempt repository", async () => {
    MockedTestAttemptRepo.prototype.start.mockResolvedValue({ attemptid: "a1" } as never);
    const service = new AssessmentService({} as never);
    await service.startAttempt("s1", "t1");
    expect(MockedTestAttemptRepo.prototype.start).toHaveBeenCalledWith("s1", "t1");
  });

  it("getResult delegates to the test result repository", async () => {
    MockedTestResultRepo.prototype.findByAttempt.mockResolvedValue({ attemptid: "a1" } as never);
    const service = new AssessmentService({} as never);
    await service.getResult("a1");
    expect(MockedTestResultRepo.prototype.findByAttempt).toHaveBeenCalledWith("a1");
  });
});
