export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-mist border-t-teal" />
      <p className="text-sm text-slate-soft">{label}</p>
    </div>
  );
}
