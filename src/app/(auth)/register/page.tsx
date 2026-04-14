"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Eye, EyeOff, ArrowRight, Info } from "lucide-react";

type Role = "BRANCH_MANAGER" | "HQ_MANAGER";

interface FormData {
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  branchId: string;
  orderNumber: string;
  password: string;
  confirmPassword: string;
}

// TODO: загрузка из API при интеграции
const MOCK_ORGANIZATIONS = [
  { id: "org-1", name: "АО Народный Банк Казахстана" },
  { id: "org-2", name: "АО Kaspi Bank" },
  { id: "org-3", name: "АО Банк ЦентрКредит" },
];

const MOCK_BRANCHES = [
  { id: "br-1", name: "Отделение №1, г. Алматы, пр. Абая 150" },
  { id: "br-2", name: "Отделение №5, г. Алматы, ул. Гагарина 45" },
  { id: "br-3", name: "Отделение №12, г. Астана, пр. Республики 24" },
];

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    organizationId: "",
    name: "",
    email: "",
    phone: "",
    role: "BRANCH_MANAGER",
    branchId: "",
    orderNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.organizationId) e.organizationId = "Выберите банк";
    if (!form.name.trim()) e.name = "Введите ФИО";
    if (!form.email.trim()) e.email = "Введите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Некорректный email";
    if (!form.phone.trim()) e.phone = "Введите телефон";
    if (form.role === "BRANCH_MANAGER" && !form.branchId)
      e.branchId = "Выберите отделение";
    if (!form.orderNumber.trim()) e.orderNumber = "Введите номер приказа";
    if (!form.password) e.password = "Введите пароль";
    else if (form.password.length < 8) e.password = "Минимум 8 символов";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Пароли не совпадают";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    // TODO: redirect to /pending
    alert("Заявка отправлена на рассмотрение администратору банка");
  }

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.02em] text-zinc-900">
          Заявка на регистрацию
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500 leading-5">
          Заполните данные сотрудника. После отправки заявка будет
          рассмотрена администратором вашего банка.
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex gap-2.5 rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-3">
        <Info
          size={16}
          strokeWidth={1.5}
          className="mt-0.5 shrink-0 text-zinc-500"
        />
        <p className="text-[13px] leading-[18px] text-zinc-600">
          Доступ открывается только после проверки номера приказа о приёме
          на работу. Обычно это занимает до 1 рабочего дня.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Organization */}
        <Field
          label="Банк"
          error={errors.organizationId}
          htmlFor="organization"
        >
          <Select
            id="organization"
            value={form.organizationId}
            onChange={(e) => set("organizationId", e.target.value)}
            error={!!errors.organizationId}
          >
            <option value="">Выберите из списка</option>
            {MOCK_ORGANIZATIONS.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </Select>
        </Field>

        {/* Name */}
        <Field label="ФИО" error={errors.name} htmlFor="name">
          <Input
            id="name"
            placeholder="Иванов Иван Иванович"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={!!errors.name}
          />
        </Field>

        {/* Email + Phone in a row */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" error={errors.email} htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="ivanov@bank.kz"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={!!errors.email}
            />
          </Field>
          <Field label="Телефон" error={errors.phone} htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              placeholder="+7 700 000 00 00"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              error={!!errors.phone}
            />
          </Field>
        </div>

        {/* Role */}
        <Field label="Должность" htmlFor="role">
          <Select
            id="role"
            value={form.role}
            onChange={(e) => set("role", e.target.value as Role)}
          >
            <option value="BRANCH_MANAGER">Менеджер отделения</option>
            <option value="HQ_MANAGER">Менеджер головного офиса</option>
          </Select>
        </Field>

        {/* Branch — only for BRANCH_MANAGER */}
        {form.role === "BRANCH_MANAGER" && (
          <Field label="Отделение" error={errors.branchId} htmlFor="branch">
            <Select
              id="branch"
              value={form.branchId}
              onChange={(e) => set("branchId", e.target.value)}
              error={!!errors.branchId}
            >
              <option value="">Выберите отделение</option>
              {MOCK_BRANCHES.map((br) => (
                <option key={br.id} value={br.id}>
                  {br.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {/* Order number */}
        <Field
          label="Номер приказа о приёме на работу"
          error={errors.orderNumber}
          htmlFor="orderNumber"
          hint="Указан во внутренних документах отдела кадров"
        >
          <Input
            id="orderNumber"
            placeholder="Например, №123-к от 01.01.2026"
            value={form.orderNumber}
            onChange={(e) => set("orderNumber", e.target.value)}
            error={!!errors.orderNumber}
          />
        </Field>

        {/* Password */}
        <Field label="Пароль" error={errors.password} htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Минимум 8 символов"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              error={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.5} />
              ) : (
                <Eye size={16} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </Field>

        {/* Confirm password */}
        <Field
          label="Повторите пароль"
          error={errors.confirmPassword}
          htmlFor="confirmPassword"
        >
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Введите пароль ещё раз"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            error={!!errors.confirmPassword}
          />
        </Field>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
                Отправка...
              </>
            ) : (
              <>
                Отправить заявку
                <ArrowRight size={16} strokeWidth={1.5} />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Link to login */}
      <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
        <p className="text-[13px] text-zinc-500">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="text-zinc-900 font-medium hover:text-zinc-700 underline underline-offset-4"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field wrapper — label + children + error/hint                       */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-[12px] leading-4 text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[12px] leading-4 text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
