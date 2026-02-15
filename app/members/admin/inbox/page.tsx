"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ReqRow = {
  id: string;
  created_at: string;
  created_by: string;
  category: string | null;
  subject: string | null;
  status: string | null;
  visibility: string | null;
  last_updated: string | null;
  urgent_note: string | null;
};

type ProfileMini = { user_id: string; username: string | null; display_name: string | null; avatar_url?: string | null };

export default function AdminInboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("member");
  const [items, setItems] = useState<ReqRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileMini>>({});
  const isAdmin = useMemo(() => role === "admin" || role === "superadmin", [role]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return router.replace("/login");

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return router.replace("/login");

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      const myRole = r?.role ?? "member";
      setRole(myRole);

      if (!(myRole === "admin" || myRole === "superadmin")) {
        router.replace("/members");
        return;
      }

      // Pull requests (admin visibility)
      const { data: reqs, error } = await supabase
        .from("requests")
        .select("id, created_at, created_by, category, subject, status, visibility, last_updated, urgent_note")
        .eq("visibility", "admin")
        .order("last_updated", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      const list = (reqs ?? []) as ReqRow[];
      setItems(list);

      // Fetch profile labels for created_by
      const ids = Array.from(new Set(list.map((x) => x.created_by))).filter(Boolean);
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", ids);

        const map: Record<string, ProfileMini> = {};
        (profs ?? []).forEach((p: any) => (map[p.user_id] = p));
        setProfiles(map);
      }

      setLoading(false);
    })();
  }, [router]);

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
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Inbox</h1>
            <p className="mt-2 text-sm text-white/70">Support requests (email-style).</p>
          </div>
          <Link href="/members" className="text-sm text-white/70 hover:text-white">
            ← Back to Portal
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-white/60 bg-white/5">
            <div className="col-span-3">From</div>
            <div className="col-span-5">Subject</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Updated</div>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-sm text-white/60">No requests yet.</div>
          ) : (
            items.map((r) => {
              const p = profiles[r.created_by];
              const from = p?.display_name || p?.username || "member";
              const updated = r.last_updated || r.created_at;

              return (
                <Link
                  key={r.id}
                  href={`/members/admin/inbox/${r.id}`}
                  className="grid grid-cols-12 gap-2 px-4 py-4 border-t border-white/10 hover:bg-white/5"
                >
                  <div className="col-span-3 text-sm">
                    {from}
                    {r.urgent_note ? <div className="mt-1 text-xs text-red-200/80">URGENT</div> : null}
                  </div>
                  <div className="col-span-5 text-sm">
                    <div className="font-medium">{r.subject || "(no subject)"}</div>
                    <div className="mt-1 text-xs text-white/60">{r.category || "other"}</div>
                  </div>
                  <div className="col-span-2 text-sm">
                    <span className="rounded-full border border-white/15 px-2 py-1 text-xs">
                      {r.status || "open"}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-xs text-white/60">
                    {new Date(updated).toLocaleString()}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
