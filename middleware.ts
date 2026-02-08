import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/protected/:path*",
    "/admin/:path*",
    "/portal/:path*",
    "/chat/:path*",
    "/profile/:path*",
    "/lounge/:path*",
    "/pending/:path*",
  ],
};
