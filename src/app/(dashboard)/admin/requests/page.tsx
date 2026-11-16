import type { Metadata } from "next";
import { UserCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkTabs } from "@/components/ui/link-tabs";
import { CellStack, DataTable, Td, Th, Tr } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { RequestActions } from "@/components/admin/request-actions";
import { requirePermission } from "@/lib/dal";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";
import { countPendingRequests, listRegistrationRequests } from "@/services/registration.service";
import type { RegistrationStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Заявки на доступ — DisputeKZ" };

const TABS: { key: string; status: RegistrationStatus; label: string }[] = [
  { key: "pending", status: "PENDING", label: "На рассмотрении" },
  { key: "approved", status: "APPROVED", label: "Одобренные" },
  { key: "rejected", status: "REJECTED", label: "Отклонённые" },
];

export default async function RequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  const user = await requirePermission("registrations.review");
  const { status } = await searchParams;
  const tab = TABS.find((t) => t.key === status) ?? TABS[0];

  const [requests, pendingCount] = await Promise.all([
    listRegistrationRequests(user, tab.status),
    countPendingRequests(user),
  ]);
  const isPending = tab.status === "PENDING";

  return (
    <>
      <PageHeader
        title="Заявки на доступ"
        subtitle="Сотрудники банка, которые зарегистрировались и ждут проверки номера приказа"
      />

      <LinkTabs
        tabs={TABS.map((t) => ({
          href: t.key === "pending" ? "/admin/requests" : `/admin/requests?status=${t.key}`,
          label: t.label,
          count: t.status === "PENDING" ? pendingCount : undefined,
          active: t.key === tab.key,
        }))}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={isPending ? "Новых заявок нет" : "Здесь пока пусто"}
          description={
            isPending
              ? "Когда сотрудник отправит заявку на регистрацию, она появится здесь, а рядом с «Заявки» в меню загорится счётчик."
              : "Рассмотренные заявки сохраняются для истории."
          }
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Сотрудник</Th>
              <Th>Должность</Th>
              <Th>Отделение</Th>
              <Th>Приказ</Th>
              <Th>{isPending ? "Подана" : "Рассмотрена"}</Th>
              {isPending ? <Th className="text-right">Решение</Th> : <Th>Итог</Th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <CellStack primary={r.name} secondary={r.phone ? `${r.email} · ${r.phone}` : r.email} />
                </Td>
                <Td className="whitespace-nowrap">{ROLE_LABELS[r.role]}</Td>
                <Td>{r.branchName ?? (r.role === "HQ_MANAGER" ? "Головной офис" : "—")}</Td>
                <Td className="whitespace-nowrap">{r.orderNumber}</Td>
                <Td className="whitespace-nowrap text-zinc-500">{formatDateTime(isPending ? r.createdAt : r.updatedAt)}</Td>
                {isPending ? (
                  <Td>
                    <RequestActions
                      request={{
                        id: r.id,
                        name: r.name,
                        email: r.email,
                        roleLabel: ROLE_LABELS[r.role],
                        branchName: r.branchName,
                        orderNumber: r.orderNumber,
                      }}
                    />
                  </Td>
                ) : (
                  <Td>
                    <div className="space-y-1">
                      {r.status === "APPROVED" ? (
                        <StatusBadge tone="success">Одобрена</StatusBadge>
                      ) : (
                        <StatusBadge tone="danger">Отклонена</StatusBadge>
                      )}
                      <div className="text-[12px] text-zinc-500">
                        {r.reviewerName ?? "—"}
                        {r.rejectionReason && <> · {r.rejectionReason}</>}
                      </div>
                    </div>
                  </Td>
                )}
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
