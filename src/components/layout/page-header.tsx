interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-[-0.02em] text-zinc-900">{title}</h1>
        {subtitle && <p className="text-[13px] text-zinc-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
