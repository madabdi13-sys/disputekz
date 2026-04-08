# DisputeKZ — Архитектура системы

## Концепция

Веб-приложение для управления диспутами в банках Казахстана.
Заменяет ручной учёт в Excel на единый интерфейс с маршрутизацией,
шаблонами документов и отслеживанием статусов.

---

## MVP Scope (v0.1)

| Параметр | Значение |
|----------|----------|
| Банков | 1 |
| Направление диспута | 1 (определим конкретное) |
| Пользователи | Менеджер отделения, Менеджер ГО, Админ |
| Шаблон | 1 заявление по выбранному типу диспута |
| Маршрут | Фиксированный: Отделение → ГО → Ответ |

### Что входит в MVP

- [x] Регистрация / авторизация (email + пароль)
- [x] Роли: менеджер отделения, менеджер ГО, админ
- [x] Создание диспута по шаблону (форма)
- [x] Генерация PDF из заполненной формы
- [x] Маршрутизация: отделение → ГО → ответ
- [x] Статусы и отслеживание
- [x] Дашборд с активными диспутами

### Что НЕ входит в MVP

- Мультитенантность (несколько банков)
- Интеграция с АБС/процессингом
- ЭЦП (НУЦ РК)
- SSO/LDAP
- SMS/Push уведомления
- Настраиваемые маршруты
- SLA и эскалации

---

## Технологический стек

```
┌─────────────────────────────────────────┐
│              Frontend                    │
│         Next.js 14 (App Router)         │
│         Tailwind CSS + shadcn/ui        │
│         TypeScript                      │
└─────────────┬───────────────────────────┘
              │ REST API / Server Actions
┌─────────────▼───────────────────────────┐
│              Backend                     │
│         Next.js API Routes              │
│         Prisma ORM                      │
│         NextAuth.js (auth)              │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│              Database                    │
│         PostgreSQL                       │
│         (JSON-поля для форм)            │
└─────────────────────────────────────────┘

PDF: @react-pdf/renderer
```

### Почему этот стек

| Выбор | Причина |
|-------|---------|
| **Next.js** | Fullstack в одном проекте, SSR, API routes — быстрый старт для MVP |
| **Tailwind + shadcn/ui** | Красивый UI из коробки, кастомизируется, не тянет лишнего |
| **Prisma** | Type-safe ORM, миграции, удобная работа с PostgreSQL |
| **PostgreSQL** | Надёжная СУБД, JSON-поля для гибких форм шаблонов |
| **NextAuth** | Простая авторизация с ролями, легко расширить до SSO потом |
| **@react-pdf/renderer** | Генерация PDF на клиенте/сервере из React-компонентов |

---

## Роли и права

| Действие | Менеджер отделения | Менеджер ГО | Админ |
|----------|--------------------|-------------|-------|
| Создать диспут | ✅ | ❌ | ✅ |
| Заполнить шаблон / скачать PDF | ✅ | ❌ | ✅ |
| Видеть свои диспуты | ✅ | ❌ | ✅ |
| Видеть входящие диспуты | ❌ | ✅ | ✅ |
| Взять в работу | ❌ | ✅ | ✅ |
| Отправить ответ | ❌ | ✅ | ✅ |
| Управлять пользователями | ❌ | ❌ | ✅ |
| Управлять шаблонами | ❌ | ❌ | ✅ |

---

## Статусы диспута (State Machine)

```
  [DRAFT] ──создан──▶ [SUBMITTED]
                          │
                     отправлен в ГО
                          │
                          ▼
                    [IN_REVIEW]
                      │       │
                 одобрен    возврат
                   │          │
                   ▼          ▼
              [APPROVED]  [RETURNED]
                   │          │
              исполнен    доработка
                   │          │
                   ▼          ▼
              [COMPLETED] [SUBMITTED] (повторно)
```

| Статус | Описание | Кто видит как активный |
|--------|----------|----------------------|
| `DRAFT` | Черновик, менеджер заполняет | Менеджер отделения |
| `SUBMITTED` | Отправлен в ГО | Менеджер ГО |
| `IN_REVIEW` | Взят в работу менеджером ГО | Оба |
| `APPROVED` | Одобрен | Оба |
| `RETURNED` | Возвращён на доработку | Менеджер отделения |
| `COMPLETED` | Завершён | Уходит из активных |

---

## Структура страниц (UI/UX)

### Страницы MVP

```
/                        → Редирект на /dashboard
/login                   → Вход
/register                → Регистрация
/dashboard               → Главная: активные диспуты
/disputes/new            → Создание диспута (выбор шаблона → форма)
/disputes/[id]           → Карточка диспута (статус, история, документы)
/disputes/[id]/pdf       → Предпросмотр и скачивание PDF
/admin/users             → Управление пользователями (админ)
/admin/templates         → Управление шаблонами (админ)
```

