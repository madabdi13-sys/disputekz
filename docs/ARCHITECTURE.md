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
- [x] Вложения (скан подписанного PDF, документы)
- [x] Аудит-лог действий пользователей

### Что НЕ входит в MVP

- Мультитенантность (несколько банков)
- Интеграция с АБС/процессингом
- ЭЦП (НУЦ РК)
- SSO/LDAP
- SMS/Push уведомления
- Настраиваемые маршруты
- SLA и эскалации

---

## Безопасность (банковский уровень)

> Даже для MVP в банковской среде безопасность — не опция, а требование.

### Обязательно в MVP

| Мера | Реализация | Примечание |
|------|------------|------------|
| **Хеширование паролей** | `argon2` (предпочтительно) или `bcrypt` | Никогда не хранить пароли в открытом виде. Argon2 — winner PHC, устойчив к GPU-атакам |
| **Rate limiting** | На `/login` и `/register` — max 5 попыток / минута на IP | Без этого не пустят даже в пилот. Реализация через middleware + Redis или in-memory |
| **CSRF protection** | Next.js Server Actions покрывают частично, явная проверка на API routes | Для form-based endpoints — обязательный CSRF-токен |
| **Аудит-лог** | Отдельная модель `AuditLog` | Логирование: логин/логаут, скачивание PDF, изменение данных формы, смена статуса, любое действие с данными. В банке это **регуляторное требование** |
| **Input validation** | `zod` на уровне каждого API endpoint и Server Action | Особенно критично для `Template.fields` (JSON) — невалидный шаблон сломает все формы |
| **Secure headers** | `next.config.js` — CSP, X-Frame-Options, HSTS | Базовая защита от XSS и clickjacking |

### После MVP (v0.2+)

- HTTP-only secure cookies для сессий
- IP-whitelist для админ-панели
- 2FA для менеджеров ГО
- Шифрование чувствительных полей в БД (PII)

---

## Технологический стек

```
┌─────────────────────────────────────────┐
│              Frontend                    │
│         Next.js 16 (App Router)         │
│         Tailwind CSS v4 + shadcn/ui     │
│         TypeScript                      │
└─────────────┬───────────────────────────┘
              │ REST API / Server Actions
┌─────────────▼───────────────────────────┐
│              Backend                     │
│         Next.js API Routes              │
│         Prisma ORM                      │
│         NextAuth.js (auth)              │
│         zod (validation)                │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│              Database                    │
│         PostgreSQL                       │
│         (JSON-поля для форм)            │
│         (SEQUENCE для номеров диспутов) │
└─────────────────────────────────────────┘

PDF: puppeteer/playwright (HTML → PDF, гибкость для кириллицы)
     Fallback: @react-pdf/renderer для простых шаблонов
```

### Почему этот стек

| Выбор | Причина |
|-------|---------|
| **Next.js** | Fullstack в одном проекте, SSR, API routes — быстрый старт для MVP |
| **Tailwind + shadcn/ui** | Красивый UI из коробки, кастомизируется, не тянет лишнего |
| **Prisma** | Type-safe ORM, миграции, удобная работа с PostgreSQL |
| **PostgreSQL** | Надёжная СУБД, JSON-поля для гибких форм, SEQUENCE для номеров |
| **NextAuth** | Простая авторизация с ролями, легко расширить до SSO потом |
| **zod** | Валидация на всех уровнях: формы, API, JSON-шаблоны |
| **Puppeteer/Playwright** | HTML → PDF: полная поддержка кириллицы, таблиц, любой вёрстки. Дизайнеру проще верстать шаблон в HTML/CSS чем в react-pdf DSL |

### PDF генерация — решение

`@react-pdf/renderer` имеет ограничения:
- Кириллица требует ручного подключения шрифтов
- Таблицы делаются болезненно
- Сложные шаблоны — много boilerplate

**Выбор для MVP**: Puppeteer/Playwright — рендерим HTML-шаблон в PDF.
Шаблон верстается на обычном HTML/CSS, подставляем данные, генерируем PDF.
Это гибче, и при необходимости дизайнер может верстать шаблоны
без знания react-pdf API.

---

## Роли и права

| Действие | Менеджер отделения | Менеджер ГО | Админ |
|----------|--------------------|-------------|-------|
| Создать диспут | ✅ | ❌ | ✅ |
| Заполнить шаблон / скачать PDF | ✅ | ❌ | ✅ |
| Видеть свои диспуты | ✅ | ❌ | ✅ |
| Видеть входящие диспуты | ❌ | ✅ | ✅ |
| Взять в работу | ❌ | ✅ | ✅ |
| Вернуть на доработку | ❌ | ✅ | ✅ |
| Отправить ответ | ❌ | ✅ | ✅ |
| Отменить диспут | ✅ (свой, до COMPLETED) | ✅ | ✅ |
| Загрузить вложение | ✅ | ✅ | ✅ |
| Управлять пользователями | ❌ | ❌ | ✅ |
| Управлять шаблонами | ❌ | ❌ | ✅ |
| Просмотр аудит-лога | ❌ | ❌ | ✅ |

