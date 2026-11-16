"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";
import { AuthHeading, Field, FormError, SubmitButton } from "./form-parts";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="w-full">
      <AuthHeading title="Вход в систему" subtitle="Введите email и пароль, чтобы продолжить работу с диспутами." />

      <FormError message={state?.message} />

      <form action={action} className="space-y-5" noValidate>
        {next && <input type="hidden" name="next" value={next} />}

        <Field label="Email" htmlFor="email" error={state?.errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ivanov@bank.kz"
            autoComplete="email"
            defaultValue={state?.values?.email}
            error={!!state?.errors?.email}
            aria-describedby={state?.errors?.email ? "email-error" : undefined}
            required
          />
        </Field>

        <Field
          label="Пароль"
          htmlFor="password"
          error={state?.errors?.password}
          hint="Забыли пароль? Обратитесь к администратору вашего банка."
        >
          <PasswordInput
            id="password"
            name="password"
            placeholder="Введите пароль"
            autoComplete="current-password"
            error={!!state?.errors?.password}
            required
          />
        </Field>

        <div className="pt-1">
          <SubmitButton pending={pending} label="Войти" pendingLabel="Вход..." />
        </div>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-center">
        <p className="text-[13px] text-zinc-500">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
            Отправить заявку на регистрацию
          </Link>
        </p>
      </div>
    </div>
  );
}
