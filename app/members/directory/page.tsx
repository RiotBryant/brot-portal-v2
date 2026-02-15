"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Row = { display_name: string | null; username: string | null };

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

      const { data: list } = await supabase
        .from("profiles")
        .select("display_name, username")
        .order("created_at", { ascending: true });

      setRows((list as Row[]) ?? []);
      setLoading(false);
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .wrap { width: min(980px, calc(100% - 24px)); margin: 0 auto; padding: 22px 0 40px; }
        .card { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.10); border-radius: 24px; padding: 18px; }
        .btn { display:inline-flex; align-items:center; justify-content:center; height:42px; padding:0 14px; border-radius:999px;
          border:1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color:#fff; font-size:14px; }
      `}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Directory</div>
            <div className="text-sm text-white/60">broT members (profile names)</div>
          </div>
          <Link className="btn" href="/members">← Back</Link>
        </div>

        <div className="card mt-5">
          {loading ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-white/60">No profiles yet.</div>
          ) : (
            <div className="grid gap-2">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                  <div className="text-sm">
                    <div className="font-semibold">
                      {r.display_name || r.username || "Member"}
                    </div>
                    <div className="text-white/60">
                      {r.username ? `@${r.username}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
