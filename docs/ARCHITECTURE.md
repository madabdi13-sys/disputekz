# DisputeKZ — Архитектура системы (v0.2)

## Концепция

SaaS-платформа для управления диспутами в банках Казахстана.
Работает по модели Documentolog — банк получает ссылку, регистрируется,
подключает сотрудников и работает в браузере. Платформа заменяет ручной
учёт в Excel на единый интерфейс с маршрутизацией, шаблонами документов
и отслеживанием статусов.

**Бизнес-модель:** фиксированная подписка за банк в месяц.

---

## MVP Scope (v0.1)

| Параметр              | Значение                                          |
|-----------------------|---------------------------------------------------|
| Банков                | 1+ (мультитенант с первого дня)                   |
| Направление диспута   | Chargeback по картам (Visa/Mastercard)            |
| Пользователи          | Менеджер отделения, Менеджер ГО, Админ банка, Суперадмин |
| Шаблоны               | Банк загружает свои                               |
| Маршрут               | Фиксированный: Отделение → ГО → Ответ            |
| Подписка              | Фикс/месяц, ручное управление                    |

### Что входит в MVP

- [x] Мультитенантность (изоляция данных между банками)
- [x] Регистрация организации (банка) через суперадмина
- [x] Регистрация сотрудников через заявку с модерацией админом банка
- [x] Роли: суперадмин, админ банка, менеджер отделения, менеджер ГО
- [x] Управление отделениями (филиалами)
- [x] Создание диспута по шаблону (wizard-форма)
- [x] Генерация PDF из заполненной формы
- [x] Загрузка шаблонов банком
- [x] Загрузка вложений (скан подписанного документа)
- [x] Маршрутизация: отделение → ГО → ответ
- [x] State machine статусов с валидацией переходов
- [x] Дашборд с активными диспутами (раздельный по ролям)
- [x] Деактивация сотрудников (не удаление)
- [x] Аудит-лог действий пользователей
- [x] In-app уведомления (badge-счётчики)

### Что НЕ входит в MVP

- Интеграция с АБС/процессингом
- ЭЦП (НУЦ РК)
- SSO/LDAP
- SMS/Push уведомления
- Настраиваемые маршруты (кастомный workflow engine)
- SLA и автоэскалации
- Интеграция с кадровой системой банка
- Автоматическая биллинг-система (Stripe и т.д.)
- Аналитика и отчёты

---

## Технологический стек

```
┌─────────────────────────────────────────────┐
│                Frontend                      │
│          Next.js 14 (App Router)            │
│          Tailwind CSS + shadcn/ui           │
│          TypeScript                         │
└──────────────┬──────────────────────────────┘
               │ REST API / Server Actions
┌──────────────▼──────────────────────────────┐
│                Backend                       │
│          Next.js API Routes                 │
│          Prisma ORM                         │
│          NextAuth.js (auth)                 │
│          Zod (валидация)                    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│                Database                      │
│          PostgreSQL                          │
│          (JSON-поля для форм шаблонов)      │
└─────────────────────────────────────────────┘

PDF:        @react-pdf/renderer
Файлы:      локальное хранилище / S3-совместимое (MinIO)
Хостинг:    Казахстанский ЦОД (PS Cloud / Kazteleport)
Деплой:     Docker + Docker Compose
```

### Почему этот стек

| Выбор                 | Причина                                                    |
|-----------------------|------------------------------------------------------------|
| **Next.js**           | Fullstack в одном проекте, SSR, API routes — один разработчик = один проект |
| **Tailwind + shadcn/ui** | Строгий банковский UI из коробки, кастомизируется        |
| **Prisma**            | Type-safe ORM, миграции, удобная работа с PostgreSQL       |
| **PostgreSQL**        | Надёжная СУБД, JSON-поля для гибких форм шаблонов          |
| **NextAuth**          | Простая авторизация с ролями, расширяется до SSO           |
| **Zod**               | Валидация форм, API-запросов и JSON-полей шаблонов         |
| **@react-pdf/renderer** | Генерация PDF из React-компонентов                      |
| **Docker**            | Унифицированный деплой на любой инфраструктуре             |

---

## Роли и права

