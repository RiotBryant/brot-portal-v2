import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type"); // "recovery" for password reset
  const next =
    url.searchParams.get("next") ??
    (type === "recovery" ? "/reset-password" : "/portal");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=missing_auth_code`,
      303
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
      303
    );
  }

  return NextResponse.redirect(`${origin}${next}`, 303);
}
