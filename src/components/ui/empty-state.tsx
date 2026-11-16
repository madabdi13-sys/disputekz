import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-zinc-300" strokeWidth={1.25} aria-hidden="true" />
      <p className="mb-1 text-[14px] font-medium text-zinc-700">{title}</p>
      <p className="mx-auto max-w-md text-[13px] text-zinc-500">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
