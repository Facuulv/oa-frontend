"use client";

import UserInitialsAvatar from "@/components/account/UserInitialsAvatar";
import { ACCOUNT_CARD_CLASS } from "@/constants/homeTheme";
import { getUserDisplayName } from "@/utils/account/userDisplay";
import { cn } from "@/lib/cn";

/**
 * Resumen compacto del usuario (avatar + nombre + email).
 * @param {object} props
 * @param {object} props.user
 * @param {string} [props.className]
 */
export default function AccountUserSummaryCard({ user, className }) {
  const displayName = getUserDisplayName(user);
  const email = user?.email ?? "";

  return (
    <div className={cn(ACCOUNT_CARD_CLASS, "p-4", className)}>
      <div className="flex items-center gap-3">
        <UserInitialsAvatar user={user} size="md" variant="surface" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>
          {email ? (
            <p className="truncate text-xs text-zinc-500">{email}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
