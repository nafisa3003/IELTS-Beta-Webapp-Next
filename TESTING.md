# Testing

## IELTS-Beta-WebApp-Next

This document describes the automated testing implemented in the IELTS-Beta-WebApp-Next application, covering unit isolation, mocking/stubbing of external dependencies, and backend logic coverage.

---

## Framework

**Jest**, configured via `next/jest` for TypeScript and path-alias (`@/...`) support consistent with the rest of the codebase.

Configuration lives at the project root:

```text
jest.config.js
```

Run the suite with:

```bash
npm run test:coverage
```

---

## Scope

Six files across the service, scoring, validation, and repository layers were selected for testing — the parts of the backend with real conditional logic, as opposed to thin single-query wrappers with little to test.

| File | Layer | Approach |
| --- | --- | --- |
| `src/lib/scoring/strategy.ts` | Strategy | Pure unit tests |
| `src/lib/validations/auth.ts` | Validation | Pure unit tests |
| `src/lib/validations/profile.ts` | Validation | Pure unit tests |
| `src/lib/repositories/user.repository.ts` | Repository | Isolated with a mocked Supabase client |
| `src/lib/repositories/gamification.repository.ts` | Repository | Isolated with a mocked Supabase client |
| `src/lib/repositories/course-batch.repository.ts` | Repository | Isolated with a mocked Supabase client |
| `src/lib/services/assessment-service.ts` | Facade/Service | Isolated with mocked repositories |
| `src/lib/services/course-service.ts` | Facade/Service | Isolated with mocked repositories |

Test files sit alongside the code they test, in a `__tests__` folder at each layer — e.g. `src/lib/scoring/__tests__/strategy.test.ts`.

---

## Pure Logic Tests

`strategy.ts`, `validations/auth.ts`, and `validations/profile.ts` have no external dependencies (no database, no network), so they're tested directly with in-memory fixtures — no mocking required.

Coverage includes:

- **Strategy pattern** — objective scoring (correct/wrong/unanswered answers, multi-question raw-mark summation), the raw-to-band conversion curve at its 0%/100%/rounding edges, subjective scoring's always-ungraded result, and `strategyFor(skill)` dispatch.
- **Auth validation** — the age-eligibility date math (exactly 13, one day short, one day past a birthday), future/invalid date-of-birth rejection, email/password/role validation.
- **Profile validation** — optional-field handling, and the `currentBand` (0–9) / `targetBand` (4–9) range boundaries.

---

## Isolated Unit Tests with Mocking

The requirement to isolate a unit from external dependencies is demonstrated at two levels:

### Repository level — mocking the Supabase client

`user.repository.ts`, `gamification.repository.ts`, and `course-batch.repository.ts` talk to Supabase directly, so their tests fake the Supabase query-builder chain itself (a small reusable helper, `test-utils/supabase-mock.ts`) rather than connecting to a real database. This covers the `display_id` fallback logic in `UserRepository.findAll()` (student → teacher → admin → null), role-based table branching in `updateRole()`, XP-ledger summation and null/empty-data handling in `GamificationRepository`, and the batch-numbering/seat-count logic in `CourseBatchRepository`.

### Service level — mocking repositories

`assessment-service.ts` and `course-service.ts` each coordinate several repositories (see the Facade pattern in [`DESIGN-PATTERNS.md`](./DESIGN-PATTERNS.md)). Their tests use `jest.mock()` on the repository modules, then stub return values on `Repository.prototype.method` for each scenario:

```ts
jest.mock("@/lib/repositories/question.repository");
const MockedQuestionRepo = QuestionRepository as jest.MockedClass<typeof QuestionRepository>;

MockedQuestionRepo.prototype.findByTest.mockResolvedValue([...]);
```

This tests each service's own coordination logic — grouping, filtering, aggregation — without ever touching a repository's real implementation or a live database.

Coverage includes:

- **`AssessmentService`** — `submitAttempt`'s scoring aggregation (mixed objective/subjective skills, all-subjective case), `getTestForTaking`'s per-skill question grouping, `listTestsForSkill`'s deduplication.
- **`CourseService`** — active-vs-dropped enrollment filtering in `getStudentLearningView`, the enrolled/unenrolled set difference in `browseUnenrolledCourses`, null-course filtering in `getTeacherCourses`.

---

## Coverage

```text
Test Suites: 8 passed, 8 total
Tests:       85 passed, 85 total
Snapshots:   0 total
Time:        3.473 s

-|---------|----------|---------|---------|-------------------
 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-|---------|----------|---------|---------|-------------------
 |   94.11 |    95.65 |   86.53 |   94.4  |
-|---------|----------|---------|---------|-------------------
```

Coverage is scoped (via `collectCoverageFrom` in `jest.config.js`) to the eight files above, and clears the 50% line/branch threshold required for backend logic by a wide margin — 94.4% lines, 95.65% branches across the tested files.

---

## Summary

| Requirement | How it's met |
| --- | --- |
| Test components/functions in isolation | Pure-function tests for scoring and validation; service/repository tests isolated via mocking |
| Mocking/stubbing external dependencies | Supabase client faked for repository tests; repositories mocked via `jest.mock()` for service tests |
| Testing framework | Jest (`next/jest`) |
| 50%+ line/branch coverage | Met — see Coverage above |
