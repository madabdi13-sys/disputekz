import { prisma } from "@/lib/prisma";

// Проверка живости приложения и БД — для healthcheck в Docker и мониторинга.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", db: "ok" });
  } catch {
    return Response.json({ status: "error", db: "unavailable" }, { status: 503 });
  }
}
