"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, UserPlus } from "lucide-react";

type Role = "BRANCH_MANAGER" | "HQ_MANAGER";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  branch: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BRANCH_MANAGER",
    branch: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.name.trim()) newErrors.name = "Введите ФИО";
    if (!form.email.trim()) newErrors.email = "Введите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Некорректный email";

    if (!form.password) newErrors.password = "Введите пароль";
    else if (form.password.length < 8)
      newErrors.password = "Минимум 8 символов";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Пароли не совпадают";

    if (form.role === "BRANCH_MANAGER" && !form.branch.trim())
      newErrors.branch = "Укажите отделение";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // TODO: API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    alert("Регистрация отправлена! (API пока не подключен)");
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <>
      {/* Mobile branding */}
      <div className="lg:hidden text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">DisputeKZ</h1>
        <p className="text-slate-500 text-sm">Система управления диспутами</p>
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-sm">
        <CardHeader className="space-y-1 px-0 lg:px-6">
          <CardTitle className="text-xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт для работы с диспутами
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-0 lg:px-6">
            {/* ФИО */}
            <div className="space-y-2">
              <Label htmlFor="name">ФИО</Label>
              <Input
                id="name"
                placeholder="Иванов Иван Иванович"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ivanov@bank.kz"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Роль */}
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select
                id="role"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
              >
                <option value="BRANCH_MANAGER">Менеджер отделения</option>
                <option value="HQ_MANAGER">Менеджер головного офиса</option>
              </Select>
            </div>

            {/* Отделение — только для менеджера отделения */}
            {form.role === "BRANCH_MANAGER" && (
              <div className="space-y-2">
                <Label htmlFor="branch">Отделение</Label>
                <Input
                  id="branch"
                  placeholder="Филиал Алматы, ул. Абая 1"
                  value={form.branch}
                  onChange={(e) => updateField("branch", e.target.value)}
                  className={errors.branch ? "border-red-500" : ""}
                />
                {errors.branch && (
                  <p className="text-xs text-red-500">{errors.branch}</p>
                )}
              </div>
            )}

            {/* Пароль */}
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 8 символов"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 px-0 lg:px-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Регистрация...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Зарегистрироваться
                </span>
              )}
            </Button>

            <p className="text-sm text-slate-500 text-center">
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
