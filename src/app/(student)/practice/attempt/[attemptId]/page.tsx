import { createClient } from "@/lib/supabase/server";
import { AssessmentService } from "@/lib/services/assessment-service";
import { AttemptForm } from "./attempt-form";

export default async function AttemptPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ testid?: string }>;
}) {
  const { attemptId } = await params;
  const { testid } = await searchParams;

  if (!testid) {
    return <p className="text-sm text-danger">Missing test reference.</p>;
  }

  const supabase = await createClient();
  const service = new AssessmentService(supabase);
  const data = await service.getTestForTaking(testid);

  if (!data) {
    return <p className="text-sm text-danger">Test not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">{data.test.title}</h1>
        <p className="text-sm text-slate-soft">
          {data.test.duration} min · {data.test.total_marks} marks
        </p>
      </div>
      <AttemptForm attemptid={attemptId} testid={testid} data={data} />
    </div>
  );
}
