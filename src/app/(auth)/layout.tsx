import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl h-14 px-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <Logo size="md" />
          </Link>
          <div className="text-[13px] text-zinc-500">
            Служба поддержки:{" "}
            <a
              href="mailto:support@disputekz.kz"
              className="text-zinc-900 hover:text-zinc-700 underline underline-offset-4"
            >
              support@disputekz.kz
            </a>
          </div>
        </div>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl h-12 px-6 flex items-center justify-between text-[12px] text-zinc-500">
          <span>&copy; 2026 disputekz. Все права защищены.</span>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-zinc-900">
              Условия использования
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900">
              Конфиденциальность
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
