import { createClient } from "@/lib/supabase/server";
import { getCurrentStudentId } from "@/lib/auth/current-user";
import { LearningTabs } from "./learning-tabs";
import { LessonsPanel } from "./lessons-panel";
import { VocabularyPanel } from "./vocabulary-panel";

export default async function LearningPage() {
  const studentid = await getCurrentStudentId();
  if (!studentid) {
    return <p className="text-sm text-slate">You need a student account to view this page.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Learning</h1>
      <LearningTabs
        lessons={<LessonsPanel studentid={studentid} />}
        vocabulary={user ? <VocabularyPanel userid={user.id} /> : null}
      />
    </div>
  );
}
