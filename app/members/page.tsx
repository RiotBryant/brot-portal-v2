"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function MembersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("member");
  const [loading, setLoading] = useState(true);

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

      setRole(r?.role ?? "member");
      setLoading(false);
    })();
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

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        :root { color-scheme: dark; }
        @keyframes broTPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(90,170,255,0)); opacity: 1; }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 22px rgba(90,170,255,0.35)); opacity: 0.98; }
        }
        .broT-pulse { animation: broTPulse 2.8s ease-in-out infinite; }
        .glass {
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 70px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }
        .pill {
          background: rgba(255,255,255,0.92);
          color: #0b0b12;
          border: 1px solid rgba(255,255,255,0.65);
          transition: transform .12s ease, filter .12s ease;
        }
        .pill:hover { transform: translateY(-1px); filter: brightness(1.02); }
        .pillGhost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .pillGhost:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.08); }
        .muted { color: rgba(255,255,255,0.70); }
        .muted2 { color: rgba(255,255,255,0.55); }
        .hairline { height: 1px; background: rgba(255,255,255,0.10); }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* HERO (Carrd vibe) */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/30">
          {/* Faded huge logo as background (NOT an <img> in the flow) */}
          <div
            className="absolute inset-0 opacity-[0.28]"
            style={{
              backgroundImage: "url(/broTportal.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(0px)",
            }}
          />
          {/* Dark overlay so it feels “secret layer” */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/60 to-black/85" />

          <div className="relative px-5 py-8 sm:px-10 sm:py-10">
            {/* Top row: taglines + small pulsing icon */}
            <div className="flex items-center justify-between gap-4">
              <div className="hidden sm:block text-sm muted">
                Built on presence, not noise.
                <div className="mt-2 hairline w-44 opacity-70" />
              </div>

              <div className="flex flex-col items-center">
                <div className="broT-pulse">
                  {/* SMALL icon only */}
                  <img
                    src="/broTportal.png"
                    alt="broT Members Portal"
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border border-white/10 bg-black/20"
                  />
                </div>
              </div>

              <div className="hidden sm:block text-sm muted text-right">
                Brotherhood without performance.
                <div className="mt-2 hairline w-56 ml-auto opacity-70" />
              </div>
            </div>

            {/* Title + safety line (mobile-friendly) */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                broT Members Portal
              </h1>
              <p className="mt-2 text-sm muted">
                Nothing auto-joins. Nothing is recorded. You’re safe.
              </p>
            </div>

            {/* Pills nav (desktop row / mobile wraps) */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/members" className="h-11 min-w-[110px] rounded-full px-6 grid place-items-center text-sm pill">
                HOME
              </Link>
              <Link href="/members/forms" className="h-11 min-w-[110px] rounded-full px-6 grid place-items-center text-sm pill">
                FORMS
              </Link>
              <Link href="/members/rooms" className="h-11 min-w-[110px] rounded-full px-6 grid place-items-center text-sm pill">
                LOUNGE
              </Link>
              <Link href="/members/support" className="h-11 min-w-[110px] rounded-full px-6 grid place-items-center text-sm pill">
                SUPPORT
              </Link>
            </div>

            {/* Role + admin + logout */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="muted2">
                Role: <span className="text-white">{role}</span>
              </div>

              {isAdmin ? (
                <Link href="/admin/inbox" className="h-10 rounded-full px-5 grid place-items-center text-sm pillGhost">
                  Admin Inbox
                </Link>
              ) : null}

              <button onClick={logout} className="h-10 rounded-full px-5 text-sm pillGhost">
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS (real buttons, not links-that-look-like-text) */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="h-10 w-10 rounded-xl border border-white/10 bg-black/30" alt="broTher collecTive" />
              <div>
                <div className="text-lg font-semibold">Request Support</div>
                <div className="text-sm muted">Resources • legal • medical • other</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/members/support" className="h-11 rounded-full px-6 grid place-items-center text-sm pill">
                Open Support Form
              </Link>
              <div className="h-11 rounded-full px-6 grid place-items-center text-sm pillGhost">
                Goes to admin inbox
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-black/30 grid place-items-center">
                <span className="text-xs muted2">GM</span>
              </div>
              <div>
                <div className="text-lg font-semibold">Community</div>
                <div className="text-sm muted">GroupMe for now. Portal chat later.</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="h-11 rounded-full px-6 grid place-items-center text-sm pill"
              >
                Open GroupMe
              </a>
              <div className="h-11 rounded-full px-6 grid place-items-center text-sm pillGhost">
                Chat: coming soon
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <img src="/broTportal.png" className="h-10 w-10 rounded-xl border border-white/10 bg-black/30" alt="broT" />
              <div>
                <div className="text-lg font-semibold">broT Lounge</div>
                <div className="text-sm muted">Rooms are secondary. Click opens. No auto-join.</div>
              </div>
            </div>

            <div className="mt-4">
              <Link href="/members/rooms" className="h-11 rounded-full px-6 inline-grid place-items-center text-sm pill">
                Enter Lounge
              </Link>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <img src="/brobot.png" className="h-10 w-10 rounded-xl border border-white/10 bg-black/30" alt="broBOT" />
              <div>
                <div className="text-lg font-semibold">broBOT</div>
                <div className="text-sm muted">Space-mode companion. (Coming soon.)</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/members/brobot" className="h-11 rounded-full px-6 grid place-items-center text-sm pillGhost">
                Open broBOT
              </Link>
              <div className="h-11 rounded-full px-6 grid place-items-center text-sm pillGhost">
                Portal-native later
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs muted2">
          Quiet by design. Presence over performance.
        </div>
      </div>
    </div>
  );
}
