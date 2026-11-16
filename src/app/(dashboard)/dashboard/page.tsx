import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Диспуты — DisputeKZ" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Активные диспуты" subtitle="Все запросы, требующие действия" />
      <EmptyState
        icon={Inbox}
        title="Список диспутов появится на этапе 6"
        description="Сначала вход и роли (этап 2): дашборд показывает каждому сотруднику только диспуты его банка и его роли."
      />
    </>
  );
}
