import { createClient } from "@/lib/supabase/server";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import { AvatarUploader } from "./avatar-uploader";
import { PersonalInfoForm } from "./personal-info-form";
import { SettingsForm, ChangePasswordForm, DeleteAccountSection } from "./settings-forms";
import { ProfileTabs } from "./profile-tabs";
import { getOnboardingForProfile } from "@/lib/onboarding/get-for-profile";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const repo = new ProfileRepository(supabase);

  const [profile, settings, onboarding] = await Promise.all([
    repo.findByUserId(user.id),
    repo.findSettings(user.id),
    getOnboardingForProfile(),
  ]);

  if (!profile) return <p className="text-sm text-slate">Profile not found.</p>;

  const initials = `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase();

  // Merge onboarding data as fallback
  const effectiveTargetBand = profile.target_band ?? onboarding?.target_band ?? null;
  const effectiveCurrentBand = profile.current_band ?? onboarding?.current_band ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border-2 border-[var(--mist)] bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate/20 dark:bg-navy-deep">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AvatarUploader currentUrl={profile.avatar_url} initials={initials} />
          <div className="text-left sm:text-right">
            <p className="font-display text-lg font-bold text-[var(--ink)] dark:text-white">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-xs uppercase tracking-wide text-[var(--slate-soft)]">{profile.role}</p>
            {profile.display_id && (
              <p className="mt-0.5 font-mono text-xs font-bold text-[var(--teal)]">{profile.display_id}</p>
            )}
          </div>
        </div>

        <ProfileTabs
          personalInfo={
            <PersonalInfoForm
              profile={profile}
              onboardingTargetBand={effectiveTargetBand}
              onboardingCurrentBand={effectiveCurrentBand}
            />
          }
          settings={
            <div className="flex flex-col gap-6">
              <SettingsForm settings={settings} />
              <div className="border-t border-[var(--mist)] pt-6">
                <h3 className="mb-3 text-sm font-bold text-[var(--ink)] dark:text-white">Change password</h3>
                <ChangePasswordForm />
              </div>
              <div className="border-t border-[var(--mist)] pt-6">
                <DeleteAccountSection />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
