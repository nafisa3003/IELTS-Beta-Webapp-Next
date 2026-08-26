"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { notify } from "@/lib/toast";
import { RoleTabs, type AuthRole } from "@/components/shell/role-tabs";
import { useRouter } from "next/navigation";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M21.8 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.49a4.69 4.69 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.51Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.07-.91 6.76-2.46l-3.3-2.56c-.91.61-2.07.98-3.46.98-2.66 0-4.92-1.8-5.73-4.22H2.86v2.64A10.2 10.2 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.27 13.74A6.13 6.13 0 0 1 5.95 12c0-.61.11-1.2.32-1.74V7.62H2.86A10.02 10.02 0 0 0 1.8 12c0 1.61.39 3.13 1.06 4.38l3.41-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.04c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.06 2.99 14.76 2 12 2a10.2 10.2 0 0 0-9.14 5.62l3.41 2.64C7.08 7.84 9.34 6.04 12 6.04Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
      <path d="M9.88 4.24A10.5 10.5 0 0 1 12 4c5 0 8.5 4 9.5 6a11.8 11.8 0 0 1-3.17 3.78"/>
      <path d="M6.61 6.61C4.6 7.72 3.21 9.36 2.5 10c1 2 4.5 6 9.5 6 1.07 0 2.06-.2 2.96-.53" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student",
    },
  });

  async function onSubmit(values: SignupInput) {
    setServerError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: values.role,
          first_name: values.firstName,
          last_name: values.lastName,
          dob: values.dob,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      notify.error(error.message);
      return;
    }

    notify.success(
      "Account created — check your inbox to verify your email."
    );
    notify.success("Account created! Let's set up your profile.");
    router.push("/onboarding/current-band");

  }

  return (
    <div className="w-full">
      {/* CHANGED: centered header, softer feel */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-semibold text-teal">
          Start your journey
        </p>

        <h1 className="text-[28px] font-bold tracking-tight text-ink sm:text-[32px]">
          Create your IELTS Beta account
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate">
          Set up your account and start building the English skills you need
          for your next opportunity.
        </p>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-ink text-center">
          I’m joining as
        </p>

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RoleTabs
              value={field.value as AuthRole}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <button
        type="button"
        onClick={() =>
          notify.info("Google sign-up will be connected next.")
        }
        /* FIXED TYPO: was `duration-200hover:border` and `focus-visible:ring-4focus-visible:ring-teal/10` */
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-mist bg-surface text-sm font-semibold text-ink shadow-sm transition-all duration-200 hover:border-slate-soft hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/10"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-mist" />
        <span className="text-xs font-medium text-slate-soft">
          or use your email
        </span>
        <div className="h-px flex-1 bg-mist" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="First name"
            id="firstName"
            placeholder="Your first name"
            autoComplete="given-name"
            {...register("firstName")}
            error={errors.firstName?.message}
          />

          <Field
            label="Last name"
            id="lastName"
            placeholder="Your last name"
            autoComplete="family-name"
            {...register("lastName")}
            error={errors.lastName?.message}
          />
        </div>

        <Field
          label="Email address"
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Field
          label="Date of birth"
          id="dob"
          type="date"
          autoComplete="bday"
          {...register("dob")}
          error={errors.dob?.message}
        />

        <div className="relative">
          <Field
            label="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            autoComplete="new-password"
            {...register("password")}
            error={errors.password?.message}
            className="pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-[30px] flex h-9 w-9 items-center justify-center rounded-md text-slate-soft transition-colors hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
          >
            <EyeIcon hidden={!showPassword} />
          </button>

          {!errors.password && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-soft">
              <CheckIcon />
              Use at least 8 characters
            </div>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm leading-5 text-danger"
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          /* FIXED TYPO: was `bg-tealpx-5` */
          className="mt-1 flex h-12 w-full items-center justify-center rounded-lg bg-teal px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-teal-deep hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-teal transition-colors hover:text-teal-deep"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}