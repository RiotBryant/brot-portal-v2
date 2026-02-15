"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Role = "member" | "admin" | "superadmin";
type RequestRow = {
  id: string;
  created_at: string;
  last_updated: string;
  created_by: string;
  category: string;
  subject: string;
  status: "new" | "in_progress" | "waiting" | "done";
  urgent_note: string | null;
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

export default function AdminInboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>("member");
  const [items, setItems] = useState<RequestRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function boot() {
    setErr(null);
    setLoading(true);

    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      router.push("/login");
      return;
    }

    // role check
    const { data: r, error: rErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", sess.session.user.id)
      .maybeSingle();

    if (rErr) {
      setErr(rErr.message);
      setLoading(false);
      return;
    }

    const userRole = (r?.role as Role) ?? "member";
    setRole(userRole);

    if (userRole !== "admin" && userRole !== "superadmin") {
      router.push("/members");
      return;
    }

    const { data, error } = await supabase
      .from("requests")
      .select("id, created_at, last_updated, created_by, category, subject, status, urgent_note")
      .order("last_updated", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setItems((data ?? []) as RequestRow[]);
    setLoading(false);
  }

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(70,170,255,0.16), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/members")}
            className="text-sm text-white/60 hover:text-white"
          >
            ← Back to Portal
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">
              Role: <span className="text-white/80">{role}</span>
            </span>
            <button
              onClick={logout}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/30 hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold">Admin Inbox</h1>
        <p className="mt-2 text-sm text-white/70">
          Requests submitted through the portal support form. Quiet, trackable, one place.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={boot}
            className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm hover:border-white/30"
          >
            Refresh
          </button>
          <div className="text-xs text-white/45">
            {items.length} total
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="text-white/60">Loading…</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              No requests yet.
            </div>
          ) : (
            items.map((req) => (
              <Link
                key={req.id}
                href={`/admin/inbox/${req.id}`}
                className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/25"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{req.status}</Badge>
                  <Badge>{req.category}</Badge>
                  {req.urgent_note ? <Badge>urgent</Badge> : null}
                </div>

                <div className="mt-3 text-lg font-semibold">{req.subject}</div>

                <div className="mt-2 text-xs text-white/50">
                  Updated: {new Date(req.last_updated).toLocaleString()}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