### Уровни ролей

```
Платформа (DisputeKZ)
  └── SUPER_ADMIN — ты, управляешь всей платформой

Организация (Банк)
  ├── ORG_ADMIN       — админ банка, управляет пользователями и шаблонами
  ├── HQ_MANAGER      — менеджер головного офиса, обрабатывает диспуты
  └── BRANCH_MANAGER  — менеджер отделения, создаёт диспуты
```

### Матрица прав

| Действие                        | SUPER_ADMIN | ORG_ADMIN | BRANCH_MANAGER | HQ_MANAGER |
|---------------------------------|:-----------:|:---------:|:--------------:|:----------:|
| Создавать организации           | ✅          | ❌        | ❌             | ❌         |
| Управлять подписками            | ✅          | ❌        | ❌             | ❌         |
| Видеть все организации          | ✅          | ❌        | ❌             | ❌         |
| Одобрять заявки на регистрацию  | ❌          | ✅        | ❌             | ❌         |
| Управлять пользователями банка  | ❌          | ✅        | ❌             | ❌         |
| Управлять отделениями           | ❌          | ✅        | ❌             | ❌         |
| Управлять шаблонами банка       | ❌          | ✅        | ❌             | ❌         |
| Создать диспут                  | ❌          | ❌        | ✅             | ❌         |
| Заполнить шаблон / скачать PDF  | ❌          | ❌        | ✅             | ❌         |
| Загрузить вложение              | ❌          | ❌        | ✅             | ✅         |
| Видеть свои диспуты             | ❌          | ❌        | ✅             | ❌         |
| Видеть входящие диспуты         | ❌          | ❌        | ❌             | ✅         |
| Взять в работу                  | ❌          | ❌        | ❌             | ✅         |
| Отправить ответ / вернуть       | ❌          | ❌        | ❌             | ✅         |
| Видеть все диспуты банка        | ❌          | ✅        | ❌             | ❌         |
| Видеть аудит-лог банка          | ❌          | ✅        | ❌             | ❌         |

---

## Регистрация и авторизация

### Flow регистрации организации (банка)

```
1. Банк связывается с тобой (email/звонок)
2. SUPER_ADMIN создаёт Organization в системе
3. SUPER_ADMIN создаёт первого ORG_ADMIN для этого банка
4. ORG_ADMIN получает письмо с данными для входа
5. ORG_ADMIN заходит, создаёт отделения, ждёт заявки от сотрудников
```

### Flow регистрации сотрудника

```
1. Сотрудник заходит на сайт → «Регистрация»
2. Выбирает банк из списка (видит только названия)
3. Заполняет форму:
   - ФИО
   - Роль (менеджер отделения / менеджер ГО)
   - Отделение (из списка, если менеджер отделения)
   - Телефон
   - Email
   - Пароль
   - Номер приказа о приёме на работу
4. Отправляет заявку → статус «Ожидает подтверждения»
5. Видит экран: «Ваша заявка отправлена администратору. Ожидайте»
6. ORG_ADMIN получает уведомление → проверяет данные и номер приказа
7. ORG_ADMIN одобряет или отклоняет заявку
8. Сотрудник получает email → может войти (или отказ с причиной)
```

### Flow увольнения сотрудника (MVP)

```
1. Банк уведомляет ORG_ADMIN (вне системы)
2. ORG_ADMIN заходит в панель → находит сотрудника → деактивирует
3. Сотрудник не может войти, но все его данные сохранены
```

> **Важно:** не удалять, а деактивировать (`isActive: false`).
> У сотрудника есть диспуты, комментарии, аудит-лог — удаление разрушит связи.

---

## Статусы диспута (State Machine)

```
                                    ┌──────────────────────┐
                                    │                      │
  [DRAFT] ──создан──▶ [SUBMITTED]   │                      │
                          │         │                      │
                     отправлен в ГО │                      │
                          │         │                      │
                          ▼         │                      │
                    [IN_REVIEW]     │                      │
                    │    │    │     │                      │
               одобрен  возврат  отмена                    │
                 │       │       │                         │
                 ▼       ▼       ▼                         │
            [APPROVED] [RETURNED] [CANCELLED]              │
                 │       │                                 │
            исполнен  доработка                            │
                 │       │                                 │
                 ▼       └────────── повторно ─────────────┘
            [COMPLETED]
```

