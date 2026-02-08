import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Only these areas should force login
const PROTECTED_PREFIXES = [
  "/protected",
  "/admin",
  "/portal",
  "/chat",
  "/profile",
  "/lounge",
  "/pending",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function updateSession(request: NextRequest) {
  // Always start with a fresh "next" response
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
  cookiesToSet: Array<{
    name: string;
    value: string;
    options?: Record<string, any>;
  }>
) {
          // IMPORTANT: only set cookies on the RESPONSE (not request.cookies)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This refreshes the session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only protect protected routes
  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
