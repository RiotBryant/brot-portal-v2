import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Always create a response we can attach refreshed cookies to
  let res = NextResponse.next();

  // Create Supabase SSR client that can READ + REFRESH auth cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          // If Supabase refreshes the session, it will set cookies here
          cookies.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  const path = req.nextUrl.pathname;

  // ✅ ONE PORTAL: if anything hits /portal, force it into /members
  // (No moving files. No new folders. Just one entry point.)
  if (path === "/portal" || path.startsWith("/portal/")) {
    const url = req.nextUrl.clone();
    url.pathname = path.replace("/portal", "/members") || "/members";
    return NextResponse.redirect(url);
  }

  // Routes anyone should reach without being logged in
  const publicPaths = [
    "/",
    "/login",
    "/auth",
    "/reset-password",
    "/api",
    "/favicon.ico",
  ];

  const isPublic = publicPaths.some(
    (p) => path === p || path.startsWith(p + "/")
  );

  // Only protect the portal areas
  const isProtected =
    path === "/members" ||
    path.startsWith("/members/");

  // Read user from refreshed cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If protected and not logged in → send to /login
  if (isProtected && !isPublic && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return res;
}

// Only run middleware where it matters (keeps it fast)
export const config = {
  matcher: ["/members/:path*", "/portal/:path*"],
};
