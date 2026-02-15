"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ReqRow = {
  id: string;
  created_at: string;
  category: string | null;
  subject: string | null;
  status: string | null;
};

export default function AdminInboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("member");
  const [rows, setRows] = useState<ReqRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const isAdmin = useMemo(() => role === "admin" || role === "superadmin", [role]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        router.replace("/login");
        return;
      }

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      const roleVal = r?.role ?? "member";
      setRole(roleVal);

      if (!(roleVal === "admin" || roleVal === "superadmin")) {
        router.replace("/members");
        return;
      }

      const { data: reqs, error } = await supabase
        .from("requests")
        .select("id, created_at, category, subject, status")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      setRows((reqs ?? []) as ReqRow[]);
      setLoading(false);
    })().catch((e: any) => {
      setErr(e?.message ?? "Failed to load inbox.");
      setLoading(false);
    });
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(80,170,255,0.06);
        }
        .btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .btn:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.08); }
        .pill {
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.35);
          border-radius: 999px;
          padding: 2px 10px;
          font-size: 12px;
          color: rgba(255,255,255,0.75);
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Inbox</h1>
            <p className="mt-2 text-sm text-white/70">
              Calm queue. Nothing loud. Handle support requests with care.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/60">
              Role: <span className="text-white">{role}</span>
            </div>
            <div className="mt-2 flex gap-2 justify-end">
              <Link href="/members" className="h-9 rounded-xl px-3 text-sm btn inline-grid place-items-center">
                Back
              </Link>
              <button onClick={logout} className="h-9 rounded-xl px-3 text-sm btn">
                Log out
              </button>
            </div>
          </div>
        </div>

        {err ? <div className="mt-6 text-sm text-red-300">{err}</div> : null}

        <div className="mt-6 glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm text-white/70">
              {rows.length} request{rows.length === 1 ? "" : "s"}
            </div>
            <div className="text-xs text-white/50">Newest first</div>
          </div>

          <div className="divide-y divide-white/10">
            {rows.length === 0 ? (
              <div className="p-6 text-sm text-white/60">No requests yet.</div>
            ) : (
              rows.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/inbox/${r.id}`}
                  className="block px-5 py-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.subject || "(no subject)"}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="pill">{r.category || "other"}</span>
                      <span className="pill">{r.status || "open"}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 text-xs text-white/45">
          Superadmin will eventually be able to override admin actions. (Phase 2.)
        </div>
      </div>
    </div>
  );
}
