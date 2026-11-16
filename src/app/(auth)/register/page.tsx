import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { homePathFor } from "@/lib/permissions";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Заявка на регистрацию — DisputeKZ" };

// Список банков берётся из БД на каждый запрос.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));

  // Публичная страница: только названия активных банков и их отделений, ничего больше.
  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      branches: { where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  return <RegisterForm organizations={organizations} />;
}