### Допустимые переходы (state-machine.ts)

| Из            | В             | Кто может                | Действие                     |
|---------------|---------------|--------------------------|------------------------------|
| `DRAFT`       | `SUBMITTED`   | BRANCH_MANAGER           | Отправить на рассмотрение    |
| `DRAFT`       | `CANCELLED`   | BRANCH_MANAGER           | Отменить черновик            |
| `SUBMITTED`   | `IN_REVIEW`   | HQ_MANAGER               | Взять в работу               |
| `SUBMITTED`   | `CANCELLED`   | BRANCH_MANAGER           | Отменить до взятия в работу  |
| `IN_REVIEW`   | `APPROVED`    | HQ_MANAGER               | Одобрить                     |
| `IN_REVIEW`   | `RETURNED`    | HQ_MANAGER               | Вернуть на доработку         |
| `IN_REVIEW`   | `CANCELLED`   | HQ_MANAGER               | Отменить (ошибка, дубль)     |
| `RETURNED`    | `SUBMITTED`   | BRANCH_MANAGER           | Отправить повторно           |
| `RETURNED`    | `CANCELLED`   | BRANCH_MANAGER           | Отменить                     |
| `APPROVED`    | `COMPLETED`   | HQ_MANAGER               | Исполнен                     |

### Видимость статусов

| Статус       | Описание                      | Активен для              |
|--------------|-------------------------------|--------------------------|
| `DRAFT`      | Черновик                      | Менеджер отделения       |
| `SUBMITTED`  | Отправлен в ГО                | Менеджер ГО (входящие)   |
| `IN_REVIEW`  | В работе у менеджера ГО       | Оба                      |
| `APPROVED`   | Одобрен, ждёт исполнения      | Оба                      |
| `RETURNED`   | Возвращён на доработку        | Менеджер отделения       |
| `COMPLETED`  | Завершён                      | Уходит в архив           |
| `CANCELLED`  | Отменён                       | Уходит в архив           |

---

## Схема БД (Prisma)

