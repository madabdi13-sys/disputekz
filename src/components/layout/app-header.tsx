import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { homePathFor, navItemsFor } from "@/lib/permissions";
import { getNavCounts } from "@/services/counters.service";
import type { CurrentUser } from "@/lib/dal";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

export async function AppHeader({ user }: { user: CurrentUser }) {
  const counts = await getNavCounts(user);
  const items = navItemsFor(user.role).map(({ href, label, badge, badgeTitle }) => ({
    href,
    label,
    count: badge ? counts[badge] : undefined,
    countTitle: badgeTitle,
  }));

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:gap-8 sm:px-6">
        <Link href={homePathFor(user.role)} className="inline-flex shrink-0 items-center">
          <Logo size="md" />
        </Link>
        <NavLinks items={items} />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
