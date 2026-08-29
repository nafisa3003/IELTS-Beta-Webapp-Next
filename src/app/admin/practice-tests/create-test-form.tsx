"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTestAction } from "./actions";
import { notify } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types/courses";

type ActionResult = { error?: string; success?: boolean } | null;

export function CreateTestForm({ courses }: { courses: Course[] }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createTestAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state?.success) {
      notify.success("Practice test created.");
      formRef.current?.reset();
      setAudioUrl("");
    }
    if (state?.error) notify.error(state.error);
  }, [state]);

  async function handleAudioSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("listening-audio").upload(path, file);
    setUploading(false);
    if (error) {
      notify.error("Audio upload failed: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("listening-audio").getPublicUrl(path);
    setAudioUrl(data.publicUrl);
    notify.success("Audio uploaded.");
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg bg-surface p-6 shadow-card">
      <input type="hidden" name="audio_url" value={audioUrl} />
      {/* ...existing Course/Title/Category/Duration/Total marks fields unchanged... */}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Listening audio (optional)</label>
        <input type="file" accept="audio/*" onChange={handleAudioSelect} disabled={uploading} className="text-sm" />
        {audioUrl && <span className="text-xs text-teal">✓ Uploaded</span>}
      </div>

      <button type="submit" disabled={pending} className="rounded-pill bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "Creating..." : "Create test"}
      </button>
    </form>
  );
}
