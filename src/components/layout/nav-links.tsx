"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavLinkItem = { href: string; label: string; count?: number; countTitle?: string };

export function NavLinks({ items }: { items: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="relative flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const hasCount = !!item.count && item.count > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
              active ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            {item.label}
            {hasCount && (
              <span
                title={item.countTitle ? `${item.countTitle}: ${item.count}` : undefined}
                className={cn(
                  "rounded-full px-1.5 py-px text-[11px] font-medium tabular-nums",
                  active ? "border border-zinc-200 bg-white text-zinc-700" : "bg-zinc-900 text-white",
                )}
              >
                {item.count}
                {item.countTitle && <span className="sr-only">: {item.countTitle.toLowerCase()}</span>}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
