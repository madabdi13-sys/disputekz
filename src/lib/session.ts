import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Сессии в БД (а не JWT): удаление строки мгновенно разлогинивает —
 * это нужно для деактивации уволенных сотрудников.
 *
 * В cookie — случайный токен, в БД — его SHA-256. Срок жизни фиксированный,
 * без продления: банковский сотрудник входит заново каждую смену.
 */

export const SESSION_COOKIE = "dk_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 часов

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getClientMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    ipAddress: forwarded ? forwarded.split(",")[0].trim() : h.get("x-real-ip"),
    userAgent: h.get("user-agent")?.slice(0, 500) ?? null,
  };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const { ipAddress, userAgent } = await getClientMeta();

  await prisma.session.create({
    data: { id: hashToken(token), userId, expiresAt, ipAddress, userAgent },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function readSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Удаляет текущую сессию из БД и cookie. */
export async function deleteSession() {
  const token = await readSessionToken();
  if (token) {
    await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  }
  (await cookies()).delete(SESSION_COOKIE);
}

/** Разлогинить пользователя на всех устройствах (деактивация, смена пароля). */
export async function deleteAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
