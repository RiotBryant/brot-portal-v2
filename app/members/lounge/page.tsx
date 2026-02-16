"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ROOMS = [
  { slug: "weekly", title: "Weekly Meeting", subtitle: "Primary room • steady cadence" },
  { slug: "chill-1", title: "Chill Room 1", subtitle: "Low pressure • drop in" },
  { slug: "chill-2", title: "Chill Room 2", subtitle: "Quiet talk • reset" },
  { slug: "admin", title: "Admin Only", subtitle: "Locked by trust" },
];

export default function LoungePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace(`/login?next=${encodeURIComponent("/members/lounge")}`);
        return;
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

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .wrap { width: min(980px, calc(100% - 24px)); margin: 0 auto; padding: 24px 0 36px; }
        .glass {
          background:
            radial-gradient(800px 420px at 20% 30%, rgba(80,170,255,0.20), transparent 60%),
            radial-gradient(800px 420px at 80% 30%, rgba(255,80,210,0.14), transparent 60%),
            rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 70px rgba(0,0,0,0.45);
        }
        .btn {
          display:inline-flex; align-items:center; justify-content:center;
          height:44px; padding:0 16px; border-radius:999px;
          border:1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color:#fff; font-size:14px;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
        }
        .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
        .btnPrimary { background:#fff; color:#000; border:none; }
        .card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 18px;
        }
      `}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">broT Lounge</div>
            <div className="text-sm text-white/60">Choose a room. No auto-join.</div>
          </div>

          <div className="flex gap-2">
            <Link href="/members" className="btn">
              ← Back
            </Link>
            <Link href="/members/lounge/weekly" className="btn btnPrimary">
  Weekly Meeting
</Link>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 mt-5">
          <div className="text-2xl font-semibold">Safe entry.</div>
          <div className="text-sm text-white/65 mt-2">
            Click a room → it opens the room page. Nothing auto-joins.
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mt-6">
            {ROOMS.map((r) => (
              <Link
                key={r.slug}
                href={`/members/lounge/${r.slug}`}
                className="card hover:opacity-95 transition"
              >
                <div className="text-base font-semibold">{r.title}</div>
                <div className="text-sm text-white/65 mt-1">{r.subtitle}</div>
                <div className="mt-4">
                  <span className="btn btnPrimary">Enter</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
