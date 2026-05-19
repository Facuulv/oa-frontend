"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useClientProfile } from "@/hooks/account/useClientProfile";
import ProfileForm from "@/components/account/ProfileForm";
import { isProfileIncomplete } from "@/utils/account/profileHelpers";
import ProfileIncompleteBanner from "@/components/account/ProfileIncompleteBanner";

export default function MiCuentaDatosPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useClientAuth({
    redirectTo: "/login?next=%2Fmi-cuenta%2Fdatos",
    requireCliente: true,
  });
  const profile = useClientProfile();

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/mi-cuenta")}
          aria-label="Volver a mi cuenta"
          className="rounded-xl p-1.5 text-zinc-700 transition hover:bg-zinc-200/70"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-zinc-900">Mis datos</h1>
      </div>

      <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {[user?.nombre, user?.apellido].filter(Boolean).join(" ").trim() || "Usuario"}
            </p>
            <p className="truncate text-xs text-zinc-500">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>

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
  );
}
