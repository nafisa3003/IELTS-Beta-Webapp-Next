import { createClient } from "@/lib/supabase/server";
import { CourseService } from "@/lib/services/course-service";
import { CourseBatchRepository } from "@/lib/repositories/course-batch.repository";
import { VideoTypeIcon, PdfTypeIcon, YoutubeTypeIcon, NotesTypeIcon, BookIcon, UrgencyIcon } from "@/components/icons/stat-icons";
import { EnrollButton, DropCourseButton } from "./enrollment-controls";
import type { ContentType, CourseBatch } from "@/types/courses";

const CONTENT_ICON: Record<ContentType, typeof VideoTypeIcon> = {
  Video: VideoTypeIcon,
  PDF: PdfTypeIcon,
  YouTube: YoutubeTypeIcon,
  Notes: NotesTypeIcon,
};

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

/** Picks the most relevant active batch for a course's urgency CTA — the
 * soonest closing deadline wins, falling back to the batch with fewest
 * seats left. Real data only: if a course has no batches, no CTA shows. */
async function pickUrgentBatch(batchRepo: CourseBatchRepository, courseid: string) {
  const batches = await batchRepo.findByCourse(courseid);
  const active = batches.filter((b) => b.is_active);
  if (active.length === 0) return null;

  const withCounts = await Promise.all(
    active.map(async (b) => ({ batch: b, enrolled: await batchRepo.enrolledCount(b.batchid) }))
  );

  const withDeadline = withCounts.filter((b) => b.batch.enrollment_deadline && daysUntil(b.batch.enrollment_deadline!) >= 0);
  if (withDeadline.length > 0) {
    withDeadline.sort((a, b) => daysUntil(a.batch.enrollment_deadline!) - daysUntil(b.batch.enrollment_deadline!));
    return withDeadline[0];
  }

  const withSeats = withCounts.filter((b) => b.batch.seats_total != null);
  if (withSeats.length > 0) {
    withSeats.sort((a, b) => a.batch.seats_total! - a.enrolled - (b.batch.seats_total! - b.enrolled));
    return withSeats[0];
  }

  return withCounts[0];
}

function urgencyLabel(batch: CourseBatch, enrolled: number): string | null {
  if (batch.enrollment_deadline) {
    const days = daysUntil(batch.enrollment_deadline);
    if (days <= 14) return `${batch.batch_code} enrollment closes in ${days} day${days === 1 ? "" : "s"} — hurry up!`;
  }
  if (batch.seats_total != null) {
    const left = batch.seats_total - enrolled;
    if (left <= 10) return `${batch.batch_code} — only ${Math.max(left, 0)} seat${left === 1 ? "" : "s"} left!`;
  }
  return `${batch.batch_code} enrollment is open now`;
}

export async function LessonsPanel({ studentid }: { studentid: string }) {
  const supabase = await createClient();
  const service = new CourseService(supabase);
  const batchRepo = new CourseBatchRepository(supabase);
  const [views, browsable] = await Promise.all([
    service.getStudentLearningView(studentid),
    service.browseUnenrolledCourses(studentid),
  ]);

  const urgentByCourse = await Promise.all(
    browsable.map(async (c) => ({ courseid: c.courseid, urgent: await pickUrgentBatch(batchRepo, c.courseid) }))
  );
  const urgentMap = new Map(urgentByCourse.map((u) => [u.courseid, u.urgent]));

  return (
    <div className="flex flex-col gap-10">
      <section>
        {views.length === 0 ? (
          <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-mist p-6">
            <BookIcon size={32} />
            <h2 className="font-display text-lg font-semibold text-navy dark:text-white">No courses yet</h2>
            <p className="text-sm text-slate">Enroll in a course below to see its lessons here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {views.map(({ enrollid, course, contents }) => (
              <div key={course.courseid} className="rounded-lg bg-surface p-6 shadow-card">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="font-display text-lg font-semibold text-ink">{course.title}</h2>
                  <div className="flex items-center gap-2">
                    {course.level && (
                      <span className="rounded-pill bg-mist px-3 py-1 text-xs font-medium text-slate">{course.level}</span>
                    )}
                    <DropCourseButton enrollid={enrollid} title={course.title} />
                  </div>
                </div>
                {contents.length === 0 ? (
                  <p className="text-sm text-slate-soft">No lessons published yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {contents.map((content) => {
                      const Icon = CONTENT_ICON[content.content_type];
                      return (
                        <li
                          key={content.contentid}
                          className="flex items-center gap-3 rounded-md border border-mist px-4 py-3 text-sm text-ink"
                        >
                          <Icon size={18} className="shrink-0 text-teal" />
                          <span className="flex-1">{content.title}</span>
                          <span className="text-xs text-slate-soft">{content.content_type}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {browsable.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Browse courses</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {browsable.map((course) => {
              const urgent = urgentMap.get(course.courseid);
              return (
                <div key={course.courseid} className="flex flex-col gap-2 rounded-lg border border-mist bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink">{course.title}</p>
                    {course.course_code && (
                      <span className="rounded-pill bg-mist px-2 py-0.5 text-[10px] font-semibold text-slate-soft">
                        {course.course_code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-soft">
                    {course.level ?? "—"} · {course.duration ?? "—"}
                  </p>
                  {course.description && <p className="text-xs text-slate line-clamp-2">{course.description}</p>}
                  {urgent && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-coral">
                      <UrgencyIcon size={13} /> {urgencyLabel(urgent.batch, urgent.enrolled)}
                    </p>
                  )}
                  <EnrollButton courseid={course.courseid} batchid={urgent?.batch.batchid ?? null} title={course.title} />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
