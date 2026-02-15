"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ReqRow = {
  id: string;
  created_at: string;
  category: string | null;
  subject: string | null;
  status: string | null;
  created_by: string | null;
};

type MsgRow = {
  id: string;
  created_at: string;
  author_id: string | null;
  body: string | null;
  is_internal: boolean | null;
};

export default function InboxDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("member");

  const [req, setReq] = useState<ReqRow | null>(null);
  const [msgs, setMsgs] = useState<MsgRow[]>([]);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
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

      const { data: reqRow, error: reqErr } = await supabase
        .from("requests")
        .select("id, created_at, category, subject, status, created_by")
        .eq("id", id)
        .single();

      if (reqErr) throw reqErr;

      const { data: msgRows, error: msgErr } = await supabase
        .from("request_messages")
        .select("id, created_at, author_id, body, is_internal")
        .eq("request_id", id)
        .order("created_at", { ascending: true });

      if (msgErr) throw msgErr;

      setReq(reqRow as ReqRow);
      setMsgs((msgRows ?? []) as MsgRow[]);
      setLoading(false);
    })().catch((e: any) => {
      setErr(e?.message ?? "Failed to load request.");
      setLoading(false);
    });
  }, [router, id]);

  async function addInternalNote() {
    setErr(null);
    const clean = reply.trim();
    if (!clean) return;

    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase.from("request_messages").insert({
        request_id: id,
        author_id: uid,
        body: clean,
        is_internal: true,
      });

      if (error) throw error;

      const { data: msgRows, error: msgErr } = await supabase
        .from("request_messages")
        .select("id, created_at, author_id, body, is_internal")
        .eq("request_id", id)
        .order("created_at", { ascending: true });

      if (msgErr) throw msgErr;

      setMsgs((msgRows ?? []) as MsgRow[]);
      setReply("");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add note.");
    } finally {
      setSaving(false);
    }
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
        .input {
          width: 100%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          padding: 10px 12px;
          outline: none;
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {req?.subject || "(no subject)"}
            </h1>
            <div className="mt-2 text-sm text-white/70">
              {req?.category || "other"} • {req?.status || "open"} •{" "}
              {req?.created_at ? new Date(req.created_at).toLocaleString() : ""}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/60">
              Role: <span className="text-white">{role}</span>
            </div>
            <div className="mt-2">
              <Link href="/admin/inbox" className="h-9 rounded-xl px-3 text-sm btn inline-grid place-items-center">
                Back to Inbox
              </Link>
            </div>
          </div>
        </div>

        {err ? <div className="mt-6 text-sm text-red-300">{err}</div> : null}

        <div className="mt-6 glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Thread</h2>

          <div className="mt-4 space-y-3">
            {msgs.length === 0 ? (
              <div className="text-sm text-white/60">No messages yet.</div>
            ) : (
              msgs.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-4 ${
                    m.is_internal
                      ? "border-white/15 bg-black/40"
                      : "border-white/10 bg-black/25"
                  }`}
                >
                  <div className="text-xs text-white/55 flex items-center justify-between">
                    <span>{m.is_internal ? "Internal note" : "Member message"}</span>
                    <span>{new Date(m.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-sm text-white/80 whitespace-pre-wrap">
                    {m.body || ""}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold">Add internal note</div>
            <textarea
              className="input mt-2"
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Admins only. Calm notes, next steps, assignments."
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={addInternalNote}
                disabled={saving}
                className="h-10 rounded-xl px-3 text-sm btn"
              >
                {saving ? "Saving…" : "Add Note"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-white/45">
          Phase 2: superadmin can override admin actions + audit trail.
        </div>
      </div>
    </div>
  );
}
