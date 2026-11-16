import * as z from "zod";

/** Ответ server action для форм: ошибки по полям, общее сообщение, флаг успеха. */
export type ActionResult<F extends string = string> =
  | {
      ok?: boolean;
      message?: string;
      errors?: Partial<Record<F, string>>;
      /** Данные, которые нужно показать после успеха (например, временный пароль). */
      data?: Record<string, string>;
    }
  | undefined;

/** Ошибка бизнес-правила: текст показывается пользователю как есть. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/** Первая ошибка по каждому полю — для вывода под инпутом. */
export function zodFieldErrors<F extends string>(error: z.ZodError): Partial<Record<F, string>> {
  const out: Partial<Record<F, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as F | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Общая обработка ошибок в server actions: бизнес-ошибки — пользователю, остальное — в лог. */
export function actionError(err: unknown): { message: string } {
  if (err instanceof DomainError) return { message: err.message };
  console.error("[action]", err);
  return { message: "Не удалось выполнить действие. Попробуйте ещё раз." };
}
