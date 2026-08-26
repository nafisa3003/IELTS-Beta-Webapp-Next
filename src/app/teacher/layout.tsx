import { AppShell } from "@/components/shell/app-shell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="teacher">{children}</AppShell>;
}
