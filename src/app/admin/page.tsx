import { createClient } from "@/lib/supabase/server";
import { PeopleIcon, BookIcon, TrendIcon, WarningIcon } from "@/components/icons/stat-icons";
import { SignupsChart } from "./signups-chart";
import { StaggerGroup, StaggerItem } from "@/components/ui/stagger-group";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AdminLogRow {
  logid: string;
  action: string;
  timestamp: string;
  admins: { users: { persons: { first_name: string; last_name: string } | null } | null } | null;
}

export default async function AdminHomePage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [
    { count: userCount },
    { count: studentCount },
    { count: teacherCount },
    { count: openTickets },
    { count: testsToday },
    { data: recentSignups },
    { data: logRows },
  ] = await Promise.all([
    supabase.from("users").select("userid", { count: "exact", head: true }),
    supabase.from("students").select("studentid", { count: "exact", head: true }),
    supabase.from("teachers").select("teacherid", { count: "exact", head: true }),
    supabase.from("support_tickets").select("ticketid", { count: "exact", head: true }).eq("status", "Open"),
    supabase
      .from("test_attempts")
      .select("attemptid", { count: "exact", head: true })
      .gte("submit_time", todayStart.toISOString()),
    supabase.from("users").select("created_at").gte("created_at", weekStart.toISOString()),
    supabase
      .from("admin_logs")
      .select("logid, action, timestamp, admins(users(persons(first_name, last_name)))")
      .order("timestamp", { ascending: false })
      .limit(5),
  ]);

  const signupsByDay = new Array(7).fill(0);
  (recentSignups ?? []).forEach((row) => {
    const diffDays = Math.floor((new Date(row.created_at).getTime() - weekStart.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) signupsByDay[diffDays] += 1;
  });
  const chartData = DAY_LABELS.map((day, i) => ({ day, count: signupsByDay[i] }));

  const logs = (logRows ?? []) as unknown as AdminLogRow[];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Admin Panel</h1>

      <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StaggerItem><StatCard icon={<PeopleIcon size={20} />} label="Total users" value={userCount ?? 0} accent="text-navy" /></StaggerItem>
        <StaggerItem><StatCard icon={<PeopleIcon size={20} />} label="Students" value={studentCount ?? 0} accent="text-teal" /></StaggerItem>
        <StaggerItem><StatCard icon={<PeopleIcon size={20} />} label="Teachers" value={teacherCount ?? 0} accent="text-violet" /></StaggerItem>
        <StaggerItem><StatCard icon={<TrendIcon size={20} />} label="Tests taken today" value={testsToday ?? 0} accent="text-xp" /></StaggerItem>
        <StaggerItem><StatCard icon={<WarningIcon size={20} />} label="Open tickets" value={openTickets ?? 0} accent="text-danger" /></StaggerItem>
      </StaggerGroup>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-lg bg-surface p-6 shadow-card">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">New signups this week</h2>
          <SignupsChart data={chartData} />
        </section>

        <section className="rounded-lg bg-surface p-6 shadow-card">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Recent admin activity</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-soft">No activity logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {logs.map((l) => {
                const person = l.admins?.users?.persons;
                return (
                  <li key={l.logid} className="text-xs">
                    <span className="text-slate-soft">{new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>{" "}
                    <span className="font-semibold text-ink">{person ? `${person.first_name} ${person.last_name}` : "System"}</span>{" "}
                    <span className="text-slate">{l.action}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <a href="/admin/logs" className="mt-3 inline-block text-xs font-semibold text-teal">
            View all logs →
          </a>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/admin/users", label: "Users", blurb: "Manage accounts and roles" },
          { href: "/admin/courses", label: "Courses", blurb: "Create and edit courses" },
          { href: "/admin/content", label: "Content", blurb: "Add lessons to courses" },
          { href: "/admin/practice-tests", label: "Practice Tests", blurb: "Build tests, questions, and options" },
          { href: "/admin/announcements", label: "Announcements", blurb: "Post to all users" },
          { href: "/admin/support", label: "Support", blurb: "Resolve student tickets" },
          { href: "/admin/logs", label: "Logs", blurb: "Review system activity" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-lg border border-mist bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-teal hover:shadow-card"
          >
            <p className="text-sm font-semibold text-ink">{item.label}</p>
            <p className="mt-1 text-xs text-slate-soft">{item.blurb}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-card">
      <div className={`mb-1.5 ${accent}`}>{icon}</div>
      <p className="text-xs text-slate-soft">{label}</p>
      <p className={`font-display text-xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
