import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Отчёты — DisputeKZ" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Отчёты" subtitle="Сводная аналитика по диспутам за выбранный период" />
      <EmptyState
        icon={BarChart3}
        title="Отчёты появятся на этапе 7"
        description="KPI за период и готовые выгрузки: SLA, каналы, отделения, chargeback, аудит, финансовая сводка."
      />
    </>
  );
}
