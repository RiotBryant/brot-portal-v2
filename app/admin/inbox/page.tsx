"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ReqRow = {
  id: string;
  created_at: string;
  category: string;
  subject: string;
  status: string;
  created_by: string;
};

export default function AdminInboxPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("member");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReqRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const canView = useMemo(() => role === "admin" || role === "superadmin", [role]);

  useEffect(() => {
    (async () => {
      setErr(null);
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        router.replace("/login");
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        router.replace("/login");
        return;
      }

      // Pull role from user_roles table
      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      setRole(r?.role ?? "member");

      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    if (!canView) return;

    (async () => {
      setErr(null);
      const { data, error } = await supabase
        .from("requests")
        .select("id, created_at, category, subject, status, created_by")
        .order("created_at", { ascending: false });

      if (error) {
        setErr(error.message);
        return;
      }
      setRows((data as ReqRow[]) ?? []);
    })();
  }, [loading, canView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white">
        <div className="mx-auto max-w-xl px-5 py-10">
          <Link href="/members" className="text-sm text-white/70 hover:text-white">
            ← Back
          </Link>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h1 className="text-xl font-semibold">Admin Inbox</h1>
            <p className="mt-2 text-sm text-white/70">
              Not authorized. Your role is <span className="text-white">{role}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/members" className="text-sm text-white/70 hover:text-white">
              ← Back to portal
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Admin Inbox</h1>
            <p className="mt-1 text-sm text-white/70">
              Support requests. Calm, trackable, private.
            </p>
          </div>

          <div className="text-xs text-white/60">
            Role: <span className="text-white">{role}</span>
          </div>
        </div>

        {err ? (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/70">
              No requests yet.
            </div>
          ) : (
            rows.map((r) => (
              <Link
                key={r.id}
                href={`/admin/inbox/${r.id}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm text-white/60">
                      {new Date(r.created_at).toLocaleString()} • {r.category}
                    </div>
                    <div className="mt-1 truncate text-base font-medium">
                      {r.subject}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/70">
                    {r.status}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
