import "server-only";
import type { CurrentUser } from "@/lib/dal";

/**
 * Изоляция банков (tenant isolation).
 *
 * Правило: каждый запрос к данным банка содержит фильтр из orgScope(user).
 * Забыть один раз = утечка данных другого банка.
 *
 *   prisma.dispute.findMany({ where: { ...orgScope(user), status: "SUBMITTED" } })
 *
 * Суперадмин данных банков через orgScope не получает: его разделы (этап 8)
 * работают с организациями явно, по выбранному id.
 */

export class TenantError extends Error {
  constructor(message = "Нет доступа к данным этой организации") {
    super(message);
    this.name = "TenantError";
  }
}

/** Фильтр по банку текущего пользователя для where-условий Prisma. */
export function orgScope(user: Pick<CurrentUser, "role" | "organizationId">): { organizationId: string } {
  if (user.role === "SUPER_ADMIN" || !user.organizationId) {
    throw new TenantError("Запрос данных банка без привязки к банку");
  }
  return { organizationId: user.organizationId };
}

/** Проверка уже загруженного объекта: принадлежит ли он банку пользователя. */
export function assertSameOrg(
  user: Pick<CurrentUser, "role" | "organizationId">,
  record: { organizationId: string } | null | undefined,
): asserts record is { organizationId: string } {
  if (!record || record.organizationId !== orgScope(user).organizationId) {
    throw new TenantError();
  }
}
