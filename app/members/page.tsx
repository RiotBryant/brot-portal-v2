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
      {/* Local CSS for the pulse (no tailwind config needed) */}
      <style>{`
        @keyframes broTPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(90,170,255,0)); opacity: 1; }
          50% { transform: scale(1.035); filter: drop-shadow(0 0 18px rgba(90,170,255,0.35)); opacity: 0.98; }
        }
        .broT-pulse { animation: broTPulse 2.8s ease-in-out infinite; }
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
        .btnPrimary {
          background: #ffffff;
          color: #000000;
          border: none;
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-10">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="broT-pulse">
              {/* Put broTportal.png inside /public */}
              <img
                src="/broTportal.png"
                alt="broT Members Portal"
                className="h-16 w-16 rounded-2xl"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                broT Members Portal
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Built on presence, not noise. Brotherhood without performance.
              </p>
              <p className="mt-1 text-sm text-white/60">
                Nothing auto-joins. Nothing is recorded. You’re safe.
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/60">Role: <span className="text-white">{role}</span></div>
            <button
              onClick={logout}
              className="mt-2 h-9 rounded-xl px-3 text-sm btn"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {/* Support */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Request Support</h2>
              {isAdmin ? (
                <Link href="/admin/inbox" className="text-xs text-white/70 hover:text-white">
                  Admin Inbox →
                </Link>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-white/70">
              Resources, legal, medical, or something personal. This goes to the admin inbox.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/members/support" className="h-11 rounded-xl px-4 grid place-items-center text-sm btn btnPrimary">
                Open Support Form
              </Link>
              <div className="h-11 rounded-xl px-4 grid place-items-center text-sm text-white/60 border border-white/10 bg-black/30">
                Categories: resources • legal • medical • other
              </div>
            </div>
          </div>

          {/* Community */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Community</h2>
            <p className="mt-2 text-sm text-white/70">
              GroupMe for now. Portal chat later — inside the portal, not a widget mess.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="h-11 rounded-xl px-4 grid place-items-center text-sm btn"
              >
                Open GroupMe
              </a>

              <div className="h-11 rounded-xl px-4 grid place-items-center text-sm text-white/60 border border-white/10 bg-black/30">
                Chat: coming soon
              </div>
            </div>
          </div>

          {/* Rooms (secondary) */}
          <div className="glass rounded-2xl p-6 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Rooms</h2>
              <p className="text-xs text-white/55">Secondary on purpose.</p>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Click to open. No auto-join.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <a href="https://meet.jit.si/SpaceToLand-broThercollecTive" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:border-white/20 transition">
                <div className="text-sm font-medium">Meeting Room</div>
                <div className="mt-2 text-xs text-white/60">Opens in new tab</div>
              </a>

              <a href="https://meet.jit.si/ChillRoom1" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:border-white/20 transition">
                <img src="/chill-room-1.png" className="h-10 w-auto mb-2 opacity-95" alt="Chill Room 1" />
                <div className="text-sm font-medium">Chill Room 1</div>
              </a>

              <a href="https://meet.jit.si/ChillRoom2" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:border-white/20 transition">
                <img src="/chill-room-2.png" className="h-10 w-auto mb-2 opacity-95" alt="Chill Room 2" />
                <div className="text-sm font-medium">Chill Room 2</div>
              </a>

              <a href="https://meet.jit.si/broTAdminOnly" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:border-white/20 transition">
                <div className="text-sm font-medium">Admin Only</div>
                <div className="mt-2 text-xs text-white/60">Locked by trust</div>
              </a>
            </div>
          </div>

          {/* Forms */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Forms</h2>
            <p className="mt-2 text-sm text-white/70">
              Google Forms for now. Native portal forms after launch.
            </p>
            <div className="mt-4">
              <Link href="/members/forms" className="h-11 rounded-xl px-4 inline-grid place-items-center text-sm btn">
                Open Forms
              </Link>
            </div>
          </div>

          {/* broBOT */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <img
                src="/brobot.png"
                alt="broBOT"
                className="h-12 w-12 rounded-2xl border border-white/10 bg-black/30"
              />
              <div>
                <h2 className="text-lg font-semibold">broBOT</h2>
                <p className="text-sm text-white/70">
                  Space-mode companion for grounding, guidance, and routing.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
              Coming soon: broBOT inside the portal (not a widget mess).
            </div>

            {/* If you later build the route, this becomes a Link */}
            <div className="mt-4">
              <span className="h-11 rounded-xl px-4 inline-grid place-items-center text-sm text-white/50 border border-white/10 bg-black/20">
                Open broBOT (soon)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-white/45">
          Quiet by design. Presence over performance.
        </div>
      </div>
    </div>
  );
}
