import "server-only";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/tenant";
import { DomainError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/dal";
import type { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";

const BCRYPT_ROUNDS = 12;

/** Админ банка управляет менеджерами. Администраторов банка ведёт администратор платформы. */
const MANAGEABLE_ROLES: Role[] = ["BRANCH_MANAGER", "HQ_MANAGER"];

export function isManageable(actor: Pick<CurrentUser, "id">, target: { id: string; role: Role }) {
  return target.id !== actor.id && MANAGEABLE_ROLES.includes(target.role);
}

export async function listOrgUsers(user: CurrentUser, filter: { active: boolean; query?: string }) {
  const q = filter.query?.trim();
  const where: Prisma.UserWhereInput = {
    ...orgScope(user),
    isActive: filter.active,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  return prisma.user.findMany({
    where,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    take: 500,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      orderNumber: true,
      lastLoginAt: true,
      branchId: true,
      branch: { select: { name: true } },
    },
  });
}

export async function countOrgUsers(user: CurrentUser) {
  const scope = orgScope(user);
  const [active, inactive] = await Promise.all([
    prisma.user.count({ where: { ...scope, isActive: true } }),
    prisma.user.count({ where: { ...scope, isActive: false } }),
  ]);
  return { active, inactive };
}

/** Сотрудник банка, которым актор вправе управлять. */
async function getManageableUser(actor: CurrentUser, userId: string) {
  const target = await prisma.user.findFirst({
    where: { id: userId, ...orgScope(actor) },
    select: { id: true, role: true, isActive: true, name: true },
  });
  if (!target) throw new DomainError("Сотрудник не найден");
  if (target.id === actor.id) throw new DomainError("Нельзя изменить собственную учётную запись здесь");
  if (!MANAGEABLE_ROLES.includes(target.role)) {
    throw new DomainError("Администраторами банка управляет администратор платформы");
  }
  return target;
}

export async function updateOrgUser(
  actor: CurrentUser,
  data: { id: string; name: string; phone: string; role: "BRANCH_MANAGER" | "HQ_MANAGER"; branchId?: string },
) {
  await getManageableUser(actor, data.id);

  let branchId: string | null = null;
  if (data.role === "BRANCH_MANAGER") {
    const branch = await prisma.branch.findFirst({
      where: { id: data.branchId ?? "", ...orgScope(actor) },
      select: { id: true, isActive: true },
    });
    if (!branch) throw new DomainError("Отделение не найдено");
    if (!branch.isActive) throw new DomainError("Отделение закрыто");
    branchId = branch.id;
  }

  return prisma.user.update({
    where: { id: data.id },
    data: { name: data.name, phone: data.phone || null, role: data.role, branchId },
    select: { id: true, name: true },
  });
}

/** Деактивация — не удаление: диспуты, комментарии и аудит сотрудника сохраняются. */
export async function setOrgUserActive(actor: CurrentUser, userId: string, active: boolean) {
  const target = await getManageableUser(actor, userId);
  if (target.isActive === active) return target;

  await prisma.$transaction([
    prisma.user.update({ where: { id: target.id }, data: { isActive: active } }),
    // Деактивированный теряет все входы сразу.
    ...(active ? [] : [prisma.session.deleteMany({ where: { userId: target.id } })]),
  ]);
  return target;
}

// Без похожих символов (0/O, 1/l/I), чтобы пароль можно было продиктовать.
const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateTemporaryPassword(length = 10) {
  let out = "";
  for (let i = 0; i < length; i++) out += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
  // Гарантируем букву и цифру — требования PasswordSchema.
  return out.slice(0, -2) + PASSWORD_ALPHABET[randomInt(23)] + String(randomInt(2, 10));
}

/**
 * Сброс пароля: временный пароль показывается администратору один раз,
 * сотрудник обязан сменить его при первом входе. Все текущие входы закрываются.
 */
export async function resetOrgUserPassword(actor: CurrentUser, userId: string) {
  const target = await getManageableUser(actor, userId);
  if (!target.isActive) throw new DomainError("Сначала активируйте сотрудника");

  const temporaryPassword = generateTemporaryPassword();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: target.id },
      data: { password: await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS), mustChangePassword: true },
    }),
    prisma.session.deleteMany({ where: { userId: target.id } }),
  ]);
  return { target, temporaryPassword };
}
