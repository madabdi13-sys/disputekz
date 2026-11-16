import { NextResponse, type NextRequest } from "next/server";

/**
 * Оптимистичная проверка: нет cookie сессии — сразу на /login, не рендеря страницу.
 * Это только быстрый фильтр. Настоящая проверка (сессия в БД, активность
 * сотрудника и банка, роль) — в lib/dal.ts на каждой странице и в каждом действии.
 *
 * Обратное (вошедший открыл /login) решают сами страницы входа: cookie может
 * быть просроченной, и редирект отсюда дал бы петлю.
 */
const SESSION_COOKIE = "dk_session";

export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/disputes/:path*", "/reports/:path*", "/admin/:path*", "/super/:path*"],
};
