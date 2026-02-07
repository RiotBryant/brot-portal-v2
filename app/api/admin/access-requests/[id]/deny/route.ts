import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { denialEmail } from "@/lib/email/templates";

type Role = "new" | "member" | "admin" | "superadmin" | "god";
const rank = (r: Role) => (r === "new" ? 0 : r === "member" ? 1 : r === "admin" ? 2 : r === "superadmin" ? 3 : 4);

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  const actor = userData.user;
  if (!actor) return NextResponse.redirect(new URL("/login", req.url), 303);

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", actor.id)
    .single();

  const actorRole = (roleRow?.role ?? "new") as Role;
  if (rank(actorRole) < rank("admin")) return NextResponse.redirect(new URL("/portal", req.url), 303);

  const { data: requestRow, error: reqErr } = await supabase
    .from("access_requests")
    .select("id,status,email")
    .eq("id", ctx.params.id)
    .single();

  if (reqErr || !requestRow) return NextResponse.redirect(new URL("/admin/inbox", req.url), 303);
  if (requestRow.status !== "pending") return NextResponse.redirect(new URL("/admin/inbox", req.url), 303);

  await supabase
    .from("access_requests")
    .update({
      status: "denied",
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestRow.id);

  const supportEmail = process.env.SUPPORT_EMAIL!;

  await sendEmail({
    to: requestRow.email,
    subject: "broTher collecTive — Update on your request",
    html: denialEmail({ supportEmail }),
  });

  return NextResponse.redirect(new URL("/admin/inbox", req.url), 303);
}
