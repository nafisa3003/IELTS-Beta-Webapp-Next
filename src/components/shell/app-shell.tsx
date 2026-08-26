import { TopNav, type NavRole } from "@/components/shell/top-nav";
import { createClient } from "@/lib/supabase/server";
import { EmailVerificationBanner } from "./email-verification-banner";

export async function AppShell({
  role,
  children,
}: {
  role: NavRole;
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = "";
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("personid, persons(first_name, last_name)")
      .eq("userid", user.id)
      .single();
    const person = (data as unknown as { persons: { first_name: string; last_name: string } | null })
      ?.persons;
    displayName = person ? `${person.first_name} ${person.last_name}` : user.email ?? "";
  }

  return (
    <div className="min-h-screen bg-paper">
      <EmailVerificationBanner /> 
      <TopNav role={role} displayName={displayName} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}