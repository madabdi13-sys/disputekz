import * as z from "zod";

export const MANAGED_ROLES = ["BRANCH_MANAGER", "HQ_MANAGER"] as const;

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{10,20}$/, { error: "Введите телефон, например +7 700 000 00 00" });

export const RejectRequestSchema = z.object({
  id: z.string().min(1),
  reason: z.string().trim().min(3, { error: "Укажите причину отказа" }).max(500),
});

export const UpdateUserSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(3, { error: "Введите ФИО" }).max(200),
    phone: z.union([phone, z.literal("")]),
    role: z.enum(MANAGED_ROLES, { error: "Выберите должность" }),
    branchId: z.string().optional(),
  })
  .refine((d) => d.role !== "BRANCH_MANAGER" || !!d.branchId, {
    path: ["branchId"],
    error: "Выберите отделение",
  });
export type UpdateUserField = keyof z.input<typeof UpdateUserSchema>;

export const BranchSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3, { error: "Введите название отделения" }).max(200),
  code: z
    .string()
    .trim()
    .max(32, { error: "Не длиннее 32 символов" })
    .regex(/^[\p{L}0-9_-]*$/u, { error: "Только буквы, цифры, дефис и подчёркивание" }),
});
export type BranchField = keyof z.input<typeof BranchSchema>;
