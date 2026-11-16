import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { NavLinks, type NavItem } from "./nav-links";

// Пункты меню пока общие. На этапе 2 (авторизация) набор будет зависеть от роли,
// а справа появится блок пользователя с выходом.
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Диспуты" },
  { href: "/disputes/new", label: "Шаблоны" },
  { href: "/reports", label: "Отчёты" },
  { href: "/disputes/archive", label: "Архив" },
];

export function AppHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:gap-8 sm:px-6">
        <Link href="/dashboard" className="inline-flex shrink-0 items-center">
          <Logo size="md" />
        </Link>
        <NavLinks items={NAV_ITEMS} />
      </div>
    </header>
  );
}
