"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession, getClientMeta } from "@/lib/session";
import { getCurrentUser } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import { homePathFor } from "@/lib/permissions";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import {
  LoginSchema,
  RegisterSchema,
  fieldErrors,
  type FormState,
  type RegisterField,
} from "@/lib/validations/auth";

const BCRYPT_ROUNDS = 12;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Хеш-пустышка: сравниваем с ним, когда пользователя нет, чтобы время ответа
// не выдавало, существует ли email.
const DUMMY_HASH = "$2b$12$R6W5f4x..zA/RIVugf15EOpoeNjESDYejBMgomiUtcZCcq/HcNGLe";

/** Безопасный путь возврата после входа: только относительный путь внутри сайта. */
function safeNextPath(next: FormDataEntryValue | null): string | null {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

// ------------------------------------------------------------
// Вход
// ------------------------------------------------------------

export type LoginField = "email" | "password";

export async function login(_prev: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: fieldErrors<LoginField>(parsed.error) };
  }
  const { email, password } = parsed.data;

  const { ipAddress } = await getClientMeta();
  const emailKey = `login:email:${email}`;
  const byEmail = checkRateLimit(emailKey, 5, LOGIN_WINDOW_MS);
  const byIp = checkRateLimit(`login:ip:${ipAddress ?? "unknown"}`, 30, LOGIN_WINDOW_MS);
  if (!byEmail.ok || !byIp.ok) {
    const minutes = !byEmail.ok ? byEmail.retryAfterMinutes : !byIp.ok ? byIp.retryAfterMinutes : 15;
    return { message: `Слишком много попыток входа. Попробуйте через ${minutes} мин.` };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      organizationId: true,
      organization: { select: { isActive: true } },
    },
  });

  const passwordOk = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    // Возможно, это сотрудник, чья заявка ещё не одобрена.
    const request = await prisma.registrationRequest.findFirst({
      where: { email, status: { in: ["PENDING", "REJECTED"] } },
      orderBy: { createdAt: "desc" },
      select: { status: true, password: true, rejectionReason: true },
    });
    if (request && (await bcrypt.compare(password, request.password))) {
      if (request.status === "PENDING") redirect("/pending");
      return {
        message: request.rejectionReason
          ? `Заявка на доступ отклонена: ${request.rejectionReason}`
          : "Заявка на доступ отклонена. Обратитесь к администратору банка.",
      };
    }
    return { message: "Неверный email или пароль", values: { email } };
  }

  if (!user.isActive) {
    return { message: "Учётная запись отключена. Обратитесь к администратору банка." };
  }
  if (user.role !== "SUPER_ADMIN" && !user.organization?.isActive) {
    return { message: "Доступ организации к платформе приостановлен." };
  }

  resetRateLimit(emailKey);
  await createSession(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logAudit({ action: "LOGIN", userId: user.id, organizationId: user.organizationId });

  if (user.mustChangePassword) redirect("/change-password");
  redirect(safeNextPath(formData.get("next")) ?? homePathFor(user.role));
}

// ------------------------------------------------------------
// Выход
// ------------------------------------------------------------

export async function logout() {
  const user = await getCurrentUser();
  await deleteSession();
  if (user) {
    await logAudit({ action: "LOGOUT", userId: user.id, organizationId: user.organizationId });
  }
  redirect("/login");
}

// ------------------------------------------------------------
// Заявка на регистрацию
// ------------------------------------------------------------

export async function register(
  _prev: FormState<RegisterField>,
  formData: FormData,
): Promise<FormState<RegisterField>> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = {
    organizationId: raw.organizationId,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    role: raw.role,
    branchId: raw.branchId,
    orderNumber: raw.orderNumber,
  };

  const parsed = RegisterSchema.safeParse({
    ...values,
    branchId: raw.role === "BRANCH_MANAGER" ? raw.branchId || undefined : undefined,
    password: raw.password,
    confirmPassword: raw.confirmPassword,
  });
  if (!parsed.success) {
    return { errors: fieldErrors<RegisterField>(parsed.error), values };
  }
  const data = parsed.data;

  const { ipAddress } = await getClientMeta();
  const limit = checkRateLimit(`register:ip:${ipAddress ?? "unknown"}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return { message: `Слишком много заявок. Попробуйте через ${limit.retryAfterMinutes} мин.`, values };
  }

  const organization = await prisma.organization.findFirst({
    where: { id: data.organizationId, isActive: true },
    select: { id: true },
  });
  if (!organization) {
    return { errors: { organizationId: "Банк не найден" }, values };
  }

  if (data.role === "BRANCH_MANAGER") {
    const branch = await prisma.branch.findFirst({
      where: { id: data.branchId, organizationId: organization.id, isActive: true },
      select: { id: true },
    });
    if (!branch) return { errors: { branchId: "Отделение не найдено в этом банке" }, values };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
  if (existingUser) {
    return { errors: { email: "Сотрудник с таким email уже зарегистрирован. Войдите в систему." }, values };
  }

  const pending = await prisma.registrationRequest.findFirst({
    where: { email: data.email, status: "PENDING" },
    select: { id: true },
  });
  if (pending) {
    return { errors: { email: "Заявка с этим email уже на рассмотрении" }, values };
  }

  const request = await prisma.registrationRequest.create({
    data: {
      organizationId: organization.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      branchId: data.role === "BRANCH_MANAGER" ? data.branchId : null,
      orderNumber: data.orderNumber,
      password: await bcrypt.hash(data.password, BCRYPT_ROUNDS),
    },
    select: { id: true },
  });

  console.info(`[registration] новая заявка ${request.id} в организацию ${organization.id}`);
  redirect("/pending");
}
