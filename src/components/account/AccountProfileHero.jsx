"use client";

import { useEffect, useState } from "react";
import UserInitialsAvatar from "@/components/account/UserInitialsAvatar";
import { getTimeGreeting, getUserFirstName } from "@/utils/account/userDisplay";

export default function AccountProfileHero({ user, displayName, email }) {
  const [greeting, setGreeting] = useState("Hola");
  const firstName = getUserFirstName(user);

  useEffect(() => {
    setGreeting(getTimeGreeting());
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-primary-dark/55 p-5 text-white shadow-xl">
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/[0.04] blur-2xl" />

      <div className="relative flex items-start gap-4">
        <UserInitialsAvatar user={user} size="lg" variant="surface" showSessionDot />
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight">
            {displayName}
          </h1>
          {email ? (
            <p className="mt-1.5 truncate text-sm text-zinc-300/95">{email}</p>
          ) : null}
        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-white/12 bg-white/[0.06] px-3.5 py-3 backdrop-blur-sm">
        <p className="text-sm leading-snug text-zinc-100">
          Tu espacio en OA! — Pedidos, combos y más.
        </p>
      </div>
    </div>
  );
}
