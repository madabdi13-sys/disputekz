import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DisputeKZ — Управление диспутами",
  description: "Система управления банковскими диспутами",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
