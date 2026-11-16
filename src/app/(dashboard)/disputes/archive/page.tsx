import type { Metadata } from "next";
import { Archive } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Архив — DisputeKZ" };

export default function ArchivePage() {
  return (
    <>
      <PageHeader title="Архив" subtitle="Завершённые и отменённые диспуты" />
      <EmptyState
        icon={Archive}
        title="Архив появится на этапе 6"
        description="Сюда уходят диспуты в статусах «Завершён» и «Отменён», с итогом и историей."
      />
    </>
  );
}
