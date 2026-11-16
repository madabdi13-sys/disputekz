"use client";

import { startTransition, useActionState } from "react";
import type { ActionResult } from "@/lib/action-result";

/**
 * Обёртка над useActionState для форм с server action.
 * - Отправляет без автосброса формы (React 19 сбрасывает форму после action,
 *   из-за чего при ошибке теряются выбранные значения в select).
 * - Вызывает onSuccess, когда action вернул { ok: true } (например, закрыть модалку).
 */
export function useFormAction<F extends string>(
  action: (prev: ActionResult<F>, formData: FormData) => Promise<ActionResult<F>>,
  onSuccess?: (result: NonNullable<ActionResult<F>>) => void,
) {
  const [state, dispatch, pending] = useActionState(async (prev: ActionResult<F>, formData: FormData) => {
    const result = await action(prev, formData);
    if (result?.ok) onSuccess?.(result);
    return result;
  }, undefined);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, onSubmit, pending };
}
