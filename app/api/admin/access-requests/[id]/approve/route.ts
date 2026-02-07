import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { approvalEmail } from "@/lib/email/templates";

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
    .select("id,status,full_name,email")
    .eq("id", ctx.params.id)
    .single();

  if (reqErr || !requestRow) return NextResponse.redirect(new URL("/admin/inbox", req.url), 303);
  if (requestRow.status !== "pending") return NextResponse.redirect(new URL("/admin/inbox", req.url), 303);

  // Mark approved
  await supabase
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestRow.id);

  const admin = createAdminClient();

  // Invite user (Supabase sends the actual "set password" invite email)
  let invitedUserId: string | null = null;

  const invite = await admin.auth.admin.inviteUserByEmail(requestRow.email, {
    redirectTo: `${process.env.PORTAL_URL}/auth/callback`,
  });

  if (invite.data?.user?.id) invitedUserId = invite.data.user.id;

  // If already exists, try to find user id
  if (!invitedUserId) {
    const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const match = list.data?.users?.find((u) => (u.email ?? "").toLowerCase() === requestRow.email.toLowerCase());
    if (match?.id) invitedUserId = match.id;
  }

  if (invitedUserId) {
    // Ensure profile + role
    await admin.from("profiles").upsert({
      user_id: invitedUserId,
      display_name: requestRow.full_name,
    });

    await admin.from("user_roles").upsert({
      user_id: invitedUserId,
      role: "member",
    });
  }

  // Send branded approval email (the “company looking” one)
  const supportEmail = process.env.SUPPORT_EMAIL!;
  const portalUrl = process.env.PORTAL_URL!;
  const preferredName = requestRow.full_name;
  const username = requestRow.email;

  await sendEmail({
    to: requestRow.email,
    subject: "You’ve been approved — Welcome to broTher collecTive",
    html: approvalEmail({ preferredName, username, portalUrl, supportEmail }),
  });

  return NextResponse.redirect(new URL("/admin/inbox", req.url), 303);
}
