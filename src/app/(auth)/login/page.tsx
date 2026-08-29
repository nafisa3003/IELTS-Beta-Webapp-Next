"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";
import { Field } from "@/components/ui/field";
import { RoleTabs, type AuthRole } from "@/components/shell/role-tabs";
import { notify } from "@/lib/toast";

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<AuthRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("We couldn't verify your account. Please try again.");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("userid", user.id)
        .single();

      const actualRole = profile?.role;

      if (actualRole === "admin") {
        router.push("/admin");
      } else if (actualRole === "teacher") {
        router.push("/teacher");
      } else {
        router.push(searchParams.get("redirectTo") || "/dashboard");
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleClick() {
    notify.info("Google sign-in will be connected next.");
  }

  return (
    <div className="w-full">
      {/* CHANGED: centered header */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-semibold text-teal">
          Welcome back
        </p>

        <h1 className="text-[28px] font-black tracking-tight text-ink sm:text-[32px]">
          Continue your IELTS journey
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate">
          Sign in to pick up where you left off and keep making progress.
        </p>
      </div>

      {/* ROLE TABS: kept exactly as you had them */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-ink text-center">
          I’m signing in as
        </p>

        <RoleTabs value={role} onChange={setRole} />
      </div>

      <button
        type="button"
        onClick={handleGoogleClick}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border-3 border-ink bg-surface text-sm font-black text-ink shadow-hard transition-all duration-200 hover:shadow-brutalist focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/10"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-mist" />
        <span className="text-xs font-medium text-slate-soft">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-mist" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error && !email ? "Email is required" : undefined}
        />

        <div className="relative">
          <Field
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-mist accent-teal focus:ring-teal"
            />
            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-teal transition-colors hover:text-teal-deep"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm leading-5 text-danger"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-xl border-3 border-ink bg-teal px-5 text-sm font-black text-white shadow-hard transition-all duration-200 hover:shadow-brutalist focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing you in…" : "Log in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate">
        New to IELTS Beta?{" "}
        <Link
          href="/signup"
          className="font-semibold text-teal transition-colors hover:text-teal-deep"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
