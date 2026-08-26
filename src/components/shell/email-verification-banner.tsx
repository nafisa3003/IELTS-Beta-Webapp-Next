"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/toast";

export function EmailVerificationBanner() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        setShow(true);
        setEmail(user.email ?? "");
      }
    }
    check();
  }, []);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (error) {
      notify.error(error.message);
    } else {
      notify.success("Verification email resent — check your inbox.");
    }
  }

  if (!show) return null;

  return (
    <div className="bg-coral/10 border-b border-coral/20 px-6 py-3 text-sm text-coral-deep flex items-center justify-center gap-2">
      <span>Please verify your email to secure your account.</span>
      <button
        onClick={handleResend}
        disabled={resending}
        className="font-semibold underline hover:no-underline disabled:opacity-50"
      >
        {resending ? "Sending…" : "Resend email"}
      </button>
    </div>
  );
}