```prisma
// ============================================================
// Организация (банк) — корень мультитенантности
// ============================================================

model Organization {
  id           String         @id @default(cuid())
  name         String         // Название банка
  bin          String?        @unique // БИН организации
  isActive     Boolean        @default(true)
  subscription Subscription?
  branches     Branch[]
  users        User[]
  templates    Template[]
  disputes     Dispute[]
  auditLogs    AuditLog[]
  registrationRequests RegistrationRequest[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

// ============================================================
// Подписка
// ============================================================

model Subscription {
  id             String       @id @default(cuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id])
  plan           String       @default("basic") // На будущее
  isActive       Boolean      @default(true)
  startsAt       DateTime
  expiresAt      DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// ============================================================
// Отделение (филиал)
// ============================================================

model Branch {
  id             String       @id @default(cuid())
  name           String       // «Отделение №5, ул. Абая»
  code           String?      // Внутренний код филиала
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  users          User[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([organizationId, code])
}

// ============================================================
// Пользователь
// ============================================================

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  password       String       // bcrypt hash
  name           String       // ФИО
  phone          String?
  role           Role
  isActive       Boolean      @default(true)
  organizationId String?      // null для SUPER_ADMIN
  organization   Organization? @relation(fields: [organizationId], references: [id])
  branchId       String?      // null для ORG_ADMIN и HQ_MANAGER
  branch         Branch?      @relation(fields: [branchId], references: [id])
  orderNumber    String?      // Номер приказа о приёме
  disputes       Dispute[]    @relation("creator")
  assignments    Dispute[]    @relation("assignee")
  comments       Comment[]
  statusChanges  StatusHistory[]
  auditLogs      AuditLog[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

enum Role {
  SUPER_ADMIN
  ORG_ADMIN
  HQ_MANAGER
  BRANCH_MANAGER
}

// ============================================================
// Заявка на регистрацию
// ============================================================

model RegistrationRequest {
  id             String              @id @default(cuid())
  email          String
  name           String
  phone          String?
  password       String              // bcrypt hash (хранится до одобрения)
  role           Role                // Запрашиваемая роль
  branchId       String?             // Если BRANCH_MANAGER
  orderNumber    String              // Номер приказа о приёме
  organizationId String
  organization   Organization        @relation(fields: [organizationId], references: [id])
  status         RegistrationStatus  @default(PENDING)
  reviewedById   String?             // Кто одобрил/отклонил
  rejectionReason String?
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
}

enum RegistrationStatus {
  PENDING
  APPROVED
  REJECTED
}

// ============================================================
// Шаблон диспута
// ============================================================

model Template {
  id             String       @id @default(cuid())
  name           String       // «Заявление на chargeback»
  description    String?
  fields         Json         // Массив полей: [{name, type, label, required, options?}]
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  isActive       Boolean      @default(true)
  disputes       Dispute[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// ============================================================
// Диспут
// ============================================================

model Dispute {
  id             String        @id @default(cuid())
  number         String        @unique // DSP-2026-000001 (sequence)
  status         DisputeStatus @default(DRAFT)
  templateId     String
  template       Template      @relation(fields: [templateId], references: [id])
  formData       Json          // Заполненные данные формы
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id])
  creatorId      String
  creator        User          @relation("creator", fields: [creatorId], references: [id])
  assigneeId     String?
  assignee       User?         @relation("assignee", fields: [assigneeId], references: [id])
  comments       Comment[]
  history        StatusHistory[]
  attachments    Attachment[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([organizationId, status])
  @@index([creatorId])
  @@index([assigneeId])
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

// ============================================================
// История статусов
// ============================================================

model StatusHistory {
  id         String         @id @default(cuid())
  disputeId  String
  dispute    Dispute        @relation(fields: [disputeId], references: [id])
  fromStatus DisputeStatus?
  toStatus   DisputeStatus
  userId     String
  user       User           @relation(fields: [userId], references: [id])
  comment    String?        // Причина возврата, комментарий при смене
  createdAt  DateTime       @default(now())
}

// ============================================================
// Комментарии
// ============================================================

model Comment {
  id        String   @id @default(cuid())
  text      String
  disputeId String
  dispute   Dispute  @relation(fields: [disputeId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

// ============================================================
// Вложения (сканы подписанных документов и т.д.)
// ============================================================

model Attachment {
  id        String   @id @default(cuid())
  filename  String   // Оригинальное имя файла
  path      String   // Путь в хранилище
  mimeType  String   // application/pdf, image/jpeg и т.д.
  size      Int      // Размер в байтах
  disputeId String
  dispute   Dispute  @relation(fields: [disputeId], references: [id])
  userId    String   // Кто загрузил
  createdAt DateTime @default(now())
}

// ============================================================
// Аудит-лог (все действия пользователей)
// ============================================================

model AuditLog {
  id             String       @id @default(cuid())
  action         String       // LOGIN, LOGOUT, DISPUTE_CREATED, PDF_DOWNLOADED, STATUS_CHANGED...
  entity         String?      // dispute, template, user...
  entityId       String?      // ID сущности
  details        Json?        // Дополнительные данные
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  ipAddress      String?
  createdAt      DateTime     @default(now())

  @@index([organizationId, createdAt])
  @@index([userId])
}
```

### Генерация номера диспута

Формат: `DSP-{YYYY}-{SEQUENCE}` — например `DSP-2026-000001`.

```sql
-- PostgreSQL sequence (создаётся в миграции)
CREATE SEQUENCE dispute_number_seq START 1;

-- При создании диспута
SELECT 'DSP-' || EXTRACT(YEAR FROM NOW()) || '-' ||
       LPAD(nextval('dispute_number_seq')::text, 6, '0');
```

---

## Структура страниц (UI/UX)

### Карта страниц

