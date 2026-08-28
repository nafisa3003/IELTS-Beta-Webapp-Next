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
  let avatarUrl: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("personid, persons(first_name, last_name, avatar_url)")
      .eq("userid", user.id)
      .single();

    const person = (data as unknown as { 
      persons: { 
        first_name: string; 
        last_name: string; 
        avatar_url: string | null 
      } | null 
    })?.persons;

    displayName = person ? `${person.first_name} ${person.last_name}` : user.email ?? "";
    avatarUrl = person?.avatar_url ?? null;
  }

  return (
    <div className="min-h-screen bg-paper">
      <EmailVerificationBanner /> 
      <TopNav role={role} displayName={displayName} avatarUrl={avatarUrl} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
