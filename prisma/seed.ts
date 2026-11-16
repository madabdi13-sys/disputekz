/**
 * Начальные данные.
 *   npm run db:seed
 *
 * Всегда: суперадмин из SEED_SUPERADMIN_* (.env).
 * При SEED_DEMO=1 (не в production): «Демо-банк» с отделениями, сотрудниками
 * всех ролей, шаблоном chargeback и набором диспутов в разных статусах.
 *
 * Скрипт идемпотентный: повторный запуск ничего не дублирует.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type Channel,
  type DisputeOutcome,
  type DisputeStatus,
  type Role,
} from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv("DATABASE_URL") }),
});

const BCRYPT_ROUNDS = 12;
const DEMO_PASSWORD = "demo12345";
const DAY = 86_400_000;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Переменная ${name} не задана (см. .env.example)`);
  return value;
}

async function seedSuperAdmin() {
  const email = requireEnv("SEED_SUPERADMIN_EMAIL").toLowerCase();
  const password = requireEnv("SEED_SUPERADMIN_PASSWORD");
  const name = process.env.SEED_SUPERADMIN_NAME || "Администратор платформы";

  if (process.env.NODE_ENV === "production" && password === "change-me-please") {
    throw new Error("Задайте SEED_SUPERADMIN_PASSWORD перед запуском в production");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`• Суперадмин ${email} уже есть`);
    return;
  }
  await prisma.user.create({
    data: {
      email,
      name,
      role: "SUPER_ADMIN",
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
    },
  });
  console.log(`✓ Суперадмин ${email} создан`);
}

// ------------------------------------------------------------
// Демо-данные
// ------------------------------------------------------------

const CHARGEBACK_FIELDS = [
  { name: "cardMask", type: "text", label: "Номер карты (маска)", required: true },
  { name: "clientName", type: "text", label: "ФИО клиента", required: true },
  { name: "clientIin", type: "text", label: "ИИН клиента", required: true },
  { name: "transactionDate", type: "date", label: "Дата операции", required: true },
  { name: "amount", type: "number", label: "Сумма операции", required: true },
  { name: "merchant", type: "text", label: "Торговая точка", required: true },
  {
    name: "reasonCode",
    type: "select",
    label: "Reason code",
    required: true,
    options: ["10.4 — Fraud", "13.1 — Merchandise not received", "13.3 — Not as described", "12.6 — Duplicate processing"],
  },
  { name: "description", type: "textarea", label: "Описание претензии", required: true },
];

type DemoDispute = {
  daysAgo: number;
  channel: Channel;
  client: string;
  amount: number;
  status: DisputeStatus;
  creator: "branch1" | "branch2";
  assignee?: "hq";
  deadlineInDays?: number;
  reasonCode?: string;
  outcome?: DisputeOutcome;
};

// Имена клиентов вымышленные.
const DEMO_DISPUTES: DemoDispute[] = [
  { daysAgo: 2, channel: "POS", client: "Абенов Р.Н.", amount: 1_240_000, status: "IN_REVIEW", creator: "branch1", assignee: "hq", deadlineInDays: -1 },
  { daysAgo: 5, channel: "INTERNAL", client: "Нурланов С.М.", amount: 3_150_000, status: "IN_REVIEW", creator: "branch2", assignee: "hq", deadlineInDays: 2 },
  { daysAgo: 7, channel: "MASTERCARD", client: "Тулегенов К.Б.", amount: 72_400, status: "SUBMITTED", creator: "branch1", deadlineInDays: -2, reasonCode: "4853" },
  { daysAgo: 9, channel: "VISA", client: "Омаров А.Б.", amount: 412_000, status: "IN_REVIEW", creator: "branch1", assignee: "hq", deadlineInDays: 5, reasonCode: "13.1" },
  { daysAgo: 12, channel: "MASTERCARD", client: "Серикова Г.А.", amount: 178_900, status: "SUBMITTED", creator: "branch2", deadlineInDays: 6, reasonCode: "4837" },
  { daysAgo: 14, channel: "ATM", client: "Байжанов Е.К.", amount: 28_500, status: "RETURNED", creator: "branch2", assignee: "hq", deadlineInDays: 7 },
  { daysAgo: 16, channel: "POS", client: "Мухамедов Т.Р.", amount: 925_000, status: "APPROVED", creator: "branch1", assignee: "hq", deadlineInDays: 1 },
  { daysAgo: 19, channel: "VISA", client: "Есенова Л.Д.", amount: 67_200, status: "IN_REVIEW", creator: "branch2", assignee: "hq", deadlineInDays: -3, reasonCode: "10.4" },
  { daysAgo: 22, channel: "INTERNAL", client: "Сулейменов А.Ж.", amount: 156_000, status: "DRAFT", creator: "branch1" },
  { daysAgo: 26, channel: "VISA", client: "Карипова М.И.", amount: 89_000, status: "DRAFT", creator: "branch2", reasonCode: "13.3" },
  { daysAgo: 35, channel: "MASTERCARD", client: "Ахметов Н.С.", amount: 234_500, status: "COMPLETED", creator: "branch1", assignee: "hq", reasonCode: "4853", outcome: "WON" },
  { daysAgo: 41, channel: "ATM", client: "Рахимов Е.В.", amount: 47_800, status: "COMPLETED", creator: "branch2", assignee: "hq", outcome: "WON" },
  { daysAgo: 48, channel: "VISA", client: "Жунусова Д.А.", amount: 1_580_000, status: "COMPLETED", creator: "branch1", assignee: "hq", reasonCode: "10.4", outcome: "LOST" },
  { daysAgo: 55, channel: "INTERNAL", client: "Бекетов И.О.", amount: 198_000, status: "CANCELLED", creator: "branch2", assignee: "hq" },
  { daysAgo: 63, channel: "MASTERCARD", client: "Исаев М.Т.", amount: 380_000, status: "COMPLETED", creator: "branch1", assignee: "hq", reasonCode: "4837", outcome: "WON" },
];

// Путь статусов до целевого — чтобы история в демо была правдоподобной.
const STATUS_PATH: Record<DisputeStatus, DisputeStatus[]> = {
  DRAFT: ["DRAFT"],
  SUBMITTED: ["DRAFT", "SUBMITTED"],
  IN_REVIEW: ["DRAFT", "SUBMITTED", "IN_REVIEW"],
  RETURNED: ["DRAFT", "SUBMITTED", "IN_REVIEW", "RETURNED"],
  APPROVED: ["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED"],
  COMPLETED: ["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "COMPLETED"],
  CANCELLED: ["DRAFT", "SUBMITTED", "IN_REVIEW", "CANCELLED"],
};
const HQ_STEPS = new Set<DisputeStatus>(["IN_REVIEW", "APPROVED", "RETURNED", "COMPLETED", "CANCELLED"]);

async function nextDisputeNumber(at: Date) {
  const [{ seq }] = await prisma.$queryRaw<{ seq: bigint }[]>`SELECT nextval('dispute_number_seq') AS seq`;
  return `DSP-${at.getFullYear()}-${String(seq).padStart(6, "0")}`;
}

async function upsertUser(data: {
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  branchId?: string;
  passwordHash: string;
}) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      name: data.name,
      role: data.role,
      organizationId: data.organizationId,
      branchId: data.branchId,
      password: data.passwordHash,
      orderNumber: "ДЕМО-1",
    },
  });
}

async function seedDemo() {
  const org = await prisma.organization.upsert({
    where: { bin: "000000000001" },
    update: {},
    create: {
      name: "Демо-банк",
      bin: "000000000001",
      subscription: { create: { startsAt: new Date() } },
    },
  });

  const branchData = [
    { code: "ALA-05", name: "Отделение №5, Алматы" },
    { code: "AST-02", name: "Отделение №2, Астана" },
    { code: "SHY-01", name: "Отделение №1, Шымкент" },
  ];
  const branches = [];
  for (const b of branchData) {
    branches.push(
      await prisma.branch.upsert({
        where: { organizationId_code: { organizationId: org.id, code: b.code } },
        update: {},
        create: { ...b, organizationId: org.id },
      }),
    );
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const users = {
    admin: await upsertUser({ email: "admin@demo-bank.kz", name: "Сатпаева Айгерим", role: "ORG_ADMIN", organizationId: org.id, passwordHash }),
    hq: await upsertUser({ email: "hq@demo-bank.kz", name: "Касымов Ерлан", role: "HQ_MANAGER", organizationId: org.id, passwordHash }),
    branch1: await upsertUser({ email: "branch5@demo-bank.kz", name: "Иванов Иван", role: "BRANCH_MANAGER", organizationId: org.id, branchId: branches[0].id, passwordHash }),
    branch2: await upsertUser({ email: "branch2@demo-bank.kz", name: "Алиева Мадина", role: "BRANCH_MANAGER", organizationId: org.id, branchId: branches[1].id, passwordHash }),
  };

  let template = await prisma.template.findFirst({
    where: { organizationId: org.id, name: "Заявление на chargeback" },
  });
  template ??= await prisma.template.create({
    data: {
      organizationId: org.id,
      name: "Заявление на chargeback",
      description: "Оспаривание карточной операции через МПС (Visa / Mastercard)",
      fields: CHARGEBACK_FIELDS,
    },
  });

  const existingDisputes = await prisma.dispute.count({ where: { organizationId: org.id } });
  if (existingDisputes > 0) {
    console.log(`• Демо-банк уже заполнен (${existingDisputes} диспутов)`);
    return;
  }

  const now = Date.now();
  for (const d of DEMO_DISPUTES) {
    const createdAt = new Date(now - d.daysAgo * DAY);
    const creator = users[d.creator];
    const assignee = d.assignee ? users[d.assignee] : null;
    const path = STATUS_PATH[d.status];
    const closed = d.status === "COMPLETED" || d.status === "CANCELLED";
    const closedAt = closed ? new Date(createdAt.getTime() + 6 * DAY) : null;

    await prisma.dispute.create({
      data: {
        number: await nextDisputeNumber(createdAt),
        status: d.status,
        templateId: template.id,
        formData: {
          clientName: d.client,
          amount: d.amount,
          reasonCode: d.reasonCode ?? null,
          description: "Демо-диспут",
        },
        channel: d.channel,
        amount: d.amount,
        clientName: d.client,
        reasonCode: d.reasonCode,
        deadlineAt: d.deadlineInDays !== undefined ? new Date(now + d.deadlineInDays * DAY) : null,
        outcome: d.outcome,
        refundedAmount: d.outcome === "WON" ? d.amount : null,
        closedAt,
        branchId: creator.branchId,
        organizationId: org.id,
        creatorId: creator.id,
        assigneeId: assignee?.id,
        createdAt,
        history: {
          create: path.map((toStatus, i) => ({
            fromStatus: i === 0 ? null : path[i - 1],
            toStatus,
            userId: HQ_STEPS.has(toStatus) && assignee ? assignee.id : creator.id,
            comment: toStatus === "RETURNED" ? "Не приложен чек операции" : null,
            createdAt: new Date(createdAt.getTime() + i * (DAY / 2)),
          })),
        },
      },
    });
  }

  console.log(`✓ Демо-банк: ${branches.length} отделения, 4 сотрудника, ${DEMO_DISPUTES.length} диспутов`);
  console.log(`  Вход для демо-сотрудников: admin@ / hq@ / branch5@ / branch2@demo-bank.kz, пароль ${DEMO_PASSWORD}`);
}

async function main() {
  await seedSuperAdmin();
  if (process.env.SEED_DEMO === "1") {
    if (process.env.NODE_ENV === "production") {
      console.log("• SEED_DEMO пропущен: NODE_ENV=production");
    } else {
      await seedDemo();
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
