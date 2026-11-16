import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12px] leading-4 text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] leading-4 text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
      {message}
    </div>
  );
}

export function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight size={16} strokeWidth={1.5} />
        </>
      )}
    </Button>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.02em] text-zinc-900">{title}</h1>
      <p className="mt-2 text-[14px] leading-5 text-zinc-500">{subtitle}</p>
    </div>
  );
}
