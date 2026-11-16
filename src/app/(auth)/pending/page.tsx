import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";

export const metadata: Metadata = { title: "Заявка на рассмотрении — DisputeKZ" };

export default function PendingPage() {
  return (
    <div className="w-full text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <Clock size={22} strokeWidth={1.5} className="text-zinc-600" />
      </div>
      <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-zinc-900">Заявка на рассмотрении</h1>
      <p className="mt-3 text-[14px] leading-5 text-zinc-500">
        Администратор вашего банка проверит номер приказа о приёме и откроет доступ. Обычно это занимает до 1
        рабочего дня.
      </p>
      <p className="mt-3 text-[14px] leading-5 text-zinc-500">
        После одобрения войдите с email и паролем, указанными в заявке.
      </p>
      <div className="mt-8 border-t border-zinc-200 pt-6">
        <Link href="/login" className="text-[13px] font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
          Перейти ко входу
        </Link>
      </div>
    </div>
  );
}
