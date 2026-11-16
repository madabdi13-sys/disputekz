import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Введите корректный email" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Введите пароль" }),
});

export const REGISTRATION_ROLES = ["BRANCH_MANAGER", "HQ_MANAGER"] as const;

export const PasswordSchema = z
  .string()
  .min(8, { error: "Минимум 8 символов" })
  .max(128, { error: "Не длиннее 128 символов" })
  .regex(/\p{L}/u, { error: "Должна быть хотя бы одна буква" })
  .regex(/[0-9]/, { error: "Должна быть хотя бы одна цифра" });

export const RegisterSchema = z
  .object({
    organizationId: z.string().min(1, { error: "Выберите банк" }),
    name: z.string().trim().min(3, { error: "Введите ФИО" }).max(200),
    email: z.email({ error: "Некорректный email" }).trim().toLowerCase(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s()-]{10,20}$/, { error: "Введите телефон, например +7 700 000 00 00" }),
    role: z.enum(REGISTRATION_ROLES, { error: "Выберите должность" }),
    branchId: z.string().optional(),
    orderNumber: z.string().trim().min(1, { error: "Введите номер приказа" }).max(100),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    error: "Пароли не совпадают",
  })
  .refine((d) => d.role !== "BRANCH_MANAGER" || !!d.branchId, {
    path: ["branchId"],
    error: "Выберите отделение",
  });

export type RegisterField = keyof z.input<typeof RegisterSchema>;

export type FormState<F extends string> =
  | {
      errors?: Partial<Record<F, string>>;
      message?: string;
      values?: Partial<Record<F, string>>;
    }
  | undefined;

/** Первая ошибка по каждому полю — для вывода под инпутом. */
export function fieldErrors<F extends string>(error: z.ZodError): Partial<Record<F, string>> {
  const out: Partial<Record<F, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as F | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
