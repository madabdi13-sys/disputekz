import Link from "next/link";
import { cn } from "@/lib/utils";

export type LinkTab = { href: string; label: string; count?: number; active: boolean };

/** Вкладки-ссылки (состояние в URL): как в прототипе дашборда. */
export function LinkTabs({ tabs }: { tabs: LinkTab[] }) {
  return (
    <div className="mb-4 flex gap-0.5 overflow-x-auto border-b border-zinc-200">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn(
            "relative inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 pb-3 pt-2.5 text-[13px] font-medium transition-colors",
            tab.active
              ? "text-zinc-900 after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5 after:rounded after:bg-zinc-900"
              : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[11px] tabular-nums",
                tab.active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500",
              )}
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
