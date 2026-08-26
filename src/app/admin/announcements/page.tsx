import { createClient } from "@/lib/supabase/server";
import { AnnouncementRepository } from "@/lib/repositories/announcement.repository";
import { CreateAnnouncementForm } from "./create-announcement-form";
import { AnnouncementRow } from "./announcement-row";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoIcon } from "@/components/icons/stat-icons";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const announcements = await new AnnouncementRepository(supabase).findAll();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Announcements</h1>

      <CreateAnnouncementForm />

      <div className="flex flex-col gap-3">
        {announcements.map((a) => (
          <AnnouncementRow key={a.announcementid} announcement={a} />
        ))}
        {announcements.length === 0 && (
          <EmptyState icon={<InfoIcon size={28} />} title="No announcements yet" body="Post one above — it'll show up for every student and teacher." />
        )}
      </div>
    </div>
  );
}
