"use client";

import { useActionState, useEffect } from "react";
import { Field } from "@/components/ui/field";
import { updateProfileInfoAction } from "./actions";
import { notify } from "@/lib/toast";
import type { ProfileDetail } from "@/lib/repositories/profile.repository";

const BAND_SCORES = [
  "1.0", "1.5", "2.0", "2.5", "3.0", "3.5",
  "4.0", "4.5", "5.0", "5.5", "6.0", "6.5",
  "7.0", "7.5", "8.0", "8.5", "9.0",
];

type ActionResult = { error?: string; success?: boolean } | null;

async function action(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  return updateProfileInfoAction(formData);
}

export function PersonalInfoForm({
  profile,
  onboardingTargetBand,
}: {
  profile: ProfileDetail;
  onboardingTargetBand?: number | null;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    action,
    null
  );

  useEffect(() => {
    if (state?.success) notify.success("Profile updated.");
    if (state?.error) notify.error(state.error);
  }, [state]);

  const defaultTarget =
    onboardingTargetBand ?? profile.target_band ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          id="firstName"
          name="firstName"
          defaultValue={profile.first_name}
          required
        />
        <Field
          label="Last name"
          id="lastName"
          name="lastName"
          defaultValue={profile.last_name}
          required
        />
      </div>

      <Field
        label="Email"
        id="email"
        defaultValue={profile.email}
        disabled
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Phone"
          id="phone"
          name="phone"
          defaultValue={profile.phone ?? ""}
          placeholder="+880..."
        />
        <Field
          label="Date of birth"
          id="dob"
          name="dob"
          type="date"
          defaultValue={profile.dob ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Gender"
          id="gender"
          name="gender"
          defaultValue={profile.gender ?? ""}
          placeholder="Optional"
        />
        <Field
          label="Address"
          id="address"
          name="address"
          defaultValue={profile.address ?? ""}
          placeholder="Optional"
        />
      </div>

      {profile.role === "student" && (
  <div className="grid gap-4 sm:grid-cols-2">
    {/* Current band — styled dropdown */}
    <div>
      <label
        htmlFor="currentBand"
        className="block text-sm font-medium text-ink mb-1.5"
      >
        Current band score
      </label>

      <div className="relative">
        <select
          id="currentBand"
          name="currentBand"
          defaultValue={
            profile.current_band ? String(profile.current_band) : ""
          }
          className="w-full h-12 px-4 pr-10 rounded-xl border border-mist bg-white text-ink appearance-none focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all cursor-pointer"
        >
          <option value="" disabled>
            Select your current band
          </option>

          {BAND_SCORES.map((score) => (
            <option key={score} value={score}>
              Band {score}
            </option>
          ))}
        </select>

        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>

    {/* Target band — styled dropdown */}
    <div>
      <label
        htmlFor="targetBand"
        className="block text-sm font-medium text-ink mb-1.5"
      >
        Target band score
      </label>

      <div className="relative">
        <select
          id="targetBand"
          name="targetBand"
          defaultValue={defaultTarget ? String(defaultTarget) : ""}
          className="w-full h-12 px-4 pr-10 rounded-xl border border-mist bg-white text-ink appearance-none focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all cursor-pointer"
        >
          <option value="" disabled>
            Select your target band
          </option>

          {BAND_SCORES.map((score) => (
            <option key={score} value={score}>
              Band {score}
            </option>
          ))}
        </select>

        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
)}

      {state?.error && (
        <p className="text-xs text-danger">{state.error}</p>
      )}

      {state?.success && (
        <p className="text-xs text-success">Profile updated.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-pill bg-teal px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}