import { AppHeader } from "@/components/layout/app-header";
import { requireUser } from "@/lib/dal";

// Каркас рабочих страниц. Сюда попадают только вошедшие; права на конкретный
// раздел каждая страница проверяет сама (requireRole / requirePermission) —
// layout не перерисовывается при переходах и не может быть единственной защитой.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-12 pt-8 sm:px-6">{children}</main>
    </div>
  );
}
