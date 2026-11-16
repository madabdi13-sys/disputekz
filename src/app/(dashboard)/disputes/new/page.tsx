import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Новый диспут — DisputeKZ" };

export default function NewDisputePage() {
  return (
    <>
      <PageHeader title="Новый диспут" subtitle="Выберите шаблон и заполните форму" />
      <EmptyState
        icon={FileText}
        title="Создание диспута появится на этапах 4–5"
        description="Шаблоны банка, пошаговая форма, предпросмотр PDF и отправка в головной офис."
      />
    </>
  );
}
