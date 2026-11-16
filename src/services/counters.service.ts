import "server-only";
import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/tenant";
import type { CurrentUser } from "@/lib/dal";
import type { NavBadge } from "@/lib/permissions";

/**
 * Счётчики в меню: сколько ждёт пользователя, не заходя в раздел.
 *   ORG_ADMIN      — заявки на доступ
 *   HQ_MANAGER     — входящие (отправлены в ГО, ещё не взяты)
 *   BRANCH_MANAGER — свои диспуты, возвращённые на доработку
 */
export async function getNavCounts(user: CurrentUser): Promise<Partial<Record<NavBadge, number>>> {
  switch (user.role) {
    case "ORG_ADMIN":
      return {
        requests: await prisma.registrationRequest.count({ where: { ...orgScope(user), status: "PENDING" } }),
      };
    case "HQ_MANAGER":
      return { incoming: await prisma.dispute.count({ where: { ...orgScope(user), status: "SUBMITTED" } }) };
    case "BRANCH_MANAGER":
      return {
        returned: await prisma.dispute.count({
          where: { ...orgScope(user), creatorId: user.id, status: "RETURNED" },
        }),
      };
    default:
      return {};
  }
}
