"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    alert("Вход выполнен (API пока не подключен)");
  }

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.02em] text-zinc-900">
          Вход в систему
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500 leading-5">
          Введите email и пароль, чтобы продолжить работу с диспутами.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="ivanov@bank.kz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-zinc-500 hover:text-zinc-900 underline underline-offset-4"
            >
              Забыли пароль?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
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
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
                Вход...
              </>
            ) : (
              <>
                Войти
                <ArrowRight size={16} strokeWidth={1.5} />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Link to register */}
      <div className="mt-8 pt-6 border-t border-zinc-200 text-center">
        <p className="text-[13px] text-zinc-500">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="text-zinc-900 font-medium hover:text-zinc-700 underline underline-offset-4"
          >
            Отправить заявку на регистрацию
          </Link>
        </p>
      </div>
    </div>
  );
}
