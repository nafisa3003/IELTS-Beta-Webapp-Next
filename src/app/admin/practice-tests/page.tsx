import { createClient } from "@/lib/supabase/server";
import { CourseService } from "@/lib/services/course-service";
import { PracticeTestRepository } from "@/lib/repositories/practice-test.repository";
import { QuestionRepository } from "@/lib/repositories/question.repository";
import { AnswerOptionRepository } from "@/lib/repositories/answer-option.repository";
import { PassageRepository } from "@/lib/repositories/passage.repository";
import { CreateTestForm } from "./create-test-form";
import { TestSection } from "./test-section";

export default async function AdminPracticeTestsPage() {
  const supabase = await createClient();
  const courseService = new CourseService(supabase);
  const testRepo = new PracticeTestRepository(supabase);
  const questionRepo = new QuestionRepository(supabase);
  const optionRepo = new AnswerOptionRepository(supabase);
  const passageRepo = new PassageRepository(supabase);

  const courses = await courseService.browseAvailableCourses();
  const testsByCourse = await Promise.all(
    courses.map(async (c) => ({ course: c, tests: await testRepo.findByCourse(c.courseid) }))
  );
  const allTests = testsByCourse.flatMap((t) => t.tests);

  const questionsByTest = await Promise.all(
    allTests.map(async (t) => ({ test: t, questions: await questionRepo.findByTest(t.testid) }))
  );
  const passagesByTest = await Promise.all(
    allTests.map(async (t) => [t.testid, await passageRepo.findByTest(t.testid)] as const)
  );
  const passagesMap = new Map(passagesByTest);

  const allQuestions = questionsByTest.flatMap((q) => q.questions);
  const optionEntries = await Promise.all(
    allQuestions.map(async (q) => [q.questionid, await optionRepo.findAllByQuestion(q.questionid)] as const)
  );
  const optionsByQuestion = new Map(optionEntries);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Practice Tests</h1>

      {courses.length === 0 ? (
        <p className="text-sm text-slate-soft">Create a course first.</p>
      ) : (
        <CreateTestForm courses={courses} />
      )}

      <div className="flex flex-col gap-8">
        {questionsByTest.map(({ test, questions }) => (
          <TestSection
            key={test.testid}
            test={test}
            questions={questions}
            optionsByQuestion={optionsByQuestion}
            passages={passagesMap.get(test.testid) ?? []}
          />
        ))}
      </div>
    </div>
  );
}
