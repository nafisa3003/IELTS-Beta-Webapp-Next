import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getCurrentStudentId } from "@/lib/auth/current-user";

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  const studentid = await getCurrentStudentId();
  if (!studentid) redirect("/dashboard");
  return <AppShell role="student">{children}</AppShell>;
}
