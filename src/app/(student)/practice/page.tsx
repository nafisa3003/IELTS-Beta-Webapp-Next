const SKILLS: { name: string; slug: string; blurb: string }[] = [
  { name: "Listening", slug: "listening", blurb: "Auto-graded, instant band estimate" },
  { name: "Reading", slug: "reading", blurb: "Auto-graded, instant band estimate" },
  { name: "Writing", slug: "writing", blurb: "Graded by your teacher against the rubric" },
  { name: "Speaking", slug: "speaking", blurb: "Graded by your teacher against the rubric" },
];

export default function PracticeHubPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Practice</h1>
      <div className="grid grid-cols-2 gap-4">
        {SKILLS.map((s) => (
          <a
            key={s.slug}
            href={`/practice/${s.slug}`}
            className="rounded-lg bg-surface p-6 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <h2 className="font-display text-lg font-semibold text-ink">{s.name}</h2>
            <p className="mt-1 text-sm text-slate-soft">{s.blurb}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
