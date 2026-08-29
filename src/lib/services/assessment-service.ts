import type { SupabaseClient } from "@supabase/supabase-js";
import { PracticeTestRepository } from "@/lib/repositories/practice-test.repository";
import { QuestionRepository } from "@/lib/repositories/question.repository";
import { AnswerOptionRepository } from "@/lib/repositories/answer-option.repository";
import { TestAttemptRepository } from "@/lib/repositories/test-attempt.repository";
import { TestResultRepository } from "@/lib/repositories/test-result.repository";
import { PassageRepository } from "@/lib/repositories/passage.repository";
import { WrittenResponseRepository } from "@/lib/repositories/written-response.repository";
import { createAdminClient } from "@/lib/supabase/admin";
import { strategyFor } from "@/lib/scoring/strategy";
import type { Question, SubmittedAnswers, Skill, Passage } from "@/types/assessment";

export interface TestWithQuestions {
  test: NonNullable<Awaited<ReturnType<PracticeTestRepository["findById"]>>>;
  passages: Passage[];
  questionsBySkill: Partial<Record<Skill, { question: Question; options: { optionid: string; option_text: string }[] }[]>>;
}

export class AssessmentService {
  private tests: PracticeTestRepository;
  private questions: QuestionRepository;
  private answerOptions: AnswerOptionRepository;
  private attempts: TestAttemptRepository;
  private results: TestResultRepository;
  private passages: PassageRepository;
  private writtenResponses: WrittenResponseRepository;

  constructor(private readonly db: SupabaseClient) {
    this.tests = new PracticeTestRepository(db);
    this.questions = new QuestionRepository(db);
    this.answerOptions = new AnswerOptionRepository(db);
    this.attempts = new TestAttemptRepository(db);
    this.results = new TestResultRepository(db);
    this.passages = new PassageRepository(db);
    this.writtenResponses = new WrittenResponseRepository(db);
  }

  async listTestsForCourse(courseid: string) {
    return this.tests.findByCourse(courseid);
  }

  /** Tests belonging to any of the given courses that contain at least one question in this skill. */
  async listTestsForSkill(courseIds: string[], skill: Skill) {
    if (courseIds.length === 0) return [];
    const { data, error } = await this.db
      .from("practice_tests")
      .select("*, questions!inner(skill)")
      .in("courseid", courseIds)
      .eq("questions.skill", skill);
    if (error) throw error;
    // dedupe — the join can repeat a test once per matching question
    const seen = new Map<string, (typeof data)[number]>();
    for (const row of data) seen.set(row.testid, row);
    return Array.from(seen.values());
  }

  /**
   * Renders a test to a student — options never include is_correct.
   * Also returns any reading passages attached to this test, ordered
   * for display, so the UI can render passage + questions side-by-side.
   */
  async getTestForTaking(testid: string): Promise<TestWithQuestions | null> {
    const test = await this.tests.findById(testid);
    if (!test) return null;

    const [questions, passages] = await Promise.all([
      this.questions.findByTest(testid),
      this.passages.findByTest(testid),
    ]);

    const questionsBySkill: TestWithQuestions["questionsBySkill"] = {};

    for (const q of questions) {
      const options = await this.answerOptions.findPublicByQuestion(q.questionid);
      questionsBySkill[q.skill] ??= [];
      questionsBySkill[q.skill]!.push({ question: q, options });
    }

    return { test, passages, questionsBySkill };
  }

  async startAttempt(studentid: string, testid: string) {
    return this.attempts.start(studentid, testid);
  }

  /**
   * Submits an attempt: runs each skill's ScoringStrategy, writes the
   * attempt's aggregate score/band, and creates test_results. Grading an
   * attempt (band_score going from null to non-null) is what fires the
   * Observer trigger in the DB (0007_observer.sql) — XP + admin log.
   * Must use the admin client because is_correct is invisible to the
   * student's own RLS session.
   *
   * Writing/Speaking answers are free text and never auto-scored — they're
   * persisted to written_responses so a teacher has something to grade
   * against the rubric, and their skill score is left with a null band.
   */
  async submitAttempt(attemptid: string, testid: string, answers: SubmittedAnswers) {
    const adminDb = createAdminClient();
    const adminQuestions = new QuestionRepository(adminDb);
    const adminAnswerOptions = new AnswerOptionRepository(adminDb);
    const adminWrittenResponses = new WrittenResponseRepository(adminDb);

    const questions = await adminQuestions.findByTest(testid);
    const options = await adminAnswerOptions.findAllByTest(testid);

    const bySkill = new Map<Skill, Question[]>();
    for (const q of questions) {
      const list = bySkill.get(q.skill) ?? [];
      list.push(q);
      bySkill.set(q.skill, list);
    }

    const skillScores = Array.from(bySkill.entries()).map(([skill, qs]) =>
      strategyFor(skill).score(qs, options, answers)
    );

    const totalRaw = skillScores.reduce((s, sc) => s + sc.raw, 0);
    const totalMax = skillScores.reduce((s, sc) => s + sc.maxRaw, 0);

    const gradedBands = skillScores.filter((s): s is typeof s & { band: number } => s.band !== null);
    const overallBand =
      gradedBands.length > 0
        ? Math.round((gradedBands.reduce((s, sc) => s + sc.band, 0) / gradedBands.length) * 2) / 2
        : 0;

    const attempt = await this.attempts.submit(attemptid, totalRaw, overallBand);

    const bandBySkill: Partial<Record<Skill, number>> = {};
    for (const s of skillScores) {
      if (s.band !== null) bandBySkill[s.skill] = s.band;
    }
    await this.results.create(attemptid, bandBySkill, overallBand);

    // Persist free-text Writing/Speaking answers for teacher grading.
    const subjectiveEntries = questions
      .filter((q) => q.skill === "Writing" || q.skill === "Speaking")
      .map((q) => ({ questionid: q.questionid, answer_text: answers[q.questionid] ?? "" }))
      .filter((e) => e.answer_text.trim().length > 0);
    await adminWrittenResponses.upsertMany(attemptid, subjectiveEntries);

    return { attempt, skillScores, totalRaw, totalMax };
  }

  async getResult(attemptid: string) {
    return this.results.findByAttempt(attemptid);
  }

  /** For a teacher/admin grading view: what the student actually wrote. */
  async getWrittenResponses(attemptid: string) {
    return this.writtenResponses.findByAttempt(attemptid);
  }
}
