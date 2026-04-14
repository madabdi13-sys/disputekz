# DisputeKZ — Design System

Дизайн-направление: **B2B SaaS premium**, вдохновлено Attio и Ramp.
Цель — серьёзный, плотный, читаемый интерфейс банковского уровня
без AI-шных градиентов, эмодзи и glass-morphism.

---

## Принципы

1. **Плотность важнее воздуха.** Менеджер хочет видеть данные, а не скроллить. Таблицы плотные, карточки компактные, отступы выверенные.
2. **Высокий контраст.** Основной текст `zinc-900` (#18181b), почти чёрный. Никакого бледно-серого для важного.
3. **Один акцентный цвет.** Primary action — чёрный. Акцентные цвета — только на badge-статусах.
4. **Границы, а не тени.** Разделение через `1px solid` + `bg`. Тени — только на dropdowns и modals.
5. **Последовательная иконография.** Только Lucide, только 1.5px stroke, только обдуманные размеры.
6. **Типографика делает работу.** Иерархия через вес и размер шрифта, а не через цвет.
7. **Никаких градиентов, неона, glass-morphism, эмодзи в UI.**

---

## Цветовая палитра

### Нейтральные (база — Tailwind `zinc`)

```
zinc-50   #fafafa   фон страницы
zinc-100  #f4f4f5   фон карточек при hover, muted backgrounds
zinc-200  #e4e4e7   границы (default)
zinc-300  #d4d4d8   границы при hover, dividers
zinc-400  #a1a1aa   placeholder, disabled text
zinc-500  #71717a   secondary text, метаданные
zinc-600  #52525b   label text
zinc-700  #3f3f46   body text
zinc-900  #18181b   headings, primary text, primary button bg
```

### Акцент — чёрный

Primary-кнопки и активные состояния — `zinc-900`.
Hover — `zinc-800` (#27272a).
Это осознанный выбор: чёрный primary = максимально серьёзно,
вне трендов, не устаревает. Так делают Attio, Linear, Vercel.

### Статусы (только для badges)

| Статус      | fg          | bg         | border     |
|-------------|-------------|------------|------------|
| DRAFT       | zinc-700    | zinc-100   | zinc-200   |
| SUBMITTED   | blue-700    | blue-50    | blue-200   |
| IN_REVIEW   | amber-700   | amber-50   | amber-200  |
| APPROVED    | emerald-700 | emerald-50 | emerald-200|
| RETURNED    | orange-700  | orange-50  | orange-200 |
| COMPLETED   | emerald-800 | emerald-100| emerald-300|
| CANCELLED   | red-700     | red-50     | red-200    |

### Семантика

| Назначение     | Цвет              |
|----------------|-------------------|
| Link           | zinc-900 underline|
| Link hover     | zinc-700          |
| Error text     | red-600           |
| Success text   | emerald-700       |
| Warning text   | amber-700         |
| Focus ring     | zinc-900 (2px)    |

---

## Типографика

**Шрифт: Inter** (system fallback: `system-ui, -apple-system, sans-serif`)
**Mono: JetBrains Mono** — для номеров диспутов, БИН, номеров карт

### Scale

| Token        | Size | Line   | Weight | Tracking | Использование                        |
|--------------|------|--------|--------|----------|---------------------------------------|
| display      | 36px | 44px   | 600    | -0.02em  | Главный заголовок страницы (login, dashboard hero) |
| h1           | 28px | 36px   | 600    | -0.02em  | Заголовок раздела                    |
| h2           | 20px | 28px   | 600    | -0.01em  | Заголовок карточки                   |
| h3           | 16px | 24px   | 600    |  0       | Sub-heading                          |
| body-lg      | 15px | 22px   | 400    |  0       | Контент крупный                      |
| body         | 14px | 20px   | 400    |  0       | Дефолт                               |
| body-strong  | 14px | 20px   | 500    |  0       | Label, таблица header                |
| small        | 13px | 18px   | 400    |  0       | Метаданные, подсказки                |
| micro        | 11px | 16px   | 500    |  0.05em  | UPPERCASE section labels, badge text |
| mono         | 13px | 18px   | 500    |  0       | Номера, ID                           |

### Правила

- **Body — 14px**, не 16px. Это "B2B density".
- **Негативный tracking** на display и h1 — выглядит дороже.
- **Нет `font-weight: 900`** — максимум 600. Толстые шрифты выглядят дешёво.
- **Микро-текст для UPPERCASE labels** в sidebar, filters и т.д.

---

## Spacing

Scale Tailwind: `0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20`.
(т.е. 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px)

### Правила

- Внутри компонентов — `gap-2` или `gap-3` (8-12px)
- Между компонентами — `gap-4` или `gap-6` (16-24px)
- Между секциями — `gap-8` или `gap-12` (32-48px)
- Padding контейнера страницы — `px-8 py-6` (32/24px)

---

## Скругления

| Элемент                  | Radius  |
|--------------------------|---------|
| Input, button, badge     | 6px     |
| Card, modal, dropdown    | 8px     |
| Avatar (квадрат)         | 6px     |
| Avatar (круг)            | 50%     |
| Code block               | 6px     |

Никаких `rounded-full` для кнопок. Никаких `rounded-2xl` для карточек.
Умеренные скругления = серьёзно.

---

## Тени

Минимум. Почти всё через границы.

```
shadow-sm:    none (не используем)
shadow-md:    0 1px 2px 0 rgb(0 0 0 / 0.05)  — на hover карточек
shadow-lg:    0 4px 12px -2px rgb(0 0 0 / 0.08)  — dropdowns, popovers
shadow-xl:    0 20px 40px -12px rgb(0 0 0 / 0.2)  — modals, dialogs
```

---

## Границы

- **Дефолт**: `1px solid zinc-200`
- **Hover**: `1px solid zinc-300`
- **Focus**: `2px solid zinc-900` (ring, не border)
- **Error**: `1px solid red-400`

Никаких "двойных" или "штрихованных" границ. Только чистый solid.

---

## Иконки

**Библиотека: Lucide React** (`lucide-react`).
Устанавливается один раз, одна пачка, везде.

### Размеры

| Контекст                      | Size |
|-------------------------------|------|
| Внутри small-кнопок, badges   | 14px |
| Таблицы, inline               | 16px |
| Sidebar, стандартные кнопки   | 18px |
| Section headers               | 20px |
| Empty states, hero            | 32px |

### Толщина штриха

Всегда `strokeWidth={1.5}`. Не 2, не 1. Это дефолт Lucide — он выверен.

### Запрещено

- ❌ Эмодзи в UI (📊 💼 ✨ ⚡) — выглядит AI-шно и несерьёзно
- ❌ Иконки из разных библиотек в одном проекте
- ❌ Font Awesome, Material Icons
- ❌ Цветные/градиентные иконки
- ❌ Иконки больше 32px в интерфейсе (только hero)

---

## Компоненты (ключевые)

### Button

```
Primary:
  bg: zinc-900
  hover: zinc-800
  text: white
  height: 36px (h-9)
  padding: 0 14px
  radius: 6px
  font: 14px/500

Secondary:
  bg: white
  hover: zinc-50
  border: 1px solid zinc-200
  text: zinc-900
  height: 36px

Ghost:
  bg: transparent
  hover: zinc-100
  text: zinc-700

Destructive:
  bg: red-600
  hover: red-700
  text: white

Sizes:
  sm: h-8 (32px) / text-13
  md: h-9 (36px) / text-14   ← default
  lg: h-10 (40px) / text-14
  icon: h-9 w-9
```

**Правило:** на экране максимум ОДНА primary кнопка.
Всё остальное — secondary или ghost.

### Input

```
height: 36px
padding: 0 12px
border: 1px solid zinc-200
radius: 6px
bg: white
font: 14px
placeholder: zinc-400
focus: ring-2 ring-zinc-900, border zinc-900
error: border red-400, ring red-400
```

### Card

```
bg: white
border: 1px solid zinc-200
radius: 8px
padding: 24px (для контента), 20px (для плотных)
no shadow by default
hover: border zinc-300 (для интерактивных)
```

### Badge (Status)

```
padding: 2px 8px
radius: 6px (не full!)
font: 12px/500
border: 1px solid
inline-flex items-center gap-1.5

С индикатором:
[● Label]  ← dot 6px + текст
```

### Table

```
header:
  bg: zinc-50
  border-bottom: 1px solid zinc-200
  text: 12px/500 uppercase tracking-wide zinc-500
  padding: 10px 16px

row:
  border-bottom: 1px solid zinc-100
  hover: bg zinc-50
  padding: 14px 16px
  font: 14px

dense variant:
  padding: 10px 16px
  font: 13px
```

---

## Логотип

### Wordmark

**"disputekz"** — всё строчными, тесный tracking (-0.03em), Inter weight 600.
Всё строчными = современно, минималистично. Как linear, vercel, attio.

### Mark (опционально, рядом с wordmark)

Абстрактная геометрическая фигура: **два пересекающихся наклонных квадрата**.
Это метафора "диспута" — два объекта в противостоянии, но встречаются в центре.

```
Размер: 16×16px (inline с текстом)
Цвет: zinc-900
Stroke: 1.5px
Fill: white (outer square) / zinc-900 (inner square)
```

Вариант для header:
```
[◇◆] disputekz
```

Где `◇` — outlined square, `◆` — filled square, повёрнуты на 45°,
сдвинуты друг относительно друга.

### Применение

- **Header / Sidebar**: mark + wordmark, 14-16px
- **Favicon**: только mark, без текста
- **Login / splash**: mark + wordmark, 28px
- **Documents (PDF footer)**: mark + wordmark, 10px

---

## Анимации

Минимум. Только там, где это помогает:

```
Transition duration: 150ms
Transition easing: cubic-bezier(0.4, 0, 0.2, 1)

Где используем:
- button hover (bg color)
- input focus (border, ring)
- dropdown open/close (opacity + scale 0.95→1)
- modal (opacity + scale)

Где НЕ используем:
- bounce, spring, elastic
- >300ms длительность
- Анимации при загрузке страницы
- Parallax, auto-scroll
```

---

## Empty States

Каждый список показывает понятное пустое состояние:

```
┌──────────────────────────────────────┐
│                                      │
│           [icon 32px]                │
│                                      │
│     Заголовок состояния (h3)         │
│     Короткое описание (body-lg       │
│     в zinc-500)                      │
│                                      │
│         [Primary action]             │
│                                      │
└──────────────────────────────────────┘
```

Пример: "У вас пока нет диспутов. Создайте первый, чтобы начать работу."
+ кнопка [Создать диспут].

---

## Доступность

- Все интерактивные элементы фокусируемы клавиатурой
- Focus ring виден всегда: `ring-2 ring-zinc-900 ring-offset-2`
- Контраст текста ≥ 4.5:1 (WCAG AA)
- Все иконки в кнопках имеют `aria-label` или сопровождаются текстом
- Форма: связь `<label for>` + `<input id>`, ошибки через `aria-describedby`

---

## Референсы

- [Attio](https://attio.com) — плотность, таблицы, command palette
- [Ramp](https://ramp.com) — премиум типографика, warmth neutrals
- [Linear](https://linear.app) — эталон B2B SaaS минимализма
- [Vercel Dashboard](https://vercel.com) — чистота, zinc-палитра
- [shadcn/ui](https://ui.shadcn.com) — компонентная база
