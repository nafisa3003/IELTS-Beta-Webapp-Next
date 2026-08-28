import { createClient } from "@/lib/supabase/server";
import { LiveClassRepository } from "@/lib/repositories/live-class.repository";
import { CalendarIcon } from "@/components/icons/stat-icons";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminLiveClassesPage() {
  const supabase = await createClient();
  const classes = await new LiveClassRepository(supabase).findAllWithDetails();
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Live Classes</h1>

      {classes.length === 0 ? (
        <EmptyState icon={<CalendarIcon size={28} />} title="No live classes scheduled" body="Classes scheduled by teachers will show up here." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-mist bg-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-soft">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Date & time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => {
                const upcoming = new Date(c.class_date).getTime() >= now;
                return (
                  <tr key={c.classid} className="border-t border-mist">
                    <td className="px-4 py-3 text-ink">{c.courseTitle}</td>
                    <td className="px-4 py-3 text-slate">{c.teacherName}</td>
                    <td className="px-4 py-3 text-slate">{new Date(c.class_date).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {upcoming ? (
                        <span className="rounded-pill bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">Upcoming</span>
                      ) : (
                        <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-medium text-slate-soft">Past</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a href={c.meeting_link} className="font-medium text-teal" target="_blank" rel="noreferrer">Join link</a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
