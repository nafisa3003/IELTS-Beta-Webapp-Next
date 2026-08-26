import { createClient } from "@/lib/supabase/server";
import { AnnouncementRepository } from "@/lib/repositories/announcement.repository";
import { InfoIcon } from "@/components/icons/stat-icons";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const announcements = await new AnnouncementRepository(supabase).findAll();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Announcements</h1>

      {announcements.length === 0 ? (
        <p className="text-sm text-slate-soft">No announcements yet — check back soon.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a.announcementid} className="flex gap-3 rounded-lg bg-surface p-4 shadow-card">
              <InfoIcon size={20} className="mt-0.5 shrink-0" />
              <div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-semibold text-ink">{a.title}</h2>
                  <span className="text-xs text-slate-soft">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
