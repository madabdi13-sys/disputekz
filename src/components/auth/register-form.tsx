"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { register } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PasswordInput } from "./password-input";
import { AuthHeading, Field, FormError, SubmitButton } from "./form-parts";

export type RegisterOrganization = {
  id: string;
  name: string;
  branches: { id: string; name: string }[];
};

export function RegisterForm({ organizations }: { organizations: RegisterOrganization[] }) {
  const [state, action, pending] = useActionState(register, undefined);
  const v = state?.values;
  const e = state?.errors;

  // Банк и должность управляют составом формы, поэтому они в состоянии.
  const [organizationId, setOrganizationId] = useState(v?.organizationId ?? "");
  const [role, setRole] = useState(v?.role ?? "BRANCH_MANAGER");
  const branches = organizations.find((o) => o.id === organizationId)?.branches ?? [];

  return (
    <div className="w-full">
      <AuthHeading
        title="Заявка на регистрацию"
        subtitle="Заполните данные сотрудника. После отправки заявка будет рассмотрена администратором вашего банка."
      />

      <div className="mb-6 flex gap-2.5 rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-3">
        <Info size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-zinc-500" />
        <p className="text-[13px] leading-[18px] text-zinc-600">
          Доступ открывается только после проверки номера приказа о приёме на работу. Обычно это занимает до 1
          рабочего дня.
        </p>
      </div>

      <FormError message={state?.message} />

      <form
        className="space-y-5"
        noValidate
        // Отправка без автосброса формы (React 19 сбрасывает форму после action,
        // а выбор банка и отделения при ошибке должен сохраниться).
        onSubmit={(ev) => {
          ev.preventDefault();
          const formData = new FormData(ev.currentTarget);
          startTransition(() => action(formData));
        }}
      >
        <Field label="Банк" htmlFor="organizationId" error={e?.organizationId}>
          <Select
            id="organizationId"
            name="organizationId"
            value={organizationId}
            onChange={(ev) => setOrganizationId(ev.target.value)}
            error={!!e?.organizationId}
            required
          >
            <option value="">Выберите из списка</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="ФИО" htmlFor="name" error={e?.name}>
          <Input
            id="name"
            name="name"
            placeholder="Иванов Иван Иванович"
            autoComplete="name"
            defaultValue={v?.name}
            error={!!e?.name}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" error={e?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ivanov@bank.kz"
              autoComplete="email"
              defaultValue={v?.email}
              error={!!e?.email}
              required
            />
          </Field>
          <Field label="Телефон" htmlFor="phone" error={e?.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+7 700 000 00 00"
              autoComplete="tel"
              defaultValue={v?.phone}
              error={!!e?.phone}
              required
            />
          </Field>
        </div>

        <Field label="Должность" htmlFor="role" error={e?.role}>
          <Select id="role" name="role" value={role} onChange={(ev) => setRole(ev.target.value)}>
            <option value="BRANCH_MANAGER">Менеджер отделения</option>
            <option value="HQ_MANAGER">Менеджер головного офиса</option>
          </Select>
        </Field>

        {role === "BRANCH_MANAGER" && (
          <Field label="Отделение" htmlFor="branchId" error={e?.branchId}>
            <Select
              // Новый банк — новый список отделений, выбор сбрасывается.
              key={organizationId}
              id="branchId"
              name="branchId"
              defaultValue={organizationId === v?.organizationId ? v?.branchId : ""}
              error={!!e?.branchId}
              disabled={!organizationId}
              required
            >
              <option value="">{organizationId ? "Выберите отделение" : "Сначала выберите банк"}</option>
              {branches.map((br) => (
                <option key={br.id} value={br.id}>
                  {br.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field
          label="Номер приказа о приёме на работу"
          htmlFor="orderNumber"
          error={e?.orderNumber}
          hint="Указан во внутренних документах отдела кадров"
        >
          <Input
            id="orderNumber"
            name="orderNumber"
            placeholder="Например, №123-к от 01.01.2026"
            defaultValue={v?.orderNumber}
            error={!!e?.orderNumber}
            required
          />
        </Field>

        <Field
          label="Пароль"
          htmlFor="password"
          error={e?.password}
          hint="Минимум 8 символов, хотя бы одна буква и одна цифра"
        >
          <PasswordInput
            id="password"
            name="password"
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
            error={!!e?.password}
            required
          />
        </Field>

        <Field label="Повторите пароль" htmlFor="confirmPassword" error={e?.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Введите пароль ещё раз"
            autoComplete="new-password"
            error={!!e?.confirmPassword}
            required
          />
        </Field>

        <div className="pt-2">
          <SubmitButton pending={pending} label="Отправить заявку" pendingLabel="Отправка..." />
        </div>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-center">
        <p className="text-[13px] text-zinc-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
