import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({
  label,
  error,
  className,
  id,
  ...props
}: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none text-ink"
      >
        {label}
      </label>

      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          [
            "h-12 w-full rounded-lg",
            "border border-mist",
            "bg-surface",
            "px-4",
            "text-sm text-ink",
            "placeholder:text-slate-soft",
            "outline-none",
            "transition-all duration-200",
            "shadow-sm",
            "hover:border-slate-soft",
            "focus:border-teal",
            "focus:ring-4 focus:ring-teal/10",
            "disabled:cursor-not-allowed",
            "disabled:opacity-60",
          ].join(" "),
          error && [
            "border-danger",
            "bg-danger/5",
            "focus:border-danger",
            "focus:ring-danger/10",
          ],
          className
        )}
        {...props}
      />

      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium leading-5 text-danger"
        >
          {error}
        </span>
      )}
    </div>
  );
}