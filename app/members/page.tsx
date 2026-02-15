"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function MembersPageV2() {
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
        @keyframes broTPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(90,170,255,0)); opacity: 1; }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 18px rgba(90,170,255,0.30)); opacity: 0.98; }
        }
        .broT-pulse { animation: broTPulse 2.9s ease-in-out infinite; }

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

        .tile {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 18px;
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .tile:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.20); background: rgba(255,255,255,0.04); }

        .muted { color: rgba(255,255,255,0.70); }
        .dim { color: rgba(255,255,255,0.55); }

        /* makes links not look like 1999 */
        a { text-decoration: none; }
      `}</style>

      {/* subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 35% 20%, rgba(90,170,255,0.12), transparent 60%), radial-gradient(60% 60% at 70% 30%, rgba(255,90,200,0.10), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="glass rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* SMALL pulsing logo (not a giant banner) */}
            <div className="broT-pulse shrink-0">
              <img
                src="/broTportal.png"
                alt="broT Members Portal"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl border border-white/10 bg-black/30"
              />
            </div>

            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-semibold tracking-tight truncate">
                broT Members Portal
              </div>
              <div className="text-sm muted mt-0.5">
                Built on presence, not noise. Brotherhood without performance.
              </div>
              <div className="text-xs dim mt-1">
                Nothing auto-joins. Nothing is recorded. You’re safe.
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs dim">
              Role: <span className="text-white">{role}</span>
            </div>
            <div className="mt-2 flex gap-2 justify-end">
              {isAdmin ? (
                <Link
                  href="/admin/inbox"
                  className="h-9 rounded-xl px-3 text-sm btn inline-grid place-items-center"
                >
                  Admin Inbox
                </Link>
              ) : null}

              <button
                onClick={logout}
                className="h-9 rounded-xl px-3 text-sm btn"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Primary actions (phone-first) */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {/* Support */}
          <div className="tile p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-base font-semibold">Request Support</div>
              <div className="text-xs dim">Private → admin inbox</div>
            </div>
            <div className="mt-2 text-sm muted">
              Resources, legal, medical, or other. Trackable and calm.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/members/support"
                className="h-10 rounded-xl px-4 inline-grid place-items-center text-sm btn"
              >
                Open Support Form
              </Link>

              <div className="h-10 rounded-xl px-4 inline-grid place-items-center text-xs dim border border-white/10 bg-black/25">
                resources • legal • medical • other
              </div>
            </div>
          </div>

          {/* Community */}
          <div className="tile p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-base font-semibold">Community</div>
              <div className="text-xs dim">GroupMe for now</div>
            </div>
            <div className="mt-2 text-sm muted">
              Portal chat later — inside the portal, not widget chaos.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded-xl px-4 inline-grid place-items-center text-sm btn"
              >
                Open GroupMe
              </a>

              <div className="h-10 rounded-xl px-4 inline-grid place-items-center text-xs dim border border-white/10 bg-black/25">
                chat: coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Rooms (secondary but still clean) */}
        <div className="mt-3 tile p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-base font-semibold">Rooms</div>
            <div className="text-xs dim">Secondary on purpose • click opens</div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="https://meet.jit.si/SpaceToLand-broThercollecTive"
              target="_blank"
              rel="noreferrer"
              className="tile p-4"
            >
              <div className="text-sm font-semibold">Meeting Room</div>
              <div className="mt-1 text-xs dim">Opens in new tab</div>
            </a>

            <a
              href="https://meet.jit.si/ChillRoom1"
              target="_blank"
              rel="noreferrer"
              className="tile p-4"
            >
              <img
                src="/chill-room-1.png"
                alt="Chill Room 1"
                className="h-7 w-auto mb-2 opacity-95"
              />
              <div className="text-sm font-semibold">Chill Room 1</div>
              <div className="mt-1 text-xs dim">No auto-join</div>
            </a>

            <a
              href="https://meet.jit.si/ChillRoom2"
              target="_blank"
              rel="noreferrer"
              className="tile p-4"
            >
              <img
                src="/chill-room-2.png"
                alt="Chill Room 2"
                className="h-7 w-auto mb-2 opacity-95"
              />
              <div className="text-sm font-semibold">Chill Room 2</div>
              <div className="mt-1 text-xs dim">No auto-join</div>
            </a>

            <a
              href="https://meet.jit.si/broTAdminOnly"
              target="_blank"
              rel="noreferrer"
              className="tile p-4"
            >
              <div className="text-sm font-semibold">Admin Only</div>
              <div className="mt-1 text-xs dim">Locked by trust</div>
            </a>
          </div>
        </div>

        {/* Forms + broBOT */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="tile p-5">
            <div className="text-base font-semibold">Forms</div>
            <div className="mt-2 text-sm muted">
              Google Forms for now. Native portal forms after launch.
            </div>
            <div className="mt-4">
              <Link
                href="/members/forms"
                className="h-10 rounded-xl px-4 inline-grid place-items-center text-sm btn"
              >
                Open Forms
              </Link>
            </div>
          </div>

          <div className="tile p-5">
            <div className="flex items-center gap-3">
              <img
                src="/brobot.png"
                alt="broBOT"
                className="h-10 w-10 rounded-2xl border border-white/10 bg-black/30"
              />
              <div className="min-w-0">
                <div className="text-base font-semibold">broBOT</div>
                <div className="text-sm muted">
                  Space-mode companion for grounding, guidance, and routing.
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4 text-sm muted">
              Coming soon: broBOT inside the portal (not a widget mess).
            </div>

            <div className="mt-4">
              <span className="h-10 rounded-xl px-4 inline-grid place-items-center text-sm dim border border-white/10 bg-black/20">
                Open broBOT (soon)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs dim">
          Quiet by design. Presence over performance.
        </div>
      </div>
    </div>
  );
}
