import "server-only";
import { prisma } from "@/lib/prisma";
import { getClientMeta } from "@/lib/session";
import type { Prisma } from "@/generated/prisma/client";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "REGISTRATION_REQUESTED"
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | "DISPUTE_CREATED"
  | "STATUS_CHANGED"
  | "PDF_DOWNLOADED";

/**
 * Запись в аудит-лог. Ошибка записи не должна ломать основное действие —
 * поэтому она логируется, а не пробрасывается.
 */
export async function logAudit(entry: {
  action: AuditAction;
  userId: string;
  organizationId: string | null;
  entity?: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
}) {
  try {
    const { ipAddress } = await getClientMeta();
    await prisma.auditLog.create({ data: { ...entry, ipAddress } });
  } catch (err) {
    console.error("[audit] не удалось записать событие", entry.action, err);
  }
}