---

## Статусы диспута (State Machine)

```
                              ┌──────────────────────┐
                              │      CANCELLED       │
                              └──────────────────────┘
                                ▲    ▲    ▲    ▲
                                │    │    │    │
  [DRAFT] ──создан──▶ [SUBMITTED]    │    │    │
                          │          │    │    │
                     отправлен в ГО  │    │    │
                          │          │    │    │
                          ▼          │    │    │
                    [IN_REVIEW] ─────┘    │    │
                      │       │           │    │
                 одобрен    возврат       │    │
                   │          │           │    │
                   ▼          ▼           │    │
              [APPROVED] [RETURNED] ──────┘    │
                   │          │                │
              исполнен    доработка            │
                   │          │                │
                   ▼          ▼                │
              [COMPLETED] [SUBMITTED] (повторно)

  * CANCELLED доступен из любого статуса кроме COMPLETED
```

### Допустимые переходы (конфигурация для state-machine)

```typescript
// lib/state-machine.ts
const TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  DRAFT:     ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['APPROVED', 'RETURNED', 'CANCELLED'],
  APPROVED:  ['COMPLETED', 'CANCELLED'],
  RETURNED:  ['SUBMITTED', 'CANCELLED'],
  COMPLETED: [],          // терминальный статус
  CANCELLED: [],          // терминальный статус
};
```

### Статусы

| Статус | Описание | Кто видит как активный | Цвет |
|--------|----------|----------------------|------|
| `DRAFT` | Черновик, менеджер заполняет | Менеджер отделения | Серый |
| `SUBMITTED` | Отправлен в ГО | Менеджер ГО | Синий |
| `IN_REVIEW` | Взят в работу менеджером ГО | Оба | Жёлтый |
| `APPROVED` | Одобрен | Оба | Зелёный |
| `RETURNED` | Возвращён на доработку (из IN_REVIEW или APPROVED) | Менеджер отделения | Красный |
| `COMPLETED` | Завершён | Уходит из активных | Зелёный (тёмный) |
| `CANCELLED` | Отменён (клиент передумал, дубль, ошибка) | Уходит из активных | Серый (перечёркнутый) |

---

## Структура страниц (UI/UX)

### Страницы MVP

```
/                        → Редирект на /dashboard
/login                   → Вход
/register                → Регистрация
/dashboard               → Главная: активные диспуты
/disputes/new            → Создание диспута (выбор шаблона → форма → предпросмотр PDF)
/disputes/[id]           → Карточка диспута (вкладки: timeline, документы)
/disputes/[id]/pdf       → Предпросмотр PDF inline (ровно то, что распечатается)
/admin/users             → Управление пользователями (админ)
/admin/templates         → Управление шаблонами (админ)
/admin/audit             → Аудит-лог (админ)
```

### UI/UX принципы

1. **Dashboard — только активные.** Завершённые и отменённые уходят в архив.
   Менеджер видит свои, ГО видит входящие. Фильтры и поиск.

2. **Sidebar с badges/счётчиками.** «Входящие (3)», «На доработке (1)».
   Менеджер ГО должен видеть что его ждёт, не заходя на страницу.

3. **Карточка диспута — вкладки:**
   - **Timeline** — вертикальная лента событий: кто создал, кто взял,
     комментарии, смена статуса. Всё прозрачно.
   - **Документы** — вложения: скан подписи, ответное письмо,
     сгенерированный PDF. Загрузка и скачивание.

4. **Создание — wizard.** Пошагово: выбор типа → заполнение формы →
   **предпросмотр PDF inline** (не формы, а готового PDF — менеджер видит
   ровно то, что распечатается) → отправка.

5. **Цветовая индикация статусов.** Серый — черновик, синий — отправлен,
   жёлтый — в работе, зелёный — одобрен, красный — возврат,
   серый перечёркнутый — отменён.

6. **Мобильная адаптивность.** Менеджеры в отделениях могут работать
   с планшетов.

---

## Схема БД (Prisma)

```prisma
model User {
  id            String          @id @default(cuid())
  email         String          @unique
  password      String          // argon2 hash, НИКОГДА plaintext
  name          String
  role          Role            @default(BRANCH_MANAGER)
  branch        String?
  disputes      Dispute[]       @relation("creator")
  assignments   Dispute[]       @relation("assignee")
  comments      Comment[]
  statusChanges StatusHistory[]
  auditLogs     AuditLog[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
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
                       // ВАЖНО: валидация через zod-схему на уровне API
  isActive    Boolean  @default(true)
  disputes    Dispute[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Dispute {
  id          String        @id @default(cuid())
  number      String        @unique // Формат: DSP-2026-000001
                                     // Генерация через PostgreSQL SEQUENCE
                                     // Человекочитаемый, сортируемый
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
  attachments Attachment[]
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
  CANCELLED
}

model StatusHistory {
  id         String         @id @default(cuid())
  disputeId  String
  dispute    Dispute        @relation(fields: [disputeId], references: [id])
  fromStatus DisputeStatus?
  toStatus   DisputeStatus
  userId     String
  user       User           @relation(fields: [userId], references: [id])
  comment    String?
  createdAt  DateTime       @default(now())
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

model Attachment {
  id        String   @id @default(cuid())
  filename  String   // Оригинальное имя файла
  path      String   // Путь к файлу в хранилище
  mimeType  String   // application/pdf, image/jpeg, etc.
  size      Int      // Размер в байтах
  disputeId String
  dispute   Dispute  @relation(fields: [disputeId], references: [id])
  uploadedBy String
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String   // LOGIN, LOGOUT, DOWNLOAD_PDF, UPDATE_FORM,
                     // STATUS_CHANGE, UPLOAD_ATTACHMENT, etc.
  entity    String?  // dispute, user, template
  entityId  String?  // ID сущности
  details   Json?    // Дополнительные данные (старое/новое значение)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  ipAddress String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([entityId])
  @@index([createdAt])
}
```

