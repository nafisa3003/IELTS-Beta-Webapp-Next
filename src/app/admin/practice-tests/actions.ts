"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PracticeTestRepository } from "@/lib/repositories/practice-test.repository";
import { QuestionRepository } from "@/lib/repositories/question.repository";
import { AnswerOptionRepository } from "@/lib/repositories/answer-option.repository";
import type { Skill, TestCategory } from "@/types/assessment";

type ActionResult = { error?: string; success?: boolean } | null;
const REVALIDATE = "/admin/practice-tests";

// ---------- Practice tests ----------

export async function createTestAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const courseid = String(formData.get("courseid") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as TestCategory;
  const duration = Number(formData.get("duration"));
  const totalMarks = Number(formData.get("total_marks"));

  if (!courseid || !title || !category || !duration || !totalMarks) {
    return { error: "Fill in every field" };
  }

  const supabase = await createClient();
  try {
    await new PracticeTestRepository(supabase).create({ courseid, title, category, duration, total_marks: totalMarks });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't create test" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

export async function updateTestAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const testid = String(formData.get("testid") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as TestCategory;
  const duration = Number(formData.get("duration"));
  const totalMarks = Number(formData.get("total_marks"));

  if (!testid || !title || !category || !duration || !totalMarks) {
    return { error: "Fill in every field" };
  }

  const supabase = await createClient();
  try {
    await new PracticeTestRepository(supabase).update(testid, { title, category, duration, total_marks: totalMarks });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update test" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

export async function deleteTestAction(testid: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    await new PracticeTestRepository(supabase).delete(testid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't delete test" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

// ---------- Questions ----------

export async function createQuestionAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const testid = String(formData.get("testid") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const skill = String(formData.get("skill") ?? "") as Skill;
  const marks = Number(formData.get("marks")) || 1;

  if (!testid || !question || !skill) return { error: "Fill in every field" };

  const supabase = await createClient();
  try {
    await new QuestionRepository(supabase).create({ testid, question, skill, marks });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't add question" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

export async function updateQuestionAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const questionid = String(formData.get("questionid") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const skill = String(formData.get("skill") ?? "") as Skill;
  const marks = Number(formData.get("marks")) || 1;

  if (!questionid || !question || !skill) return { error: "Fill in every field" };

  const supabase = await createClient();
  try {
    await new QuestionRepository(supabase).update(questionid, { question, skill, marks });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update question" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

export async function deleteQuestionAction(questionid: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    await new QuestionRepository(supabase).delete(questionid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't delete question" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

// ---------- Answer options ----------

export async function createOptionAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const questionid = String(formData.get("questionid") ?? "");
  const optionText = String(formData.get("option_text") ?? "").trim();
  const isCorrect = formData.get("is_correct") === "on";

  if (!questionid || !optionText) return { error: "Enter the option text" };

  const supabase = await createClient();
  try {
    await new AnswerOptionRepository(supabase).create({ questionid, option_text: optionText, is_correct: isCorrect });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't add option" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

export async function updateOptionAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const optionid = String(formData.get("optionid") ?? "");
  const optionText = String(formData.get("option_text") ?? "").trim();
  const isCorrect = formData.get("is_correct") === "on";

  if (!optionid || !optionText) return { error: "Enter the option text" };

  const supabase = await createClient();
  try {
    await new AnswerOptionRepository(supabase).update(optionid, { option_text: optionText, is_correct: isCorrect });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update option" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}

export async function deleteOptionAction(optionid: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    await new AnswerOptionRepository(supabase).delete(optionid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't delete option" };
  }
  revalidatePath(REVALIDATE);
  return { success: true };
}
