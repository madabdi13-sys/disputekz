import type { Role } from "@/generated/prisma/enums";

/**
 * Матрица прав из docs/ARCHITECTURE.md → «Роли и права».
 * Здесь только «кто может», без данных: проверка, что объект принадлежит
 * банку пользователя, — в lib/tenant.ts.
 */
export const PERMISSIONS = {
  "organizations.manage": ["SUPER_ADMIN"],
  "subscriptions.manage": ["SUPER_ADMIN"],
  "registrations.review": ["ORG_ADMIN"],
  "users.manage": ["ORG_ADMIN"],
  "branches.manage": ["ORG_ADMIN"],
  "templates.manage": ["ORG_ADMIN"],
  "audit.view": ["ORG_ADMIN"],
  "disputes.create": ["BRANCH_MANAGER"],
  "disputes.viewOwn": ["BRANCH_MANAGER"],
  "disputes.viewIncoming": ["HQ_MANAGER"],
  "disputes.viewAll": ["ORG_ADMIN"],
  "disputes.process": ["HQ_MANAGER"],
  "attachments.upload": ["BRANCH_MANAGER", "HQ_MANAGER"],
  "reports.view": ["ORG_ADMIN", "HQ_MANAGER", "BRANCH_MANAGER"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Администратор платформы",
  ORG_ADMIN: "Администратор банка",
  HQ_MANAGER: "Менеджер головного офиса",
  BRANCH_MANAGER: "Менеджер отделения",
};

/** Куда вести пользователя после входа и при попытке открыть чужой раздел. */
export function homePathFor(role: Role): string {
  return role === "SUPER_ADMIN" ? "/super/organizations" : "/dashboard";
}

/** Счётчик рядом с пунктом меню (считается в services/counters.service.ts). */
export type NavBadge = "requests" | "incoming" | "returned";

export type NavItem = { href: string; label: string; badge?: NavBadge; badgeTitle?: string };

/** Пункты верхнего меню по роли. Разделы следующих этапов добавляются по мере готовности. */
export function navItemsFor(role: Role): NavItem[] {
  switch (role) {
    case "SUPER_ADMIN":
      return [{ href: "/super/organizations", label: "Банки" }];
    case "ORG_ADMIN":
      return [
        { href: "/dashboard", label: "Диспуты" },
        { href: "/admin/requests", label: "Заявки", badge: "requests", badgeTitle: "Заявки на доступ" },
        { href: "/admin/users", label: "Сотрудники" },
        { href: "/admin/branches", label: "Отделения" },
        { href: "/reports", label: "Отчёты" },
        { href: "/disputes/archive", label: "Архив" },
      ];
    case "HQ_MANAGER":
      return [
        { href: "/dashboard", label: "Входящие", badge: "incoming", badgeTitle: "Ждут, когда их возьмут в работу" },
        { href: "/reports", label: "Отчёты" },
        { href: "/disputes/archive", label: "Архив" },
      ];
    case "BRANCH_MANAGER":
      return [
        { href: "/dashboard", label: "Мои диспуты", badge: "returned", badgeTitle: "Возвращены на доработку" },
        { href: "/disputes/new", label: "Новый диспут" },
        { href: "/reports", label: "Отчёты" },
        { href: "/disputes/archive", label: "Архив" },
      ];
  }
}