```
/                              → Лендинг (описание платформы)
/login                         → Вход
/register                      → Заявка на регистрацию (выбор банка → форма)
/pending                       → «Заявка на рассмотрении» (после регистрации)

/dashboard                     → Главная: активные диспуты (по роли)

/disputes/new                  → Создание диспута (wizard)
/disputes/[id]                 → Карточка диспута (статус, timeline, документы, вложения)
/disputes/[id]/pdf             → Предпросмотр и скачивание PDF
/disputes/archive              → Архив завершённых/отменённых

/admin/requests                → Заявки на регистрацию (ORG_ADMIN)
/admin/users                   → Управление пользователями банка (ORG_ADMIN)
/admin/branches                → Управление отделениями (ORG_ADMIN)
/admin/templates               → Управление шаблонами диспутов (ORG_ADMIN)
/admin/audit                   → Аудит-лог (ORG_ADMIN)

/super/organizations           → Управление банками (SUPER_ADMIN)
/super/organizations/[id]      → Карточка банка (SUPER_ADMIN)
/super/subscriptions           → Управление подписками (SUPER_ADMIN)
```

### UI/UX принципы

1. **Dashboard — только активные.**
   Завершённые и отменённые уходят в архив.
   BRANCH_MANAGER видит свои диспуты. HQ_MANAGER видит входящие.
   ORG_ADMIN видит обзор по всему банку. Фильтры и поиск.

2. **Badge-счётчики в sidebar.**
   «Входящие (3)», «На доработке (1)», «Заявки на доступ (2)».
   Менеджер ГО видит, что его ждёт, не заходя на страницу.

3. **Карточка диспута — timeline + вкладки.**
   Вертикальная лента событий: кто создал, кто взял, комментарии,
   смена статуса. Вкладка «Документы» для вложений. Всё прозрачно.

4. **Создание — wizard (пошагово).**
   Шаг 1: выбор шаблона → Шаг 2: заполнение формы →
   Шаг 3: предпросмотр PDF → Шаг 4: отправка.
   Не перегружаем одну страницу.

5. **Предпросмотр PDF inline.**
   Менеджер должен увидеть ровно то, что распечатается.
   Не форму, а готовый PDF в браузере.

6. **Цветовая индикация статусов.**
   - Серый — черновик (DRAFT)
   - Синий — отправлен (SUBMITTED)
   - Жёлтый — в работе (IN_REVIEW)
   - Зелёный — одобрен (APPROVED)
   - Оранжевый — возврат (RETURNED)
   - Зелёный яркий — завершён (COMPLETED)
   - Красный — отменён (CANCELLED)

7. **Мобильная адаптивность.**
   Менеджеры в отделениях могут работать с планшетов.

8. **Пустые состояния (empty states).**
   Каждый список показывает понятное сообщение и действие,
   если данных нет: «У вас пока нет диспутов. Создать первый?»

---

## Middleware: Tenant Isolation

Критически важный слой — автоматическая фильтрация по `organizationId`.

```typescript
// lib/tenant.ts — пример middleware

export async function withTenant<T>(
  userId: string,
  query: (organizationId: string) => Promise<T>
): Promise<T> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true, isActive: true }
  });

  if (!user || !user.isActive) throw new Error("Access denied");
  if (user.role === "SUPER_ADMIN") {
    // Суперадмин — доступ ко всем данным
    return query("*");
  }
  if (!user.organizationId) throw new Error("No organization");

  return query(user.organizationId);
}
```

> **Правило:** каждый запрос к БД (кроме суперадмина) ОБЯЗАН содержать
> `WHERE organizationId = ...`. Забыть один раз = утечка данных.

---

## State Machine (lib/state-machine.ts)

```typescript
// Допустимые переходы статусов
const TRANSITIONS: Record<DisputeStatus, {
  to: DisputeStatus;
  roles: Role[];
}[]> = {
  DRAFT: [
    { to: "SUBMITTED", roles: ["BRANCH_MANAGER"] },
    { to: "CANCELLED", roles: ["BRANCH_MANAGER"] },
  ],
  SUBMITTED: [
    { to: "IN_REVIEW", roles: ["HQ_MANAGER"] },
    { to: "CANCELLED", roles: ["BRANCH_MANAGER"] },
  ],
  IN_REVIEW: [
    { to: "APPROVED", roles: ["HQ_MANAGER"] },
    { to: "RETURNED", roles: ["HQ_MANAGER"] },
    { to: "CANCELLED", roles: ["HQ_MANAGER"] },
  ],
  RETURNED: [
    { to: "SUBMITTED", roles: ["BRANCH_MANAGER"] },
    { to: "CANCELLED", roles: ["BRANCH_MANAGER"] },
  ],
  APPROVED: [
    { to: "COMPLETED", roles: ["HQ_MANAGER"] },
  ],
  COMPLETED: [],  // Терминальный статус
  CANCELLED: [],  // Терминальный статус
};

export function canTransition(
  from: DisputeStatus,
  to: DisputeStatus,
  role: Role
): boolean {
  return TRANSITIONS[from]?.some(
    t => t.to === to && t.roles.includes(role)
  ) ?? false;
}
```

