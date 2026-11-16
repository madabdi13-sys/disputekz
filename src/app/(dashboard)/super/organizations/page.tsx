import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Банки — DisputeKZ" };

export default async function OrganizationsPage() {
  await requireRole("SUPER_ADMIN");

  return (
    <>
      <PageHeader title="Банки" subtitle="Организации, подключённые к платформе" />
      <EmptyState
        icon={Building2}
        title="Управление банками появится на этапе 8"
        description="Подключение банка, подписка и создание администратора банка."
      />
    </>
  );
}
