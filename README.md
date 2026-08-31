# IELTS-Beta-WebApp-Next

<video src="https://github.com/user-attachments/assets/b9edd5e2-a95d-44d9-80ee-3b3201973a61" controls autoplay loop muted width="100%"></video>

IELTS-Beta-WebApp-Next is a full-stack IELTS learning platform developed as a university capstone project.
The application is an **ERD-driven Next.js + Supabase rebuild** focused on IELTS learning, assessment, progress tracking, and role-based experiences for Students, Teachers, and Administrators.

---

🔗 **[Live Demo](https://ielts-beta-webapp-next.vercel.app/)**

> ⚠️ **Note:** The AI Tutor feature is deployed separately (FastAPI + LangGraph) on a free-tier
> host and currently crashes on startup due to that tier's memory limit — it will show as
> offline on the live demo. The feature is fully functional when run locally; see
> [Setup](#setup) below.

🎥 **[Full Walkthrough Video](#)** — Student, Teacher, and Admin flows *(link pending)*

## Features

- Student dashboard with band and skill progress analytics
- IELTS Listening, Reading, Writing, and Speaking workflows
- Course browsing, enrollment, and learning content
- Practice tests, attempts, and results
- Live classes and announcements
- Support tickets
- Student, Teacher, and Admin portals
- Profile and account settings
- Supabase Storage profile image uploads
- Role-based access control with RLS
- Responsive light/dark interface
- Toast notifications and interactive UI

---

## Technology Stack

- **Next.js 15** — App Router
- **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion**
- **Supabase Auth + PostgreSQL + Storage**
- **Zustand**
- **TanStack Query**
- **React Hook Form + Zod**
- **Recharts**
- **Sonner**

---

## Database Design

The application follows the approved **ERD as the primary source of truth** for its relational database architecture.

**Final ERD:**  
[`View ERD`](./docs/assets/ERD/final-ERD.png)

---

## Design Patterns

Five software design patterns are implemented in the application:

1. Repository
2. Factory Method
3. Strategy
4. Facade
5. Observer

**Design Patterns:** [`DESIGN-PATTERNS.md`](./DESIGN-PATTERNS.md)

---

## Testing
 
Automated tests (Jest) cover the scoring, validation, repository, and service layers, with mocking/stubbing of external dependencies (the Supabase client, and repository-level dependencies) and 50%+ line/branch coverage on the tested backend logic.
 
**Testing:** [`TESTING.md`](./TESTING.md)
 
---

## Setup

```bash
npm install
```

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. 

(Supabase dashboard → Settings → API → `service_role` key.) Without this, submitting a practice test will throw on purpose — scoring needs it to read `answer_options.is_correct`, which RLS correctly hides from students otherwise. It's also required for account deletion (Settings → Delete account), which calls the Supabase Admin API.

Run `supabase/run_all.sql` in your Supabase project's SQL Editor before testing anything that touches the database.

---

## Run

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign up as a student and as a teacher (two accounts) to test both sides — admin accounts aren't self-serve by design: promote a user's role to `admin` from `/admin/users` once you have at least one admin account, or set one directly in Supabase's table editor for the very first admin.

## Suggested test path

1. Sign up as a teacher → sign up as an admin (or promote an existing account) → from `/admin`, create a course and assign the teacher to it, add content, and add a practice test with questions/options.
2. Sign up as a student → browse courses and enroll (self-serve, no manual DB edits needed) → `/learning` to see lessons, `/practice` to take the test, `/results/[attemptId]` to see the graded outcome, `/rewards` to see the XP it awarded.
3. Check `/admin/logs` for the matching log entry from the same submission.

---

## Screenshots

> Screenshots of the final interface will be added here after the visual refinement phase.

---

## Academic Context

**Project:** IELTS-Beta-WebApp-Next  
**Type:** University Capstone Project 