---

## Структура проекта

```
disputekz/
├── docs/
│   └── ARCHITECTURE.md              # Этот файл
├── preview/                         # Standalone HTML для визуальной проверки
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (public)/                # Публичные страницы
│   │   │   ├── page.tsx             # Лендинг
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── pending/
│   │   ├── (dashboard)/             # Защищённые страницы
│   │   │   ├── layout.tsx           # Sidebar + Header
│   │   │   ├── dashboard/
│   │   │   ├── disputes/
│   │   │   │   ├── new/
│   │   │   │   ├── archive/
│   │   │   │   └── [id]/
│   │   │   │       └── pdf/
│   │   │   └── admin/
│   │   │       ├── requests/
│   │   │       ├── users/
│   │   │       ├── branches/
│   │   │       ├── templates/
│   │   │       └── audit/
│   │   ├── (super)/                 # Суперадмин
│   │   │   └── super/
│   │   │       ├── organizations/
│   │   │       └── subscriptions/
│   │   └── api/
│   │       ├── auth/
│   │       ├── disputes/
│   │       ├── templates/
│   │       ├── users/
│   │       ├── branches/
│   │       ├── registration-requests/
│   │       ├── organizations/
│   │       ├── attachments/
│   │       └── audit/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui компоненты
│   │   ├── disputes/                # Карточка, wizard, timeline
│   │   ├── templates/               # Конструктор/рендер шаблонов
│   │   ├── admin/                   # Панель админа
│   │   └── layout/                  # Header, Sidebar, Badge
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client
│   │   ├── auth.ts                  # NextAuth config
│   │   ├── tenant.ts                # Tenant isolation middleware
│   │   ├── state-machine.ts         # Допустимые переходы статусов
│   │   ├── pdf.ts                   # PDF generation
│   │   ├── audit.ts                 # Логирование действий
│   │   ├── validations.ts           # Zod-схемы
│   │   └── utils.ts
│   ├── services/                    # Бизнес-логика
│   │   ├── dispute.service.ts
│   │   ├── template.service.ts
│   │   ├── user.service.ts
│   │   ├── registration.service.ts
│   │   └── organization.service.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                      # Начальные данные: суперадмин
├── public/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

### Архитектурные слои

```
┌─────────────────┐
│   Pages / UI    │  → Рендеринг, формы, навигация
├─────────────────┤
│  API Routes     │  → Валидация (Zod), auth-проверки
├─────────────────┤
│   Services      │  → Бизнес-логика, state machine, tenant isolation
├─────────────────┤
│  Prisma ORM     │  → Доступ к БД
├─────────────────┤
│  PostgreSQL     │  → Хранение данных
└─────────────────┘
```

> **Правило:** API routes не содержат бизнес-логику.
> Они валидируют вход (Zod), проверяют auth, вызывают service и возвращают ответ.
> Бизнес-логика живёт в `services/`.

---

## Безопасность (MVP минимум)

| Мера                         | Реализация                               |
|------------------------------|------------------------------------------|
| Хеширование паролей          | bcrypt (12 rounds)                       |
| Rate limiting на /login      | next-rate-limit или middleware            |
| CSRF protection              | Встроено в Next.js Server Actions        |
| HTTPS                        | Обязательно (nginx/traefik proxy)        |
| Tenant isolation             | organizationId в каждом запросе          |
| Аудит-лог                    | Все критичные действия                   |
| Деактивация vs удаление      | Soft-delete через isActive               |
| Валидация JSON-шаблонов      | Zod-схема на уровне API                  |
| Файлы: проверка типа         | Whitelist MIME types (PDF, JPG, PNG)     |
| Файлы: ограничение размера   | Максимум 10 MB на файл                  |

---

## Деплой

### Docker Compose (production)

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/disputekz
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: https://disputekz.kz
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: disputekz
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: unless-stopped

volumes:
  pgdata:
```

