"use server";

import { refresh } from "next/cache";
import { requirePermission } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import { actionError, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import {
  BranchSchema,
  RejectRequestSchema,
  UpdateUserSchema,
  type BranchField,
  type UpdateUserField,
} from "@/lib/validations/admin";
import { approveRegistrationRequest, rejectRegistrationRequest } from "@/services/registration.service";
import { resetOrgUserPassword, setOrgUserActive, updateOrgUser } from "@/services/user.service";
import { createBranch, setBranchActive, updateBranch } from "@/services/branch.service";

/**
 * Действия администратора банка. Каждое: проверка права → валидация → сервис → аудит → обновление экрана.
 * Банк берётся из сессии (orgScope в сервисах), из формы приходят только id объектов.
 */

function idFrom(formData: FormData) {
  const id = formData.get("id");
  return typeof id === "string" ? id : "";
}

// ------------------------------------------------------------
// Заявки на регистрацию
// ------------------------------------------------------------

export async function approveRequestAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requirePermission("registrations.review");
  try {
    const requestId = idFrom(formData);
    const created = await approveRegistrationRequest(user, requestId);
    await logAudit({
      action: "REGISTRATION_APPROVED",
      userId: user.id,
      organizationId: user.organizationId,
      entity: "user",
      entityId: created.id,
      details: { requestId, email: created.email },
    });
    refresh();
    return { ok: true, message: `${created.name} получил(а) доступ` };
  } catch (err) {
    return actionError(err);
  }
}

export async function rejectRequestAction(_prev: ActionResult<"reason">, formData: FormData): Promise<ActionResult<"reason">> {
  const user = await requirePermission("registrations.review");
  const parsed = RejectRequestSchema.safeParse({ id: formData.get("id"), reason: formData.get("reason") });
  if (!parsed.success) return { errors: zodFieldErrors<"reason">(parsed.error) };

  try {
    await rejectRegistrationRequest(user, parsed.data.id, parsed.data.reason);
    await logAudit({
      action: "REGISTRATION_REJECTED",
      userId: user.id,
      organizationId: user.organizationId,
      entity: "registrationRequest",
      entityId: parsed.data.id,
      details: { reason: parsed.data.reason },
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

// ------------------------------------------------------------
// Сотрудники
// ------------------------------------------------------------

export async function updateUserAction(
  _prev: ActionResult<UpdateUserField>,
  formData: FormData,
): Promise<ActionResult<UpdateUserField>> {
  const actor = await requirePermission("users.manage");
  const role = formData.get("role");
  const parsed = UpdateUserSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    role,
    branchId: role === "BRANCH_MANAGER" ? formData.get("branchId") || undefined : undefined,
  });
  if (!parsed.success) return { errors: zodFieldErrors<UpdateUserField>(parsed.error) };

  try {
    const updated = await updateOrgUser(actor, parsed.data);
    await logAudit({
      action: "USER_UPDATED",
      userId: actor.id,
      organizationId: actor.organizationId,
      entity: "user",
      entityId: updated.id,
      details: { role: parsed.data.role, branchId: parsed.data.branchId ?? null },
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function setUserActiveAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await requirePermission("users.manage");
  const active = formData.get("active") === "true";
  try {
    const target = await setOrgUserActive(actor, idFrom(formData), active);
    await logAudit({
      action: active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      userId: actor.id,
      organizationId: actor.organizationId,
      entity: "user",
      entityId: target.id,
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function resetPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await requirePermission("users.manage");
  try {
    const { target, temporaryPassword } = await resetOrgUserPassword(actor, idFrom(formData));
    // Сам пароль в аудит не пишем — только факт сброса.
    await logAudit({
      action: "PASSWORD_RESET",
      userId: actor.id,
      organizationId: actor.organizationId,
      entity: "user",
      entityId: target.id,
    });
    return { ok: true, data: { temporaryPassword, name: target.name } };
  } catch (err) {
    return actionError(err);
  }
}

// ------------------------------------------------------------
// Отделения
// ------------------------------------------------------------

export async function saveBranchAction(
  _prev: ActionResult<BranchField>,
  formData: FormData,
): Promise<ActionResult<BranchField>> {
  const user = await requirePermission("branches.manage");
  const parsed = BranchSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    code: formData.get("code") ?? "",
  });
  if (!parsed.success) return { errors: zodFieldErrors<BranchField>(parsed.error) };

  try {
    const { id, name, code } = parsed.data;
    const branch = id ? await updateBranch(user, { id, name, code }) : await createBranch(user, { name, code });
    await logAudit({
      action: id ? "BRANCH_UPDATED" : "BRANCH_CREATED",
      userId: user.id,
      organizationId: user.organizationId,
      entity: "branch",
      entityId: branch.id,
      details: { name, code },
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function setBranchActiveAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requirePermission("branches.manage");
  const active = formData.get("active") === "true";
  try {
    const branch = await setBranchActive(user, idFrom(formData), active);
    await logAudit({
      action: active ? "BRANCH_REOPENED" : "BRANCH_CLOSED",
      userId: user.id,
      organizationId: user.organizationId,
      entity: "branch",
      entityId: branch.id,
    });
    refresh();
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
