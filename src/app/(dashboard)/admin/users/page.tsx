import type { Metadata } from "next";
import { Search, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkTabs } from "@/components/ui/link-tabs";
import { CellStack, DataTable, Td, Th, Tr } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { UserActions } from "@/components/admin/user-actions";
import { requirePermission } from "@/lib/dal";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";
import { countOrgUsers, isManageable, listOrgUsers } from "@/services/user.service";
import { listActiveBranchOptions } from "@/services/branch.service";

export const metadata: Metadata = { title: "Сотрудники — DisputeKZ" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const actor = await requirePermission("users.manage");
  const params = await searchParams;
  const showInactive = params.status === "inactive";
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";

  const [users, counts, branches] = await Promise.all([
    listOrgUsers(actor, { active: !showInactive, query }),
    countOrgUsers(actor),
    listActiveBranchOptions(actor),
  ]);

  const tabHref = (status?: string) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (query) sp.set("q", query);
    const s = sp.toString();
    return s ? `/admin/users?${s}` : "/admin/users";
  };

  return (
    <>
      <PageHeader title="Сотрудники" subtitle="Сотрудники банка с доступом к платформе. Новые приходят через заявки." />

      <LinkTabs
        tabs={[
          { href: tabHref(), label: "Активные", count: counts.active, active: !showInactive },
          { href: tabHref("inactive"), label: "Деактивированные", count: counts.inactive, active: showInactive },
        ]}
      />

      <form className="mb-4 flex max-w-sm items-center gap-2" role="search">
        {showInactive && <input type="hidden" name="status" value="inactive" />}
        <div className="relative flex-1">
          <Search
            size={14}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <Input name="q" defaultValue={query} placeholder="Поиск по ФИО, email, телефону" className="pl-8" aria-label="Поиск сотрудников" />
        </div>
      </form>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "Никого не нашли" : showInactive ? "Деактивированных сотрудников нет" : "Сотрудников пока нет"}
          description={
            query
              ? "Измените запрос или очистите поиск."
              : showInactive
                ? "Здесь окажутся уволенные сотрудники: доступа у них нет, история сохраняется."
                : "Сотрудники появляются после одобрения заявки на доступ."
          }
        />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <Th>Сотрудник</Th>
              <Th>Должность</Th>
              <Th>Отделение</Th>
              <Th>Последний вход</Th>
              <Th>Статус</Th>
              <Th className="text-right">
                <span className="sr-only">Действия</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const manageable = isManageable(actor, u);
              return (
                <Tr key={u.id}>
                  <Td>
                    <CellStack
                      primary={u.id === actor.id ? `${u.name} (вы)` : u.name}
                      secondary={u.phone ? `${u.email} · ${u.phone}` : u.email}
                    />
                  </Td>
                  <Td className="whitespace-nowrap">{ROLE_LABELS[u.role]}</Td>
                  <Td>{u.branch?.name ?? (u.role === "BRANCH_MANAGER" ? "—" : "Головной офис")}</Td>
                  <Td className="whitespace-nowrap text-zinc-500">{formatDateTime(u.lastLoginAt)}</Td>
                  <Td>
                    {u.isActive ? (
                      <StatusBadge tone="success">Активен</StatusBadge>
                    ) : (
                      <StatusBadge>Деактивирован</StatusBadge>
                    )}
                  </Td>
                  <Td className="text-right">
                    {manageable && (u.role === "BRANCH_MANAGER" || u.role === "HQ_MANAGER") ? (
                      <UserActions
                        user={{
                          id: u.id,
                          name: u.name,
                          email: u.email,
                          phone: u.phone,
                          role: u.role,
                          branchId: u.branchId,
                          isActive: u.isActive,
                        }}
                        branches={branches}
                      />
                    ) : (
                      <span className="text-[12px] text-zinc-400">
                        {u.id === actor.id ? "—" : "Через администратора платформы"}
                      </span>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </DataTable>
      )}
    </>
  );
}
