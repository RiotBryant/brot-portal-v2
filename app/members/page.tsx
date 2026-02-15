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
      {/* local CSS so you don’t need tailwind config edits */}
      <style>{`
        @keyframes broTPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(90,170,255,0)); opacity: 1; }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 22px rgba(90,170,255,0.35)); opacity: 0.98; }
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

        /* HERO: makes the logo feel like a “layer” without being a massive image */
        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            radial-gradient(60% 60% at 50% 20%, rgba(90,170,255,0.18), rgba(0,0,0,0)),
            linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.75));
        }
        .heroBg {
          position: absolute;
          inset: -40px;
          background-image: url('/broTportal.png');
          background-size: cover;
          background-position: center;
          filter: blur(0px);
          opacity: 0.26;
          transform: scale(1.08);
        }
        .heroOverlay {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(60% 60% at 50% 20%, rgba(255, 140, 245, 0.18), rgba(0,0,0,0)),
            radial-gradient(60% 60% at 30% 40%, rgba(90,170,255,0.16), rgba(0,0,0,0)),
            linear-gradient(to bottom, rgba(0,0,0,0.20), rgba(0,0,0,0.85));
        }
        .heroInner { position: relative; }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.35);
          font-size: 12px;
          color: rgba(255,255,255,0.78);
        }

        .bigButton {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: 14px 14px;
          border-radius: 16px;
          text-align: left;
        }
        .bigButton .title { font-weight: 600; font-size: 14px; }
        .bigButton .sub { margin-top: 2px; font-size: 12px; color: rgba(255,255,255,0.62); }
        .arrow { opacity: 0.55; font-size: 14px; }

        .iconChip {
          height: 44px;
          width: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.35);
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          overflow: hidden;
        }
        .iconChip img { height: 32px; width: 32px; object-fit: contain; opacity: 0.95; }

        /* responsive hero height */
        .heroH { height: 220px; }
        @media (min-width: 768px) { .heroH { height: 300px; } }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* HERO */}
        <div className={`hero heroH`}>
          <div className="heroBg" />
          <div className="heroOverlay" />
          <div className="heroInner h-full p-5 md:p-7 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="broT-pulse">
                  <img
                    src="/broTportal.png"
                    alt="broT Members Portal"
                    className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border border-white/10 bg-black/30"
                  />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight">
                    broT Members Portal
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    Built on presence, not noise. Brotherhood without performance.
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    Nothing auto-joins. Nothing is recorded. You’re safe.
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="pill">
                  <span>Role:</span>
                  <span style={{ color: "white" }}>{role}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <Link href="/admin/inbox" className="h-9 rounded-xl px-3 text-sm btn grid place-items-center">
                      Admin Inbox
                    </Link>
                  ) : null}

                  <button onClick={logout} className="h-9 rounded-xl px-3 text-sm btn">
                    Log out
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/55">
              Quiet by design. Presence over performance.
            </div>
          </div>
        </div>

        {/* LAYOUT: Side panel + content (desktop), stacked (mobile) */}
        <div className="mt-5 grid gap-4 md:grid-cols-[340px_1fr]">
          {/* LEFT PANEL (big buttons) */}
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-white/55">Quick actions</div>

            <div className="mt-3 grid gap-2">
              <Link href="/members/support" className="bigButton btn btnPrimary">
                <div className="flex items-center gap-12px gap-3">
                  <div className="iconChip" aria-hidden="true">
                    <img src="/logo.png" alt="" />
                  </div>
                  <div>
                    <div className="title">Request Support</div>
                    <div className="sub">Resources • legal • medical • other</div>
                  </div>
                </div>
                <div className="arrow">→</div>
              </Link>

              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="bigButton btn"
              >
                <div className="flex items-center gap-3">
                  <div className="iconChip" aria-hidden="true">
                    <img src="/brot-lounge.png" alt="" />
                  </div>
                  <div>
                    <div className="title">Open GroupMe</div>
                    <div className="sub">Community channel (for now)</div>
                  </div>
                </div>
                <div className="arrow">↗</div>
              </a>

              <Link href="/members/forms" className="bigButton btn">
                <div className="flex items-center gap-3">
                  <div className="iconChip" aria-hidden="true">
                    <img src="/broTportal.png" alt="" />
                  </div>
                  <div>
                    <div className="title">Forms</div>
                    <div className="sub">Google Forms for now</div>
                  </div>
                </div>
                <div className="arrow">→</div>
              </Link>

              <Link href="/members/rooms" className="bigButton btn">
                <div className="flex items-center gap-3">
                  <div className="iconChip" aria-hidden="true">
                    <img src="/chill-room-1.png" alt="" />
                  </div>
                  <div>
                    <div className="title">Enter Rooms</div>
                    <div className="sub">Secondary • click opens • no auto-join</div>
                  </div>
                </div>
                <div className="arrow">→</div>
              </Link>

              <Link href="/members/brobot" className="bigButton btn">
                <div className="flex items-center gap-3">
                  <div className="iconChip" aria-hidden="true">
                    <img src="/brobot.png" alt="" />
                  </div>
                  <div>
                    <div className="title">broBOT</div>
                    <div className="sub">Space-mode companion (coming soon)</div>
                  </div>
                </div>
                <div className="arrow">→</div>
              </Link>
            </div>

            <div className="mt-4 text-xs text-white/45">
              Everything opens by choice. Nothing watches you.
            </div>
          </div>

          {/* RIGHT CONTENT (clean cards) */}
          <div className="grid gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="text-lg font-semibold">What this is</div>
              <div className="mt-2 text-sm text-white/70">
                A private layer. Calm, simple, and intentional. Built to feel like a “back room” that’s safe —
                not loud, not performative, not complicated.
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold">Rooms are secondary</div>
                <div className="pill">Opens in a new tab</div>
              </div>

              <div className="mt-2 text-sm text-white/70">
                Clicking a room opens it. No auto-join. No surprise audio/video.
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <a className="bigButton btn" href="https://meet.jit.si/SpaceToLand-broThercollecTive" target="_blank" rel="noreferrer">
                  <div>
                    <div className="title">Meeting Room</div>
                    <div className="sub">Main meeting space</div>
                  </div>
                  <div className="arrow">↗</div>
                </a>

                <a className="bigButton btn" href="https://meet.jit.si/ChillRoom1" target="_blank" rel="noreferrer">
                  <div>
                    <div className="title">Chill Room 1</div>
                    <div className="sub">Low pressure hang</div>
                  </div>
                  <div className="arrow">↗</div>
                </a>

                <a className="bigButton btn" href="https://meet.jit.si/ChillRoom2" target="_blank" rel="noreferrer">
                  <div>
                    <div className="title">Chill Room 2</div>
                    <div className="sub">Second quiet space</div>
                  </div>
                  <div className="arrow">↗</div>
                </a>

                <a className="bigButton btn" href="https://meet.jit.si/broTAdminOnly" target="_blank" rel="noreferrer">
                  <div>
                    <div className="title">Admin Only</div>
                    <div className="sub">Locked by trust</div>
                  </div>
                  <div className="arrow">↗</div>
                </a>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="text-lg font-semibold">Support form rules</div>
              <div className="mt-2 text-sm text-white/70">
                Support requests go to the admin inbox. Categories are: resources, legal, medical, other.
                “Is this urgent?” is captured as text.
              </div>
              <div className="mt-4">
                <Link href="/members/support" className="h-11 rounded-xl px-4 inline-grid place-items-center text-sm btn btnPrimary">
                  Open Support Form
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-white/40">
          Built forward — no rework chaos.
        </div>
      </div>
    </div>
  );
}

