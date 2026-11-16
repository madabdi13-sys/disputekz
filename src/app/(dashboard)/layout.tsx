import { AppHeader } from "@/components/layout/app-header";

// Каркас рабочих страниц: верхняя панель + контент.
// Защита страниц (только для вошедших) добавляется на этапе 2.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-12 pt-8 sm:px-6">{children}</main>
    </div>
  );
}
