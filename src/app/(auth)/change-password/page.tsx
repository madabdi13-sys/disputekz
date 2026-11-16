import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { homePathFor } from "@/lib/permissions";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export const metadata: Metadata = { title: "Смена пароля — DisputeKZ" };

export default async function ChangePasswordPage() {
  // getCurrentUser, а не requireUser: тот при mustChangePassword отправляет сюда же.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/change-password");

  return <ChangePasswordForm forced={user.mustChangePassword} backHref={homePathFor(user.role)} />;
}
