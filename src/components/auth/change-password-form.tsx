"use client";

import Link from "next/link";
import { changePasswordAction } from "@/app/actions/account";
import { logout } from "@/app/actions/auth";
import { useFormAction } from "@/hooks/use-form-action";
import { PasswordInput } from "./password-input";
import { AuthHeading, Field, FormError, SubmitButton } from "./form-parts";

export function ChangePasswordForm({ forced, backHref }: { forced: boolean; backHref: string }) {
  const { state, onSubmit, pending } = useFormAction(changePasswordAction);
  const e = state?.errors;

  return (
    <div className="w-full">
      <AuthHeading
        title={forced ? "Смените пароль" : "Смена пароля"}
        subtitle={
          forced
            ? "Администратор банка сбросил ваш пароль. Придумайте новый, чтобы продолжить работу."
            : "После смены пароля входы на других устройствах закроются."
        }
      />
      <FormError message={state?.message} />
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field
          label={forced ? "Временный пароль" : "Текущий пароль"}
          htmlFor="currentPassword"
          error={e?.currentPassword}
        >
          <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" error={!!e?.currentPassword} required />
        </Field>
        <Field
          label="Новый пароль"
          htmlFor="newPassword"
          error={e?.newPassword}
          hint="Минимум 8 символов, хотя бы одна буква и одна цифра"
        >
          <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" error={!!e?.newPassword} required />
        </Field>
        <Field label="Повторите новый пароль" htmlFor="confirmPassword" error={e?.confirmPassword}>
          <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" error={!!e?.confirmPassword} required />
        </Field>
        <div className="pt-1">
          <SubmitButton pending={pending} label="Сохранить пароль" pendingLabel="Сохраняем..." />
        </div>
      </form>
      <div className="mt-8 border-t border-zinc-200 pt-6 text-center">
        {forced ? (
          <form action={logout}>
            <button type="submit" className="text-[13px] font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
              Выйти
            </button>
          </form>
        ) : (
          <Link href={backHref} className="text-[13px] font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
            Вернуться к работе
          </Link>
        )}
      </div>
    </div>
  );
}