### Хостинг

Казахстанский ЦОД обязателен (персональные данные клиентов банков).
Варианты: PS Cloud, Kazteleport, VPS в Astana Hub.
Для разработки/демо — любой VPS с Docker.

---

## План реализации (поэтапно)

### Этап 1 — Фундамент (1-2 дня)
- [ ] Инициализация Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Настройка Prisma + PostgreSQL + Docker Compose
- [ ] Prisma-схема + миграции + seed (суперадмин)
- [ ] Базовый layout: sidebar, header

### Этап 2 — Авторизация (2-3 дня)
- [ ] NextAuth: email/пароль
- [ ] Страница логина
- [ ] Страница регистрации (заявка с выбором банка)
- [ ] Страница «ожидание одобрения»
- [ ] Middleware для защиты роутов
- [ ] RBAC middleware (проверка ролей)
- [ ] Tenant isolation middleware

### Этап 3 — Админ банка (2-3 дня)
- [ ] Панель одобрения заявок на регистрацию
- [ ] CRUD пользователей (деактивация)
- [ ] CRUD отделений
- [ ] Badge-счётчики в sidebar

### Этап 4 — Шаблоны (2-3 дня)
- [ ] CRUD шаблонов (ORG_ADMIN)
- [ ] Конструктор полей формы (JSON + Zod-валидация)
- [ ] Рендер формы по шаблону

### Этап 5 — Диспуты (3-4 дня)
- [ ] Wizard создания диспута
- [ ] State machine (валидация переходов)
- [ ] Генерация PDF
- [ ] Загрузка вложений
- [ ] Карточка диспута с timeline
- [ ] Комментарии

### Этап 6 — Dashboard (2-3 дня)
- [ ] Список активных диспутов (по роли)
- [ ] Фильтры по статусу
- [ ] Поиск
- [ ] Архив завершённых/отменённых

### Этап 7 — Суперадмин (1-2 дня)
- [ ] Управление организациями
- [ ] Управление подписками
- [ ] Создание ORG_ADMIN для банка

### Этап 8 — Полировка (2-3 дня)
- [ ] Аудит-лог (запись + просмотр)
- [ ] Мобильная адаптивность
- [ ] Empty states
- [ ] Email-уведомления (одобрение/отказ заявки)
- [ ] Тестирование

**Итого MVP: ~15-20 рабочих дней для соло-разработчика**

---

## Бэклог (после MVP)

| Фича                          | Приоритет | Описание                                          |
|-------------------------------|-----------|---------------------------------------------------|
| SSO/LDAP                      | Высокий   | Интеграция с AD банка                             |
| ЭЦП (НУЦ РК)                 | Высокий   | Электронная подпись вместо бумажной               |
| Настраиваемые маршруты        | Высокий   | Кастомный workflow engine                         |
| SLA и эскалации               | Высокий   | Автоматические дедлайны по Visa/MC правилам       |
| Интеграция с АБС              | Средний   | Подтягивать данные по транзакциям                 |
| SMS/Push уведомления           | Средний   | Оповещения о смене статуса                       |
| Аналитика и отчёты             | Средний   | Дашборд с метриками по диспутам                  |
| Интеграция с кадровой системой | Низкий    | Автоматическая деактивация при увольнении         |
| Автоматический биллинг         | Низкий    | Stripe/Kaspi Pay для подписок                    |
| Мобильное приложение           | Низкий    | React Native / PWA                               |

---

## Открытые вопросы

1. **Какой конкретный шаблон chargeback берём первым?**
   (Visa Dispute Resolution / Mastercard Chargeback — у каждой МПС свой формат)
2. **Хостинг для разработки** — VPS или локально через Docker?
3. **Домен** — disputekz.kz? dispute.kz?
