import "server-only";
import { prisma } from "@/lib/prisma";
import { orgScope } from "@/lib/tenant";
import { DomainError } from "@/lib/action-result";
import type { CurrentUser } from "@/lib/dal";
import type { RegistrationStatus } from "@/generated/prisma/enums";

export async function listRegistrationRequests(user: CurrentUser, status: RegistrationStatus) {
  const scope = orgScope(user);
  const requests = await prisma.registrationRequest.findMany({
    where: { ...scope, status },
    // Ожидающие — по очереди поступления, рассмотренные — свежие сверху.
    orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      branchId: true,
      orderNumber: true,
      status: true,
      rejectionReason: true,
      reviewedById: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // branchId и reviewedById в заявке без связей в схеме — подтягиваем имена отдельно, в рамках банка.
  const [branches, reviewers] = await Promise.all([
    prisma.branch.findMany({
      where: { ...scope, id: { in: requests.flatMap((r) => (r.branchId ? [r.branchId] : [])) } },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { ...scope, id: { in: requests.flatMap((r) => (r.reviewedById ? [r.reviewedById] : [])) } },
      select: { id: true, name: true },
    }),
  ]);
  const branchName = new Map(branches.map((b) => [b.id, b.name]));
  const reviewerName = new Map(reviewers.map((u) => [u.id, u.name]));

  return requests.map((r) => ({
    ...r,
    branchName: r.branchId ? (branchName.get(r.branchId) ?? null) : null,
    reviewerName: r.reviewedById ? (reviewerName.get(r.reviewedById) ?? null) : null,
  }));
}

export async function countPendingRequests(user: CurrentUser) {
  return prisma.registrationRequest.count({ where: { ...orgScope(user), status: "PENDING" } });
}

/** Одобрение: создаёт сотрудника из заявки. Пароль — тот, что сотрудник указал при регистрации. */
export async function approveRegistrationRequest(user: CurrentUser, requestId: string) {
  const scope = orgScope(user);

  return prisma.$transaction(async (tx) => {
    const request = await tx.registrationRequest.findFirst({ where: { id: requestId, ...scope } });
    if (!request) throw new DomainError("Заявка не найдена");
    if (request.status !== "PENDING") throw new DomainError("Заявка уже рассмотрена");

    const existing = await tx.user.findUnique({ where: { email: request.email }, select: { id: true } });
    if (existing) {
      throw new DomainError("Сотрудник с таким email уже есть в системе. Отклоните заявку как дубликат.");
    }

    if (request.role === "BRANCH_MANAGER") {
      const branch = await tx.branch.findFirst({
        where: { id: request.branchId ?? "", ...scope },
        select: { isActive: true },
      });
      if (!branch) throw new DomainError("Отделение из заявки не найдено. Отклоните заявку.");
      if (!branch.isActive) throw new DomainError("Отделение из заявки закрыто. Откройте его или отклоните заявку.");
    }

    // Атомарный захват: если две вкладки одобряют одну заявку, пройдёт только одна.
    const claimed = await tx.registrationRequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: { status: "APPROVED", reviewedById: user.id },
    });
    if (claimed.count !== 1) throw new DomainError("Заявка уже рассмотрена");

    return tx.user.create({
      data: {
        email: request.email,
        name: request.name,
        phone: request.phone,
        password: request.password,
        role: request.role,
        organizationId: scope.organizationId,
        branchId: request.role === "BRANCH_MANAGER" ? request.branchId : null,
        orderNumber: request.orderNumber,
      },
      select: { id: true, name: true, email: true },
    });
  });
}

export async function rejectRegistrationRequest(user: CurrentUser, requestId: string, reason: string) {
  const result = await prisma.registrationRequest.updateMany({
    where: { id: requestId, ...orgScope(user), status: "PENDING" },
    data: { status: "REJECTED", reviewedById: user.id, rejectionReason: reason },
  });
  if (result.count !== 1) throw new DomainError("Заявка не найдена или уже рассмотрена");
}
