"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Row = { id: string; username: string | null; avatar_url: string | null };

export default function DirectoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }

      const { data: list, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .order("username", { ascending: true });

      if (!error && list) setRows(list as any);
      setLoading(false);
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Directory</div>
            <div className="text-xs text-white/60">members • portal names</div>
          </div>
          <Link href="/members" className="h-10 rounded-2xl px-4 grid place-items-center text-sm border border-white/10 bg-white/5 hover:bg-white/10">
            ← Back
          </Link>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-sm text-white/70">
              {loading ? "Loading…" : `${rows.length} members`}
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {rows.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/30 overflow-hidden grid place-items-center">
                  {r.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar_url} alt="" style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                  ) : (
                    <span className="text-xs text-white/70">—</span>
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {r.username?.trim() || "Member"}
                  </div>
                  <div className="text-xs text-white/50">{r.id}</div>
                </div>
              </div>
            ))}

            {!loading && rows.length === 0 ? (
              <div className="px-5 py-10 text-sm text-white/60">
                No profiles yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
