import { NextResponse, type NextRequest } from "next/server";
import { locales, matchLocale } from "@/i18n/config";

/**
 * Sends a visitor with no locale in the path to the one their browser asked
 * for. Every page lives under /tr or /en so that each language has its own URL
 * — search engines and anyone sharing a link need that, and swapping content
 * behind a single URL gives neither.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = matchLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals, API routes, and files with an extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
