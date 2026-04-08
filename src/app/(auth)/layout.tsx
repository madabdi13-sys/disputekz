export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DisputeKZ</h1>
          <p className="text-slate-400 mt-1">Система управления диспутами</p>
        </div>

        <div className="space-y-6">
          <blockquote className="text-lg leading-relaxed text-slate-300">
            &laquo;Единое окно для всех участников процесса — от менеджера
            отделения до головного офиса. Прозрачность, контроль, скорость.&raquo;
          </blockquote>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Отслеживание статусов
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              Шаблоны документов
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              Маршрутизация
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500">&copy; 2026 DisputeKZ. Все права защищены.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
