# DisputeKZ

SaaS для управления диспутами (chargeback и спорные операции) в банках Казахстана.
Архитектура, роли, статусы и план работ — [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
Дизайн-система — [`docs/DESIGN.md`](docs/DESIGN.md).
Кликабельный HTML-прототип — `public/preview/` (открывается в браузере без сборки).

## Запуск для разработки

Нужны Node.js 20+ и Docker.

```bash
npm install                 # зависимости + генерация Prisma Client
cp .env.example .env        # настройки; при необходимости поправьте
npm run db:up               # PostgreSQL 16 в Docker
npm run db:migrate          # применить миграции
npm run db:seed             # суперадмин (+ демо-банк при SEED_DEMO=1)
npm run dev                 # http://localhost:3000
```

Вход: суперадмин — данные из `SEED_SUPERADMIN_*` в `.env`.
Демо-сотрудники (при `SEED_DEMO=1`), пароль `demo12345`:

| Email | Роль |
|---|---|
| `admin@demo-bank.kz` | администратор банка |
| `hq@demo-bank.kz` | менеджер головного офиса |
| `branch5@demo-bank.kz` | менеджер отделения №5, Алматы |
| `branch2@demo-bank.kz` | менеджер отделения №2, Астана |

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер |
| `npm run build` / `npm start` | production-сборка и запуск |
| `npm run lint` / `npm run typecheck` | проверки |
| `npm run db:migrate` | создать/применить миграцию после правки `prisma/schema.prisma` |
| `npm run db:seed` | начальные данные (повторный запуск ничего не дублирует) |
| `npm run db:reset` | пересоздать БД с нуля (удаляет данные) |
| `npm run db:studio` | просмотр БД в браузере |

`GET /api/health` — проверка приложения и подключения к БД.
