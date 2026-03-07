import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale } from "./i18n/config";

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore API routes, Next internals, and static files.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If path already starts with a valid locale, continue.
  const maybeLocale = pathname.split("/")[1];
  if (isValidLocale(maybeLocale)) {
    return NextResponse.next();
  }

  // Default locale redirect: check geolocation header from Vercel if available
  let localeToUse = defaultLocale;
  const country = request.headers.get("x-vercel-ip-country");
  
  if (country) {
    switch(country) {
      case "ES":
      case "MX":
      case "AR":
      case "CO":
      case "CL":
      case "PE":
        localeToUse = "es";
        break;
      case "GB":
      case "US":
      case "CA":
      case "AU":
      case "NZ":
        localeToUse = "en";
        break;
      // Default to fr for all other countries as requested
      default:
        localeToUse = "fr";
        break;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${localeToUse}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};