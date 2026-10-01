import { NextResponse, type NextRequest } from "next/server";

/**
 * Launch gate: until launch time, the home page shows the countdown film
 * (Arabic for Arabic-language browsers). At launch it steps aside and the
 * normal sign-in page appears. Override with LAUNCH_AT (ISO date) if the
 * date moves; `/?preview` lets the team reach sign-in before launch.
 */
const LAUNCH_AT = Date.parse(process.env.LAUNCH_AT || "2026-10-03T15:00:00+04:00");
const PREVIEW_COOKIE = "falah_preview";

export function middleware(request: NextRequest) {
  if (Date.now() >= LAUNCH_AT) return NextResponse.next();

  const { searchParams } = request.nextUrl;
  if (searchParams.has("preview")) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("preview");
    const response = NextResponse.redirect(url);
    response.cookies.set(PREVIEW_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 14, sameSite: "lax", secure: true });
    return response;
  }
  if (request.cookies.get(PREVIEW_COOKIE)?.value === "1") return NextResponse.next();

  const prefersArabic = /^\s*ar\b/i.test(request.headers.get("accept-language") || "");
  const response = NextResponse.rewrite(new URL(prefersArabic ? "/launch/ar/index.html" : "/launch/index.html", request.url));
  // Never cache the gated home page, so it flips to sign-in exactly at launch.
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/"],
};
