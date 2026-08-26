export interface Course {
  courseid: string;
  course_code: string | null;
  title: string;
  description: string | null;
  level: string | null;
  duration: string | null;
  created_at: string;
}

export interface TeacherCourse {
  teachercourseid: string;
  teacherid: string;
  courseid: string;
  assigned_at: string;
  is_active: boolean;
}

export interface Enrollment {
  enrollid: string;
  studentid: string;
  courseid: string;
  status: "active" | "completed" | "dropped";
  enroll_date: string;
  batchid: string | null;
}

export interface CourseBatch {
  batchid: string;
  courseid: string;
  batch_number: number;
  batch_code: string;
  starts_on: string | null;
  seats_total: number | null;
  enrollment_deadline: string | null;
  is_active: boolean;
  created_at: string;
}

export type ContentType = "Video" | "PDF" | "YouTube" | "Notes";

export interface Content {
  contentid: string;
  courseid: string;
  title: string;
  content_type: ContentType;
  youtube_link: string | null;
  file_url: string | null;
  created_at: string;
}

export interface LiveClass {
  classid: string;
  teachercourseid: string;
  meeting_link: string;
  class_date: string;
}
