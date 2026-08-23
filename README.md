# IELTS Beta 3.0

IELTS Beta 3.0 is a full-stack IELTS learning platform built with Next.js (App Router) and Supabase. Designed as a university capstone project, delivering a modern, user-focused UI, structured learning modules, and role-based access.

---

## Project Overview

The platform provides an interactive environment for students to practice IELTS skills (Listening, Reading, Writing, Speaking), track target band scores, and access live classes. It includes dedicated portals for Students, Teachers, and Administrators.

---

## Core Features (Scope & Progress)

- **Student Dashboard:** Band score progress tracking via interactive charts (donut chart for target band, per-skill visual analytics), course navigation, and support ticket creation.
- **Landing Page & Conversion:** Navigation header, live countdown CTA banner for premium sales, and a 3-tier pricing structure.
- **Role-Based Portals:**
  - **Student:** Course enrollment, announcements, practice tests, and user profile management.
  - **Teacher:** Class management, student rosters, live class banners, and test activity logs.
  - **Admin Panel:** Platform overview metrics, user sign-up analytics, course-teacher assignments, and administrative logs.
- **User Profile & Settings:** Editable personal information, avatar uploads to Supabase Storage, password updates, and notification settings.

---

## Technology Stack

- **Framework:** Next.js 15 (App Router), React 19
- **Language:** TypeScript
- **Styling & UI:** Tailwind CSS, shadcn/ui, Framer Motion
- **Typography:** Plus Jakarta Sans (Headings), Inter (Body)
- **State & Forms:** Zustand, TanStack Query, React Hook Form, Zod
- **Data Visualization:** Recharts
- **Notifications:** Sonner
- **Backend & Auth:** Supabase Auth, PostgreSQL, Supabase Storage

---

## Architecture & Design Patterns

The application architecture incorporates five core software design patterns:

1. **Repository Pattern**
2. **Factory Method Pattern**
3. **Strategy Pattern**
4. **Facade Pattern**
5. **Observer Pattern**

Detailed specifications, implementation locations, problem statements, and UML diagrams are documented separately in [`DESIGN-PATTERNS-HANDOVER.md`](./DESIGN-PATTERNS-HANDOVER.md).

---

## Project Documentation

- **Design Patterns & Architecture:** [`DESIGN-PATTERNS-HANDOVER.md`](./DESIGN-PATTERNS-HANDOVER.md)
- **Visual Assets & Diagrams:** [`docs/assets/`](./docs/assets/)

### Testing

Testing strategy, verification procedures, and formal test implementation will be documented during the final testing phase.

---

## Development Status

- **Phase:** Mid-build — core functionality and premium visual refinement are in progress.
- **Database & Auth:** 17-entity PostgreSQL schema with RLS policies, metadata triggers, and storage buckets.
- **Status:** Active Development.

---

## Author & Academic Context

- **Project:** IELTS Beta 3.0 Rebuild
- **Context:** University Capstone Project & Software Design Patterns Assignment