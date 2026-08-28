"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadAvatarAction } from "./actions";
import { notify } from "@/lib/toast";

export function AvatarUploader({
  currentUrl,
  initials,
}: {
  currentUrl: string | null;
  initials: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      const result = await uploadAvatarAction(formData);

      // Clean up local blob URL
      URL.revokeObjectURL(localPreview);

      if (result?.error) {
        setError(result.error);
        notify.error(result.error);
        setPreview(null);
      } else if (result?.avatarUrl) {
        // Use the server-returned URL (with cache-buster)
        setPreview(result.avatarUrl);
        notify.success("Profile picture updated!");
      } else {
        notify.success("Profile picture updated!");
      }
    });
  }

  const displayUrl = preview ?? currentUrl;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[var(--mist)] bg-[var(--mist)] dark:border-slate/20">
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Profile picture"
            fill
            className="object-cover"
            unoptimized
            onError={() => setPreview(null)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-[var(--slate)]">
            {initials}
          </span>
        )}
        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="rounded-full border-2 border-[var(--mist)] px-4 py-2 text-xs font-bold text-[var(--ink)] transition-all hover:border-[var(--teal)] hover:text-[var(--teal)] disabled:opacity-50 dark:border-slate/20 dark:text-white"
        >
          {currentUrl ? "Change photo" : "Upload photo"}
        </button>
        <p className="mt-1 text-[11px] text-[var(--slate-soft)]">
          PNG or JPG, up to 3MB
        </p>
        {error && (
          <p className="mt-1 text-[11px] text-[var(--danger)]">{error}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
