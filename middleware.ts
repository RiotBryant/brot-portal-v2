import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies: CookieToSet[]) {
          cookies.forEach((cookie) => {
            res.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  const path = req.nextUrl.pathname;

  // ✅ ONE PORTAL: /portal routes into /members
  if (path === "/portal" || path.startsWith("/portal/")) {
    const url = req.nextUrl.clone();
    url.pathname = path.replace("/portal", "/members") || "/members";
    return NextResponse.redirect(url);
  }

  const isProtected = path === "/members" || path.startsWith("/members/");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/members/:path*", "/portal/:path*"],
};
