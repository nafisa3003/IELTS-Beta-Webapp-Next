"use client";

import {
  StudentRoleIcon,
  TeacherRoleIcon,
  AdminRoleIcon,
} from "@/components/icons/stat-icons";

export type AuthRole = "student" | "teacher" | "admin";

const ROLES: {
  value: AuthRole;
  label: string;
  Icon: typeof StudentRoleIcon;
}[] = [
  { value: "student", label: "Student", Icon: StudentRoleIcon },
  { value: "teacher", label: "Teacher", Icon: TeacherRoleIcon },
  { value: "admin", label: "Admin", Icon: AdminRoleIcon },
];

export function RoleTabs({
  value,
  onChange,
}: {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Choose account role"
      className="grid grid-cols-3 gap-1 rounded-lg border border-mist bg-mist/40 p-1"
    >
      {ROLES.map(({ value: role, label, Icon }) => {
        const active = value === role;

        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(role)}
            className={[
              "flex min-h-16 flex-col items-center justify-center gap-1.5",
              "rounded-md px-2 py-2.5",
              "text-xs font-semibold",
              "transition-all duration-200",
              "focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-teal/30",
              active
                ? "bg-surface text-teal shadow-card"
                : "text-slate hover:bg-surface/70 hover:text-ink",
            ].join(" ")}
          >
            <Icon
              size={22}
              className={[
                "transition-colors duration-200",
                active ? "text-teal" : "text-slate-soft",
              ].join(" ")}
            />

            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}