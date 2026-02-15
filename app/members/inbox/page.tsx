"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ReqRow = {
  id: string;
  created_at: string;
  category: string | null;
  subject: string | null;
  status: string | null;
  last_updated: string | null;
};

export default function MemberInboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ReqRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return router.replace("/login");

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return router.replace("/login");

      const { data, error } = await supabase
        .from("requests")
        .select("id, created_at, category, subject, status, last_updated")
        .eq("created_by", uid)
        .order("last_updated", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setItems((data ?? []) as any);
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

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your Inbox</h1>
            <p className="mt-2 text-sm text-white/70">Your support threads.</p>
          </div>
          <Link href="/members" className="text-sm text-white/70 hover:text-white">
            ← Back to Portal
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-white/60 bg-white/5">
            <div className="col-span-8">Subject</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Updated</div>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-sm text-white/60">No threads yet.</div>
          ) : (
            items.map((r) => {
              const updated = r.last_updated || r.created_at;
              return (
                <Link
                  key={r.id}
                  href={`/members/inbox/${r.id}`}
                  className="grid grid-cols-12 gap-2 px-4 py-4 border-t border-white/10 hover:bg-white/5"
                >
                  <div className="col-span-8 text-sm">
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

        <div className="mt-6">
          <Link href="/members/support" className="rounded-xl bg-white text-black px-4 py-2 text-sm">
            New Support Request →
          </Link>
        </div>
      </div>
    </div>
  );
}
