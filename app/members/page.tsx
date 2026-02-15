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
        /* Remove ugly default link styling */
        a { text-decoration: none; color: inherit; }

        /* Background glow */
        .bgGlow {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .65;
          background:
            radial-gradient(55% 55% at 28% 18%, rgba(90,170,255,0.14), transparent 60%),
            radial-gradient(55% 55% at 78% 30%, rgba(255,90,200,0.10), transparent 60%),
            radial-gradient(55% 55% at 50% 80%, rgba(90,170,255,0.06), transparent 60%);
        }

        /* Pulse */
        @keyframes broTPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(90,170,255,0)); opacity: 1; }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 18px rgba(90,170,255,0.28)); opacity: .98; }
        }
        .broT-pulse { animation: broTPulse 2.8s ease-in-out infinite; }

        /* Surfaces */
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(80,170,255,0.06);
          border-radius: 18px;
        }

        .tile {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
        }

        /* Buttons */
        .btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px;
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .btn:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.24); background: rgba(255,255,255,0.08); }

        .btnPrimary {
          background: #ffffff;
          color: #000000;
          border: none;
        }

        .muted { color: rgba(255,255,255,0.72); }
        .dim { color: rgba(255,255,255,0.55); }
      `}</style>

      <div className="bgGlow" />

      {/* Layout: sidebar + content (stacks on mobile) */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="glass p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* THIS is the only logo image. It is small. */}
                <div className="broT-pulse shrink-0">
                  <img
                    src="/broTportal.png"
                    alt="broT Members Portal"
                    className="h-10 w-10 rounded-2xl border border-white/10 bg-black/30"
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">broT Members Portal</div>
                  <div className="text-xs muted mt-0.5">Built on presence, not noise.</div>
                  <div className="text-xs dim mt-0.5">Brotherhood without performance.</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] dim">
                  Role: <span className="text-white">{role}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {/* Primary */}
              <Link href="/members/support" className="btn btnPrimary h-11 px-4 grid place-items-center text-sm font-medium">
                Request Support
              </Link>

              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="btn h-11 px-4 grid place-items-center text-sm"
              >
                Open GroupMe
              </a>

              <Link href="/members/forms" className="btn h-11 px-4 grid place-items-center text-sm">
                Forms (Google for now)
              </Link>

              {/* Rooms (secondary) */}
              <div className="mt-2 text-xs dim">Rooms (secondary)</div>

              <a
                href="https://meet.jit.si/SpaceToLand-broThercollecTive"
                target="_blank"
                rel="noreferrer"
                className="btn h-11 px-4 grid place-items-center text-sm"
              >
                Meeting Room
              </a>

              <a
                href="https://meet.jit.si/ChillRoom1"
                target="_blank"
                rel="noreferrer"
                className="btn h-11 px-4 grid place-items-center text-sm"
              >
                Chill Room 1
              </a>

              <a
                href="https://meet.jit.si/ChillRoom2"
                target="_blank"
                rel="noreferrer"
                className="btn h-11 px-4 grid place-items-center text-sm"
              >
                Chill Room 2
              </a>

              <a
                href="https://meet.jit.si/broTAdminOnly"
                target="_blank"
                rel="noreferrer"
                className="btn h-11 px-4 grid place-items-center text-sm"
              >
                Admin Only Room
              </a>

              {/* Admin */}
              {isAdmin ? (
                <Link href="/admin/inbox" className="btn h-11 px-4 grid place-items-center text-sm">
                  Admin Inbox
                </Link>
              ) : null}

              <button onClick={logout} className="btn h-11 px-4 text-sm">
                Log out
              </button>
            </div>

            <div className="mt-4 text-[11px] dim">
              Nothing auto-joins. Nothing is recorded.
              <div className="text-white/70">Quiet by design.</div>
            </div>
          </aside>

          {/* Main content */}
          <main className="grid gap-4">
            <section className="tile p-5">
              <div className="text-lg font-semibold">Request Support</div>
              <div className="mt-2 text-sm muted">
                Resources, legal, medical, or other. Goes to the admin inbox.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/members/support" className="btn btnPrimary h-11 px-4 grid place-items-center text-sm font-medium">
                  Open Support Form
                </Link>
                <div className="h-11 px-4 grid place-items-center text-xs dim border border-white/10 bg-black/25 rounded-xl">
                  resources • legal • medical • other
                </div>
              </div>
            </section>

            <section className="tile p-5">
              <div className="text-lg font-semibold">Community</div>
              <div className="mt-2 text-sm muted">
                GroupMe for now. Portal chat later — inside the portal, not widget chaos.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                  target="_blank"
                  rel="noreferrer"
                  className="btn h-11 px-4 grid place-items-center text-sm"
                >
                  Open GroupMe
                </a>
                <div className="h-11 px-4 grid place-items-center text-xs dim border border-white/10 bg-black/25 rounded-xl">
                  chat: coming soon
                </div>
              </div>
            </section>

            <section className="tile p-5">
              <div className="text-lg font-semibold">broBOT</div>
              <div className="mt-2 text-sm muted">
                Space-mode companion for grounding, guidance, and routing.
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4 text-sm muted">
                Coming soon: broBOT inside the portal (not a widget mess).
              </div>
              <div className="mt-4">
                <span className="btn h-11 px-4 inline-grid place-items-center text-sm dim bg-black/20">
                  Open broBOT (soon)
                </span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
