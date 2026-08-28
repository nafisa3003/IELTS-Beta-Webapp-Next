"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import {
  profileInfoSchema,
  settingsSchema,
  changePasswordSchema,
} from "@/lib/validations/profile";

async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  return { supabase, user };
}

export async function updateProfileInfoAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const parsed = profileInfoSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    gender: formData.get("gender"),
    dob: formData.get("dob"),
    currentBand: formData.get("currentBand"),
    targetBand: formData.get("targetBand"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const values = parsed.data;

  const repo = new ProfileRepository(supabase);
  const profile = await repo.findByUserId(user.id);

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Update persons table
  await repo.updatePerson(profile.personid, {
    first_name: values.firstName,
    last_name: values.lastName,
    phone: values.phone || null,
    address: values.address || null,
    gender: values.gender || null,
    dob: values.dob || null,
  });

  // Update band scores in students table
  if (profile.role === "student") {
    const { data: student } = await supabase
      .from("students")
      .select("studentid")
      .eq("userid", user.id)
      .maybeSingle();

    if (student) {
      // Use nullish coalescing to allow "0" and "0.0" as valid values
      const targetVal = values.targetBand?.trim();
      const currentVal = values.currentBand?.trim();

      if (targetVal !== undefined && targetVal !== "") {
        await repo.updateTargetBand(
          student.studentid as string,
          Number(targetVal)
        );
      }

      if (currentVal !== undefined && currentVal !== "") {
        await repo.updateCurrentBand(
          student.studentid as string,
          Number(currentVal)
        );
      }
    }
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function uploadAvatarAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const file = formData.get("avatar") as File | null;

  if (!file || file.size === 0) {
    return { error: "No file provided" };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  if (file.size > 3 * 1024 * 1024) {
    return { error: "Image must be under 3MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("[Avatar] Storage upload failed:", uploadError);
    return { error: `Storage upload failed: ${uploadError.message}` };
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const publicUrl = urlData?.publicUrl;

  if (!publicUrl) {
    return { error: "Could not generate public URL for avatar" };
  }

  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  // Save to persons table
  const repo = new ProfileRepository(supabase);
  const profile = await repo.findByUserId(user.id);

  if (!profile) {
    return { error: "Profile not found" };
  }

  try {
    await repo.updatePerson(profile.personid, { avatar_url: avatarUrl });
  } catch (err: any) {
    console.error("[Avatar] DB update failed:", err);
    // Fallback: try raw Supabase update
    const { error: rawError } = await supabase
      .from("persons")
      .update({ avatar_url: avatarUrl })
      .eq("personid", profile.personid);

    if (rawError) {
      return { error: `Database save failed: ${rawError.message}` };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/");

  return { success: true, avatarUrl };
}

export async function updateSettingsAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const parsed = settingsSchema.safeParse({
    emailNotifications:
      formData.get("emailNotifications") === "on",
    streakReminders:
      formData.get("streakReminders") === "on",
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const repo = new ProfileRepository(supabase);

  await repo.updateSettings(user.id, {
    email_notifications: parsed.data.emailNotifications,
    streak_reminders: parsed.data.streakReminders,
  });

  revalidatePath("/profile");

  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const { supabase } = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteAccountAction() {
  const { user } = await requireUser();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
