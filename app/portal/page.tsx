import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Role = "new" | "member" | "admin" | "superadmin" | "god";

function rank(role: Role) {
  return role === "new"
    ? 0
    : role === "member"
    ? 1
    : role === "admin"
    ? 2
    : role === "superadmin"
    ? 3
    : 4;
}

export default async function PortalPage() {
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

  if (role === "new") redirect("/pending");

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id,name,provider,url,min_role,logo_url")
    .order("created_at", { ascending: true });

  const isAdminPlus = rank(role) >= rank("admin");

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">broTher collecTive porTal</h1>
            <p className="text-sm text-white/70">
              Signed in as {user.email} • role: {role}
            </p>
          </div>

          <form action="/api/auth/logout" method="post">
            <button className="rounded-xl border border-white/10 px-4 py-2">
              Logout
            </button>
          </form>
        </header>

        <section className="mt-8 grid gap-4">
          {(rooms ?? []).map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                {r.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.logo_url}
                    alt=""
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-white/10" />
                )}
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-white/60">
                    Provider: {r.provider} • Min role: {r.min_role}
                  </div>
                </div>
              </div>

              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-white text-black font-semibold px-4 py-2"
              >
                Join
              </a>
            </div>
          ))}
        </section>

        {isAdminPlus && (
          <section className="mt-10">
            <a
              href="/admin/inbox"
              className="inline-block rounded-xl border border-white/10 px-4 py-2 underline"
            >
              Admin Inbox
            </a>
          </section>
        )}
      </div>
    </main>
  );
}
