import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return NextResponse.redirect(new URL("/login", req.url), 303);
  return NextResponse.redirect(new URL("/portal", req.url), 303);
}
