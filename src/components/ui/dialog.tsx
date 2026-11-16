"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Модальное окно на нативном <dialog>: фокус-ловушка, Esc и фон браузер даёт сам.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Клик по затемнённому фону закрывает окно.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby={titleId}
      className="m-auto w-[min(480px,calc(100vw-32px))] rounded-lg border border-zinc-200 bg-white p-0 text-left font-normal whitespace-normal text-zinc-900 shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop:bg-zinc-900/45"
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-[16px] font-semibold tracking-[-0.01em]">
                {title}
              </h2>
              {description && <div className="mt-1 text-[13px] text-zinc-500">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function DialogActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>;
}
