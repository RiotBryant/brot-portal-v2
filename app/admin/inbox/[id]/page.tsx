"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ReqRow = {
  id: string;
  created_at: string;
  category: string;
  subject: string;
  body: string;
  status: string;
  created_by: string;
};

export default function AdminInboxDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [role, setRole] = useState<string>("member");
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<ReqRow | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState("open");
  const [note, setNote] = useState("");

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
    if (!id) return;

    (async () => {
      setErr(null);
      const { data, error } = await supabase
        .from("requests")
        .select("id, created_at, category, subject, body, status, created_by")
        .eq("id", id)
        .single();

      if (error) {
        setErr(error.message);
        return;
      }

      const r = data as ReqRow;
      setRow(r);
      setStatus(r.status ?? "open");
    })();
  }, [loading, canView, id]);

  async function saveStatus() {
    if (!id) return;
    setErr(null);

    const { error } = await supabase
      .from("requests")
      .update({
        status,
        last_updated: new Date().toISOString(),
        decision_note: note.trim() || null,
      })
      .eq("id", id);

    if (error) {
      setErr(error.message);
      return;
    }

    router.refresh();
  }

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
            <h1 className="text-xl font-semibold">Request</h1>
            <p className="mt-2 text-sm text-white/70">
              Not authorized. Your role is <span className="text-white">{role}</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white">
        <div className="mx-auto max-w-2xl px-5 py-10">
          <Link href="/admin/inbox" className="text-sm text-white/70 hover:text-white">
            ← Back to inbox
          </Link>
          {err ? (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          ) : (
            <div className="mt-6 text-sm text-white/70">Not found.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/admin/inbox" className="text-sm text-white/70 hover:text-white">
          ← Back to inbox
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm text-white/60">
            {new Date(row.created_at).toLocaleString()} • {row.category}
          </div>
          <h1 className="mt-2 text-2xl font-semibold">{row.subject}</h1>

          <div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            {row.body}
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            <div className="grid gap-2">
              <label className="text-sm text-white/80">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/25"
              >
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
                <option value="closed">closed</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/80">Internal note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What did you do / what’s the plan?"
                className="rounded-xl border border-white/10 bg-black/40 p-3 text-white placeholder:text-white/35 outline-none focus:border-white/25"
              />
            </div>

            <button
              onClick={saveStatus}
              className="h-11 rounded-xl bg-white text-black font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
