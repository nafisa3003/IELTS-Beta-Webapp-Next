"use client";

import { useActionState, useEffect, useState } from "react";
import { notify } from "@/lib/toast";
import type { Course, CourseBatch } from "@/types/courses";
import type { TeacherCourseWithName } from "@/lib/repositories/teacher-course.repository";
import type { EnrollmentWithStudentName } from "@/lib/repositories/enrollment.repository";
import type { TeacherOption } from "@/lib/repositories/teacher.repository";
import {
  updateCourseAction,
  deleteCourseAction,
  assignTeacherAction,
  unassignTeacherAction,
  updateEnrollmentStatusAction,
} from "./actions";
import { createBatchAction, deactivateBatchAction } from "./batch-actions";
import { CalendarIcon } from "@/components/icons/stat-icons";

type ActionResult = { error?: string; success?: boolean } | null;

export function CourseCard({
  course,
  teacherLinks,
  enrollments,
  allTeachers,
  batches,
}: {
  course: Course;
  teacherLinks: TeacherCourseWithName[];
  enrollments: EnrollmentWithStudentName[];
  allTeachers: TeacherOption[];
  batches: CourseBatch[];
}) {
  const [editing, setEditing] = useState(false);
  const [managing, setManaging] = useState(false);

  return (
    <div className="rounded-lg border border-mist bg-surface shadow-card">
      <div className="flex items-center justify-between px-4 py-3">
        {editing ? (
          <EditCourseForm course={course} onDone={() => setEditing(false)} />
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-ink">
                {course.title}{" "}
                {course.course_code && (
                  <span className="ml-1 rounded-pill bg-mist px-2 py-0.5 text-[10px] font-semibold text-slate-soft">
                    {course.course_code}
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-soft">
                {course.level ?? "—"} · {course.duration ?? "—"} · {teacherLinks.length} teacher
                {teacherLinks.length === 1 ? "" : "s"} · {enrollments.filter((e) => e.status === "active").length}{" "}
                enrolled
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setManaging((m) => !m)}
                className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate hover:border-teal hover:text-teal"
              >
                {managing ? "Close" : "Manage"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate hover:border-teal hover:text-teal"
              >
                Edit
              </button>
              <DeleteCourseButton courseid={course.courseid} title={course.title} />
            </div>
          </>
        )}
      </div>

      {managing && (
        <div className="border-t border-mist p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TeacherAssignmentPanel courseid={course.courseid} teacherLinks={teacherLinks} allTeachers={allTeachers} />
            <EnrollmentPanel enrollments={enrollments} />
          </div>
          <div className="mt-4 border-t border-mist pt-4">
            <BatchPanel courseid={course.courseid} batches={batches} />
          </div>
        </div>
      )}
    </div>
  );
}

function EditCourseForm({ course, onDone }: { course: Course; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateCourseAction, null);

  useEffect(() => {
    if (state?.success) {
      notify.success("Course updated.");
      onDone();
    }
    if (state?.error) notify.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid w-full grid-cols-2 gap-2">
      <input type="hidden" name="courseid" value={course.courseid} />
      <input name="title" defaultValue={course.title} required className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <input name="level" defaultValue={course.level ?? ""} className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <input name="duration" defaultValue={course.duration ?? ""} className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <input name="description" defaultValue={course.description ?? ""} className="rounded-md border border-mist px-2 py-1.5 text-sm" />
      <div className="col-span-2 flex gap-2">
        <button type="submit" disabled={pending} className="rounded-pill bg-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          {pending ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onDone} className="rounded-pill border border-mist px-3 py-1.5 text-xs font-semibold text-slate">
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeleteCourseButton({ courseid, title }: { courseid: string; title: string }) {
  const [pending, setPending] = useState(false);

  function handleClick() {
    notify.confirm(
      `Delete "${title}"? This also removes its content, tests, teacher assignments, and student enrollments.`,
      async () => {
        setPending(true);
        const result = await deleteCourseAction(courseid);
        setPending(false);
        if (result?.error) notify.error(result.error);
        else notify.success("Course deleted.");
      },
      "Delete"
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-pill border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger hover:text-white disabled:opacity-50"
    >
      Delete
    </button>
  );
}

function TeacherAssignmentPanel({
  courseid,
  teacherLinks,
  allTeachers,
}: {
  courseid: string;
  teacherLinks: TeacherCourseWithName[];
  allTeachers: TeacherOption[];
}) {
  const [pending, setPending] = useState(false);
  const assignedIds = new Set(teacherLinks.map((t) => t.teacherid));
  const available = allTeachers.filter((t) => !assignedIds.has(t.teacherid));

  async function handleAssign(formData: FormData) {
    setPending(true);
    const result = await assignTeacherAction(formData);
    setPending(false);
    if (result?.error) notify.error(result.error);
    else notify.success("Teacher assigned.");
  }

  async function handleUnassign(teachercourseid: string) {
    setPending(true);
    const result = await unassignTeacherAction(teachercourseid);
    setPending(false);
    if (result?.error) notify.error(result.error);
    else notify.success("Teacher removed.");
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-soft">Teachers</h3>
      <div className="mb-3 flex flex-col gap-1.5">
        {teacherLinks.length === 0 && <p className="text-xs text-slate-soft">No teacher assigned yet.</p>}
        {teacherLinks.map((t) => (
          <div key={t.teachercourseid} className="flex items-center justify-between rounded-md border border-mist px-3 py-1.5">
            <span className="text-xs text-ink">{t.teacher_name}</span>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleUnassign(t.teachercourseid)}
              className="text-xs font-semibold text-danger hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {available.length > 0 && (
        <form action={handleAssign} className="flex gap-2">
          <input type="hidden" name="courseid" value={courseid} />
          <select name="teacherid" required className="flex-1 rounded-md border border-mist px-2 py-1.5 text-xs">
            <option value="">Assign a teacher...</option>
            {available.map((t) => (
              <option key={t.teacherid} value={t.teacherid}>
                {t.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={pending} className="rounded-pill bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
            Assign
          </button>
        </form>
      )}
    </div>
  );
}

function EnrollmentPanel({ enrollments }: { enrollments: EnrollmentWithStudentName[] }) {
  const [pending, setPending] = useState<string | null>(null);

  async function handleStatusChange(enrollid: string, status: "active" | "completed" | "dropped") {
    setPending(enrollid);
    const result = await updateEnrollmentStatusAction(enrollid, status);
    setPending(null);
    if (result?.error) notify.error(result.error);
    else notify.success("Enrollment updated.");
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-soft">Students</h3>
      {enrollments.length === 0 ? (
        <p className="text-xs text-slate-soft">No students enrolled yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {enrollments.map((e) => (
            <div key={e.enrollid} className="flex items-center justify-between rounded-md border border-mist px-3 py-1.5">
              <span className="text-xs text-ink">{e.student_name}</span>
              <select
                value={e.status}
                disabled={pending === e.enrollid}
                onChange={(ev) => handleStatusChange(e.enrollid, ev.target.value as "active" | "completed" | "dropped")}
                className="rounded-md border border-mist px-2 py-1 text-xs"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BatchPanel({ courseid, batches }: { courseid: string; batches: CourseBatch[] }) {
  const [pending, setPending] = useState(false);

  async function handleCreate(formData: FormData) {
    setPending(true);
    const result = await createBatchAction(formData);
    setPending(false);
    if (result?.error) notify.error(result.error);
    else notify.success("Batch created.");
  }

  async function handleClose(batchid: string) {
    setPending(true);
    const result = await deactivateBatchAction(batchid);
    setPending(false);
    if (result?.error) notify.error(result.error);
    else notify.success("Batch closed.");
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-soft">Batches</h3>
      {batches.length === 0 ? (
        <p className="mb-2 text-xs text-slate-soft">No batches yet — create one to run a scheduled intake.</p>
      ) : (
        <div className="mb-3 flex flex-col gap-1.5">
          {batches.map((b) => (
            <div key={b.batchid} className="flex items-center justify-between rounded-md border border-mist px-3 py-1.5">
              <span className="flex items-center gap-2 text-xs text-ink">
                <CalendarIcon size={14} className={b.is_active ? "text-teal" : "text-slate-soft"} />
                {b.batch_code}
                {b.starts_on && ` · starts ${new Date(b.starts_on).toLocaleDateString()}`}
                {b.seats_total != null && ` · ${b.seats_total} seats`}
                {b.enrollment_deadline && ` · closes ${new Date(b.enrollment_deadline).toLocaleDateString()}`}
                {!b.is_active && " · closed"}
              </span>
              {b.is_active && (
                <button type="button" disabled={pending} onClick={() => handleClose(b.batchid)} className="text-xs font-semibold text-danger hover:underline">
                  Close
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <form action={handleCreate} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="courseid" value={courseid} />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-soft">Starts on</label>
          <input name="starts_on" type="date" className="rounded-md border border-mist px-2 py-1 text-xs" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-soft">Seats</label>
          <input name="seats_total" type="number" min="1" className="w-20 rounded-md border border-mist px-2 py-1 text-xs" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-soft">Enrollment closes</label>
          <input name="enrollment_deadline" type="date" className="rounded-md border border-mist px-2 py-1 text-xs" />
        </div>
        <button type="submit" disabled={pending} className="rounded-pill bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          Add batch
        </button>
      </form>
    </div>
  );
}