### Генерация номера диспута

```sql
-- PostgreSQL migration
CREATE SEQUENCE dispute_number_seq START 1;

-- При создании диспута:
-- DSP-{год}-{номер с нулями до 6 цифр}
-- Пример: DSP-2026-000001, DSP-2026-000042
```

Генерация через `services/dispute.service.ts`, не в API route.

---

## Структура проекта

```
disputekz/
├── docs/
│   └── ARCHITECTURE.md          # Этот файл
├── preview/                     # Standalone HTML для визуальной проверки
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
│   │   │       ├── templates/
│   │   │       └── audit/
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
│   ├── services/                # Бизнес-логика (НЕ в API routes!)
│   │   ├── dispute.service.ts   # Создание, смена статуса, генерация номера
│   │   ├── auth.service.ts      # Хеширование, проверка паролей
│   │   ├── pdf.service.ts       # Генерация PDF
│   │   ├── audit.service.ts     # Запись в аудит-лог
│   │   └── template.service.ts  # Валидация шаблонов
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client
│   │   ├── auth.ts              # NextAuth config
│   │   ├── state-machine.ts     # Допустимые переходы статусов
│   │   ├── validations.ts       # zod-схемы
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

### Принцип разделения слоёв

```
API Route / Server Action
    │
    ▼
  zod validation (lib/validations.ts)
    │
    ▼
  Service (services/*.service.ts)  ← бизнес-логика здесь
    │
    ▼
  Prisma (lib/prisma.ts)           ← только доступ к БД
    │
    ▼
  AuditLog                         ← запись действия
```

API routes — тонкие: принимают запрос, валидируют, вызывают сервис, отдают ответ.
Бизнес-логика (state machine, генерация номера, валидация переходов) живёт
в `services/`. Это позволяет:
- Переиспользовать логику между API routes и Server Actions
- Тестировать бизнес-логику изолированно
- Не превращать API routes в неподдерживаемую кашу при росте

---

## План реализации (поэтапно)

### Этап 1 — Фундамент
- [ ] Инициализация Next.js + TypeScript + Tailwind
- [ ] Настройка Prisma + PostgreSQL
- [ ] Базовая авторизация (NextAuth + argon2)
- [ ] Rate limiting middleware
- [ ] Layout: sidebar с badges, header, роутинг

### Этап 2 — Авторизация и роли
- [ ] Страница логина
- [ ] Страница регистрации
- [ ] Middleware для защиты роутов
- [ ] RBAC (проверка ролей)
- [ ] AuditLog: логин/логаут

### Этап 3 — Шаблоны
- [ ] Админ: CRUD шаблонов
- [ ] Конструктор полей формы (JSON + zod-валидация)
- [ ] Рендер формы по шаблону

### Этап 4 — Диспуты
- [ ] Создание диспута (wizard)
- [ ] Генерация номера (DSP-YYYY-NNNNNN)
- [ ] State machine для переходов статусов
- [ ] Генерация PDF (HTML → Puppeteer)
- [ ] Предпросмотр PDF inline перед отправкой
- [ ] Отправка (смена статуса)
- [ ] Карточка диспута: timeline + документы
- [ ] Загрузка вложений (Attachment)

### Этап 5 — Dashboard
- [ ] Список активных диспутов
- [ ] Фильтры по статусу
- [ ] Поиск
- [ ] Раздельные вью для ролей
- [ ] Sidebar badges со счётчиками

### Этап 6 — Безопасность и полировка
- [ ] CSRF protection на API routes
- [ ] Secure headers (CSP, HSTS, X-Frame-Options)
- [ ] Аудит-лог: скачивание PDF, изменение данных
- [ ] Мобильная адаптивность
- [ ] Уведомления (in-app)
- [ ] Архив завершённых / отменённых
- [ ] Тестирование

---

## Открытые вопросы (нужен ответ)

1. **Какой тип диспута берём для MVP?** (chargeback, возврат, мошенничество?)
2. **Физическая подпись или ЭЦП?** (для MVP скорее всего физическая — скан)
3. **Хостинг** — on-premise или облако для начала?
4. **Команда** — кто пишет код? Какой опыт со стеком?
