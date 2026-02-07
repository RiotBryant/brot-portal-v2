import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Role = "new" | "member" | "admin" | "superadmin" | "god";
const rank = (r: Role) => (r === "new" ? 0 : r === "member" ? 1 : r === "admin" ? 2 : r === "superadmin" ? 3 : 4);

export default async function AdminInboxPage() {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = (roleRow?.role ?? "new") as Role;
  if (rank(role) < rank("admin")) redirect("/portal");

  const { data: requests } = await supabase
    .from("access_requests")
    .select("id,created_at,status,full_name,email,message,decision_note")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Inbox</h1>
            <p className="text-sm text-white/70">Pending access requests</p>
          </div>
          <a className="underline" href="/portal">
            Back to Portal
          </a>
        </header>

        <section className="mt-6 grid gap-4">
          {(requests ?? []).length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              No pending requests.
            </div>
          ) : (
            (requests ?? []).map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{r.full_name}</div>
                    <div className="text-sm text-white/70">{r.email}</div>
                    <div className="text-xs text-white/50 mt-1">
                      Submitted: {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 whitespace-pre-wrap text-sm">{r.message}</div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <form action={`/api/admin/access-requests/${r.id}/approve`} method="post">
                    <button className="rounded-xl bg-white text-black font-semibold px-4 py-2">
                      Approve
                    </button>
                  </form>

                  <form action={`/api/admin/access-requests/${r.id}/deny`} method="post">
                    <button className="rounded-xl border border-white/10 px-4 py-2">
                      Deny
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
