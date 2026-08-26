import { AppShell } from "@/components/shell/app-shell";
import { requireOnboarding } from "@/lib/auth/require-onboarding";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarding(); // ← blocks if onboarding not done

  return <AppShell role="student">{children}</AppShell>;
}