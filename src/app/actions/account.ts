"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { createSession, deleteAllUserSessions } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { homePathFor } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/rate-limit";
import { PasswordSchema } from "@/lib/validations/auth";
import { zodFieldErrors, type ActionResult } from "@/lib/action-result";

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Введите текущий пароль" }),
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], error: "Пароли не совпадают" })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    error: "Новый пароль должен отличаться от текущего",
  });

export type ChangePasswordField = keyof z.input<typeof ChangePasswordSchema>;

export async function changePasswordAction(
  _prev: ActionResult<ChangePasswordField>,
  formData: FormData,
): Promise<ActionResult<ChangePasswordField>> {
  // Не requireUser: он сам отправляет сюда тех, кому надо сменить пароль.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: zodFieldErrors<ChangePasswordField>(parsed.error) };

  const limit = checkRateLimit(`change-password:${user.id}`, 5, 15 * 60 * 1000);
  if (!limit.ok) return { message: `Слишком много попыток. Попробуйте через ${limit.retryAfterMinutes} мин.` };

  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } });
  if (!record || !(await bcrypt.compare(parsed.data.currentPassword, record.password))) {
    return { errors: { currentPassword: "Неверный текущий пароль" } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(parsed.data.newPassword, 12), mustChangePassword: false },
  });
  // Новый пароль — закрываем входы на других устройствах, текущий открываем заново.
  await deleteAllUserSessions(user.id);
  await createSession(user.id);
  await logAudit({ action: "PASSWORD_CHANGED", userId: user.id, organizationId: user.organizationId });

  redirect(homePathFor(user.role));
}
