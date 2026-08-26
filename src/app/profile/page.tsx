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
    getOnboardingForProfile(), // ← fetch onboarding data
  ]);

  if (!profile) return <p className="text-sm text-slate">Profile not found.</p>;

  const initials = `${profile.first_name[0] ?? ""}${profile.last_name[0] ?? ""}`.toUpperCase();

  // If profile doesn't have target_band yet, fall back to onboarding target_band
  const effectiveTargetBand = profile.target_band ?? onboarding?.target_band ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg bg-surface p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AvatarUploader currentUrl={profile.avatar_url} initials={initials} />
          <div className="text-left sm:text-right">
            <p className="font-display text-lg font-semibold text-ink">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-xs uppercase tracking-wide text-slate-soft">{profile.role}</p>
            {profile.display_id && (
              <p className="mt-0.5 font-mono text-xs font-semibold text-teal">{profile.display_id}</p>
            )}
          </div>
        </div>

        <ProfileTabs
          personalInfo={
            <PersonalInfoForm
              profile={profile}
              onboardingTargetBand={effectiveTargetBand}
            />
          }
          settings={
            <div className="flex flex-col gap-6">
              <SettingsForm settings={settings} />
              <div className="border-t border-mist pt-6">
                <h3 className="mb-3 text-sm font-semibold text-ink">Change password</h3>
                <ChangePasswordForm />
              </div>
              <div className="border-t border-mist pt-6">
                <DeleteAccountSection />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}