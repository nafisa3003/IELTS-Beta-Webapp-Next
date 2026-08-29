export type Skill = "Listening" | "Reading" | "Writing" | "Speaking";
export type TestCategory = "Academic" | "General";

export interface PracticeTest {
  testid: string;
  courseid: string;
  audio_url: string | null;
  title: string;
  category: TestCategory;
  duration: number;
  total_marks: number;
}

export interface Question {
  questionid: string;
  testid: string;
  passageid: string | null;
  question: string;
  skill: Skill;
  marks: number;
}

export interface AnswerOptionPublic {
  optionid: string;
  questionid: string;
  option_text: string;
}

export interface AnswerOption extends AnswerOptionPublic {
  is_correct: boolean;
}

export interface TestAttempt {
  attemptid: string;
  studentid: string;
  testid: string;
  start_time: string;
  submit_time: string | null;
  score: number | null;
  band_score: number | null;
}

export interface TestResult {
  resultid: string;
  attemptid: string;
  overall_band: number | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  feedback: string | null;
}

/** studentid -> chosen optionid, keyed by questionid */
export type SubmittedAnswers = Record<string, string>;

export interface Passage {
  passageid: string;
  testid: string;
  title: string;
  passage_text: string;
  order_index: number;
}

export interface WrittenResponse {
  responseid: string;
  attemptid: string;
  questionid: string;
  answer_text: string;
}
