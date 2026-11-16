import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Диспуты — DisputeKZ" };

export default async function DashboardPage() {
  await requireRole("ORG_ADMIN", "HQ_MANAGER", "BRANCH_MANAGER");

  return (
    <>
      <PageHeader title="Активные диспуты" subtitle="Все запросы, требующие действия" />
      <EmptyState
        icon={Inbox}
        title="Список диспутов появится на этапе 6"
        description="Каждый сотрудник увидит только диспуты своего банка: менеджер отделения — свои, менеджер ГО — входящие, администратор — все."
      />
    </>
  );
}
