export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-mist p-6">
      {icon}
      <h3 className="font-display text-base font-semibold text-navy dark:text-white">{title}</h3>
      {body && <p className="text-sm text-slate">{body}</p>}
    </div>
  );
}
