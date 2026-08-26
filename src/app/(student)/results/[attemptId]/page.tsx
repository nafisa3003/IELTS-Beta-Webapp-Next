import { createClient } from "@/lib/supabase/server";
import { AssessmentService } from "@/lib/services/assessment-service";
import { ResultsView } from "./results-view";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const supabase = await createClient();
  const service = new AssessmentService(supabase);
  const result = await service.getResult(attemptId);

  if (!result) {
    return <p className="text-sm text-danger">Result not found or not yet graded.</p>;
  }

  return <ResultsView result={result} />;
}
