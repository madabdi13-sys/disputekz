import "server-only";
import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/tenant";
import { DomainError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/dal";
import { Prisma } from "@/generated/prisma/client";

export async function listBranches(user: CurrentUser) {
  const branches = await prisma.branch.findMany({
    where: orgScope(user),
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
      _count: { select: { users: { where: { isActive: true } }, disputes: true } },
    },
  });
  return branches.map(({ _count, ...b }) => ({ ...b, activeUsers: _count.users, disputes: _count.disputes }));
}

/** Активные отделения банка — для выпадающих списков. */
export async function listActiveBranchOptions(user: CurrentUser) {
  return prisma.branch.findMany({
    where: { ...orgScope(user), isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

function isUniqueViolation(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function createBranch(user: CurrentUser, data: { name: string; code: string }) {
  try {
    return await prisma.branch.create({
      data: { ...orgScope(user), name: data.name, code: data.code || null },
      select: { id: true, name: true },
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new DomainError("Отделение с таким кодом уже есть");
    throw err;
  }
}

async function getOwnBranch(user: CurrentUser, branchId: string) {
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, ...orgScope(user) },
    select: { id: true, name: true, isActive: true },
  });
  if (!branch) throw new DomainError("Отделение не найдено");
  return branch;
}

export async function updateBranch(user: CurrentUser, data: { id: string; name: string; code: string }) {
  await getOwnBranch(user, data.id);
  try {
    return await prisma.branch.update({
      where: { id: data.id },
      data: { name: data.name, code: data.code || null },
      select: { id: true, name: true },
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new DomainError("Отделение с таким кодом уже есть");
    throw err;
  }
}

/** Закрытие вместо удаления: к отделению привязаны диспуты и история. */
export async function setBranchActive(user: CurrentUser, branchId: string, active: boolean) {
  const branch = await getOwnBranch(user, branchId);
  if (!active) {
    const staff = await prisma.user.count({ where: { branchId, isActive: true } });
    if (staff > 0) {
      throw new DomainError(
        `В отделении работают сотрудники (${staff}). Переведите их в другое отделение или деактивируйте.`,
      );
    }
  }
  await prisma.branch.update({ where: { id: branchId }, data: { isActive: active } });
  return branch;
}
