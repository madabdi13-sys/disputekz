import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ROLE_LABELS } from "@/lib/permissions";
import type { CurrentUser } from "@/lib/dal";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ user }: { user: CurrentUser }) {
  const place = [user.organizationName, user.branchName].filter(Boolean).join(" · ");

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="hidden flex-col items-end leading-tight md:flex">
        <span className="text-[13px] font-medium text-zinc-900">{user.name}</span>
        <span className="text-[11px] text-zinc-500">{place ? `${ROLE_LABELS[user.role]} · ${place}` : ROLE_LABELS[user.role]}</span>
      </div>
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white"
        title={`${user.name} — ${ROLE_LABELS[user.role]}`}
        aria-hidden="true"
      >
        {initials(user.name)}
      </span>
      <form action={logout}>
        <button
          type="submit"
          aria-label="Выйти"
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <LogOut size={14} strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </form>
    </div>
  );
}
