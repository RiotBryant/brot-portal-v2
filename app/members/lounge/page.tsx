"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ROOMS = [
  { slug: "weekly", title: "broT Meeting", subtitle: "Primary cadence • cameras optional", adminOnly: false },
  { slug: "chill-1", title: "Chill Room 1", subtitle: "Low pressure • drop in", adminOnly: false },
  { slug: "chill-2", title: "Chill Room 2", subtitle: "Quiet reset • breathe + talk", adminOnly: false },
  { slug: "admin", title: "Admin Meeting Room", subtitle: "Locked by trust", adminOnly: true },
] as const;

export default function LoungePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("member");

  const isAdmin = useMemo(() => role === "admin" || role === "superadmin", [role]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace(`/login?next=${encodeURIComponent("/members/lounge")}`);
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (uid) {
        const { data: r } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .maybeSingle();
        setRole(r?.role ?? "member");
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
            radial-gradient(900px 460px at 20% 25%, rgba(80,170,255,0.18), transparent 60%),
            radial-gradient(900px 460px at 80% 25%, rgba(255,80,210,0.12), transparent 60%),
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
          text-decoration:none;
          white-space:nowrap;
        }
        .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
        .btnPrimary { background:#fff; color:#000; border:none; }
        .card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 18px;
          text-decoration:none;
          color:#fff;
          display:block;
        }
        .pillRow { display:flex; flex-wrap:wrap; gap:10px; margin-top: 14px; }
        .pill {
          display:inline-flex; align-items:center; gap:8px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.92);
          text-decoration:none;
          font-size: 13px;
          transition: transform .12s ease, background .12s ease, border-color .12s ease, opacity .12s ease;
          white-space:nowrap;
        }
        .pill:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
        .pillLocked { opacity: .55; cursor:not-allowed; pointer-events:none; }
        .hint { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 10px; }
        .tiny { font-size: 12px; color: rgba(255,255,255,0.50); margin-top: 6px; }
      `}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">broLOUNGE</div>
            <div className="text-sm text-white/60">Pick a room. It opens the branded page with embedded video.</div>
          </div>

          <div className="flex gap-2">
            <Link href="/members" className="btn">
              ← Back to Portal
            </Link>

            <Link href="/members/room/weekly" className="btn btnPrimary">
              broT Meeting
            </Link>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 mt-5">
          <div className="text-2xl font-semibold">Choose your door.</div>
          <div className="hint">One click → branded room page → embedded live room. Nothing auto-joins.</div>
          <div className="tiny">Admin room is visible but locked unless you have the role.</div>

          {/* Bubble links that match your portal */}
          <div className="pillRow">
            {ROOMS.map((r) => {
              const locked = r.adminOnly && !isAdmin;
              const href = `/members/room/${r.slug}`;

              return locked ? (
                <span key={r.slug} className="pill pillLocked" title="Locked by role">
                  🔒 {r.title}
                </span>
              ) : (
                <Link key={r.slug} href={href} className="pill">
                  {r.adminOnly ? "🔒" : "●"} {r.title}
                </Link>
              );
            })}
          </div>

          {/* Room cards (optional but matches your old layout) */}
          <div className="grid gap-3 sm:grid-cols-2 mt-6">
            {ROOMS.map((r) => {
              const locked = r.adminOnly && !isAdmin;
              const href = `/members/room/${r.slug}`;

              return locked ? (
                <div key={r.slug} className="card" style={{ opacity: 0.6 }}>
                  <div className="text-base font-semibold">🔒 {r.title}</div>
                  <div className="text-sm text-white/65 mt-1">{r.subtitle}</div>
                  <div className="mt-4">
                    <span className="btn" style={{ pointerEvents: "none", opacity: 0.7 }}>
                      Locked
                    </span>
                  </div>
                </div>
              ) : (
                <Link key={r.slug} href={href} className="card hover:opacity-95 transition">
                  <div className="text-base font-semibold">{r.title}</div>
                  <div className="text-sm text-white/65 mt-1">{r.subtitle}</div>
                  <div className="mt-4">
                    <span className="btn btnPrimary">Enter</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
