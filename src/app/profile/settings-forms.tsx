"use client";

import { useActionState, useEffect, useState } from "react";
import { Field } from "@/components/ui/field";
import { updateSettingsAction, changePasswordAction, deleteAccountAction } from "./actions";
import { notify } from "@/lib/toast";
import type { UserSettings } from "@/lib/repositories/profile.repository";

type ActionResult = { error?: string; success?: boolean } | null;

async function settingsSubmit(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return updateSettingsAction(formData);
}
async function passwordSubmit(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return changePasswordAction(formData);
}

export function SettingsForm({ settings }: { settings: UserSettings | null }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(settingsSubmit, null);

  useEffect(() => {
    if (state?.success) notify.success("Preferences saved.");
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Toggle
        name="emailNotifications"
        label="Email notifications"
        description="Course updates, results, and announcements"
        defaultChecked={settings?.email_notifications ?? true}
      />
      <Toggle
        name="streakReminders"
        label="Streak reminders"
        description="A nudge if you're about to lose your streak"
        defaultChecked={settings?.streak_reminders ?? true}
      />
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      {state?.success && <p className="text-xs text-success">Preferences saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-pill bg-teal px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save preferences"}
      </button>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-mist px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-slate-soft">{description}</p>
      </div>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded accent-teal"
      />
    </label>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(passwordSubmit, null);

  useEffect(() => {
    if (state?.success) notify.success("Password updated.");
    if (state?.error) notify.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="New password" id="password" name="password" type="password" required minLength={8} />
      <Field label="Confirm new password" id="confirmPassword" name="confirmPassword" type="password" required />
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      {state?.success && <p className="text-xs text-success">Password updated.</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-pill border border-mist px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-teal hover:text-teal disabled:opacity-50"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export function DeleteAccountSection() {
  const [pending, setPending] = useState(false);

  function handleDeleteClick() {
    notify.confirm(
      "Permanently delete your account? This can't be undone.",
      async () => {
        setPending(true);
        const result = await deleteAccountAction();
        if (result?.error) {
          notify.error(result.error);
          setPending(false);
          return;
        }
        notify.goodbye("Account deleted. Take care!");
        window.location.href = "/login";
      },
      "Delete forever"
    );
  }

  return (
    <div className="rounded-md border border-danger/30 bg-danger-soft p-4">
      <p className="text-sm font-semibold text-danger">Delete account</p>
      <p className="mt-1 text-xs text-slate">
        This permanently removes your account and everything linked to it — courses, results, XP, everything.
        This can't be undone.
      </p>
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={pending}
        className="mt-3 rounded-pill border border-danger px-4 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger hover:text-white disabled:opacity-50"
      >
        {pending ? "Deleting..." : "Delete my account"}
      </button>
    </div>
  );
}
