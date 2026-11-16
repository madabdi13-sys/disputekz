import type { Metadata } from "next";
import { Building } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, Td, Th, Tr } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddBranchButton, BranchActions } from "@/components/admin/branch-actions";
import { requirePermission } from "@/lib/dal";
import { listBranches } from "@/services/branch.service";

export const metadata: Metadata = { title: "Отделения — DisputeKZ" };

export default async function BranchesPage() {
  const user = await requirePermission("branches.manage");
  const branches = await listBranches(user);

  return (
    <>
      <PageHeader
        title="Отделения"
        subtitle="Филиалы банка: из этого списка сотрудники выбирают отделение при регистрации"
        actions={<AddBranchButton />}
      />

      {branches.length === 0 ? (
        <EmptyState
          icon={Building}
          title="Отделений пока нет"
          description="Добавьте отделения банка — без них менеджеры отделений не смогут подать заявку на доступ."
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Название</Th>
              <Th>Код</Th>
              <Th className="text-right">Сотрудников</Th>
              <Th className="text-right">Диспутов</Th>
              <Th>Статус</Th>
              <Th className="text-right">
                <span className="sr-only">Действия</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <Tr key={b.id} className={b.isActive ? undefined : "text-zinc-500"}>
                <Td className="font-medium text-zinc-900">{b.name}</Td>
                <Td className="whitespace-nowrap font-mono text-[12px]">{b.code ?? "—"}</Td>
                <Td className="text-right tabular-nums">{b.activeUsers}</Td>
                <Td className="text-right tabular-nums">{b.disputes}</Td>
                <Td>
                  {b.isActive ? <StatusBadge tone="success">Работает</StatusBadge> : <StatusBadge>Закрыто</StatusBadge>}
                </Td>
                <Td>
                  <BranchActions
                    branch={{ id: b.id, name: b.name, code: b.code, isActive: b.isActive, activeUsers: b.activeUsers }}
                  />
                </Td>
              </Tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
