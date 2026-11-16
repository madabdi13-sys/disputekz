import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashToken, readSessionToken } from "@/lib/session";
import { can, homePathFor, type Permission } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/enums";

/**
 * Data Access Layer: единственное место, где определяется «кто сейчас работает».
 * Страницы, server actions и API вызывают requireUser / requireRole / requirePermission,
 * а не читают cookie сами.
 */

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string | null;
  organizationName: string | null;
  branchId: string | null;
  branchName: string | null;
};

/** Текущий пользователь или null. Кэшируется на время одного запроса. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await readSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          organizationId: true,
          organization: { select: { name: true, isActive: true } },
          branchId: true,
          branch: { select: { name: true } },
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) return null;

  const { user } = session;
  if (!user.isActive) return null;
  // Банк отключён (подписка, расторжение) — его сотрудники не входят.
  if (user.role !== "SUPER_ADMIN" && !user.organization?.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organization?.name ?? null,
    branchId: user.branchId,
    branchName: user.branch?.name ?? null,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Пускает только указанные роли; остальных отправляет на их стартовую страницу. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(homePathFor(user.role));
  return user;
}

export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) redirect(homePathFor(user.role));
  return user;
}
