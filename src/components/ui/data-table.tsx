import { cn } from "@/lib/utils";

/** Таблица по DESIGN.md (плотный вариант). На узком экране прокручивается внутри рамки. */
export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-x-auto rounded-lg border border-zinc-200 bg-white", className)}>
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.04em] text-zinc-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-zinc-100 px-4 py-2.5 align-middle text-zinc-800", className)}>{children}</td>;
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("transition-colors hover:bg-zinc-50 [&:last-child>td]:border-b-0", className)}>{children}</tr>;
}

/** Две строки в ячейке: главное и подпись (ФИО + email и т.п.). */
export function CellStack({ primary, secondary }: { primary: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="whitespace-nowrap font-medium text-zinc-900">{primary}</div>
      {secondary && <div className="whitespace-nowrap text-[12px] text-zinc-500">{secondary}</div>}
    </div>
  );
}