### UI/UX принципы

1. **Dashboard — только активные.** Завершённые уходят в архив.
   Менеджер видит свои, ГО видит входящие. Фильтры и поиск.

2. **Карточка диспута — timeline.** Вертикальная лента событий:
   кто создал, кто взял, комментарии, смена статуса. Всё прозрачно.

3. **Создание — wizard.** Пошагово: выбор типа → заполнение формы →
   предпросмотр PDF → отправка. Не перегружаем одну страницу.

4. **Цветовая индикация статусов.** Серый — черновик, синий — отправлен,
   жёлтый — в работе, зелёный — одобрен, красный — возврат.

5. **Мобильная адаптивность.** Менеджеры в отделениях могут работать
   с планшетов.

---

## Схема БД (Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String
  role        Role     @default(BRANCH_MANAGER)
  branch      String?
  disputes    Dispute[] @relation("creator")
  assignments Dispute[] @relation("assignee")
  comments    Comment[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  BRANCH_MANAGER
  HQ_MANAGER
  ADMIN
}

model Template {
  id          String   @id @default(cuid())
  name        String
  description String?
  fields      Json     // Массив полей формы: [{name, type, label, required}]
  isActive    Boolean  @default(true)
  disputes    Dispute[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Dispute {
  id          String        @id @default(cuid())
  number      String        @unique // Номер диспута (авто)
  status      DisputeStatus @default(DRAFT)
  templateId  String
  template    Template      @relation(fields: [templateId], references: [id])
  formData    Json          // Заполненные данные формы
  creatorId   String
  creator     User          @relation("creator", fields: [creatorId], references: [id])
  assigneeId  String?
  assignee    User?         @relation("assignee", fields: [assigneeId], references: [id])
  comments    Comment[]
  history     StatusHistory[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum DisputeStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  RETURNED
  COMPLETED
}

model StatusHistory {
  id        String        @id @default(cuid())
  disputeId String
  dispute   Dispute       @relation(fields: [disputeId], references: [id])
  fromStatus DisputeStatus?
  toStatus  DisputeStatus
  userId    String
  comment   String?
  createdAt DateTime      @default(now())
}

model Comment {
  id        String   @id @default(cuid())
  text      String
  disputeId String
  dispute   Dispute  @relation(fields: [disputeId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## Структура проекта

```
disputekz/
├── docs/
│   └── ARCHITECTURE.md          # Этот файл
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── disputes/
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   └── admin/
│   │   │       ├── users/
│   │   │       └── templates/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── disputes/
│   │   │   ├── templates/
│   │   │   └── users/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui компоненты
│   │   ├── disputes/            # Компоненты диспутов
│   │   ├── templates/           # Компоненты шаблонов
│   │   └── layout/              # Header, Sidebar, etc.
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client
│   │   ├── auth.ts              # NextAuth config
│   │   ├── pdf.ts               # PDF generation
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## План реализации (поэтапно)

### Этап 1 — Фундамент
- [ ] Инициализация Next.js + TypeScript + Tailwind
- [ ] Настройка Prisma + PostgreSQL
- [ ] Базовая авторизация (NextAuth)
- [ ] Layout: sidebar, header, роутинг

### Этап 2 — Авторизация и роли
- [ ] Страница логина
- [ ] Страница регистрации
- [ ] Middleware для защиты роутов
- [ ] RBAC (проверка ролей)

### Этап 3 — Шаблоны
- [ ] Админ: CRUD шаблонов
- [ ] Конструктор полей формы (JSON)
- [ ] Рендер формы по шаблону

### Этап 4 — Диспуты
- [ ] Создание диспута (wizard)
- [ ] Генерация PDF
- [ ] Отправка (смена статуса)
- [ ] Карточка диспута с timeline

### Этап 5 — Dashboard
- [ ] Список активных диспутов
- [ ] Фильтры по статусу
- [ ] Поиск
- [ ] Раздельные вью для ролей

### Этап 6 — Полировка
- [ ] Мобильная адаптивность
- [ ] Уведомления (in-app)
- [ ] Архив завершённых
- [ ] Тестирование

---

## Открытые вопросы (нужен ответ)

1. **Какой тип диспута берём для MVP?** (chargeback, возврат, мошенничество?)
2. **Физическая подпись или ЭЦП?** (для MVP скорее всего физическая — скан)
3. **Хостинг** — on-premise или облако для начала?
4. **Команда** — кто пишет код? Какой опыт со стеком?
