"use client";

import { useRouter } from "next/navigation";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useClientProfile } from "@/hooks/account/useClientProfile";
import ProfileForm from "@/components/account/ProfileForm";
import { isProfileIncomplete } from "@/utils/account/profileHelpers";
import ProfileIncompleteBanner from "@/components/account/ProfileIncompleteBanner";
import AccountShell from "@/components/account/AccountShell";
import AccountUserSummaryCard from "@/components/account/AccountUserSummaryCard";
import PublicPageHeader from "@/components/public/PublicPageHeader";

export default function MiCuentaDatosPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useClientAuth({
    redirectTo: "/login?next=%2Fmi-cuenta%2Fdatos",
    requireCliente: true,
  });
  const profile = useClientProfile();

  if (loading || !isAuthenticated) return null;

  return (
    <AccountShell ariaLabel="Mis datos">
      <PublicPageHeader
        title="Mis datos"
        subtitle="Actualizá tu información personal"
        className="mb-4 md:mb-5"
        onBack={() => router.push("/mi-cuenta")}
      />

      <div className="space-y-4">
        <AccountUserSummaryCard user={user} />

        {isProfileIncomplete(user) && <ProfileIncompleteBanner />}

        <ProfileForm
          form={profile.form}
          fieldErrors={profile.fieldErrors}
          saving={profile.saving}
          isDirty={profile.isDirty}
          onUpdateField={profile.updateField}
          onSubmit={profile.submit}
        />
      </div>
    </AccountShell>
  );
}
