import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { homePathFor } from "@/lib/permissions";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Вход — DisputeKZ" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));

  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}
