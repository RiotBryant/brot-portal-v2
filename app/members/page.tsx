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
        /* subtle pulse for the SMALL logo only */
        @keyframes broTPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(90,170,255,0)); opacity: 1; }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 18px rgba(90,170,255,0.35)); opacity: 0.98; }
        }
        .broT-pulse { animation: broTPulse 2.8s ease-in-out infinite; }

        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }

        .pill {
          background: rgba(255,255,255,0.92);
          color: #0a0a0d;
          border: 1px solid rgba(255,255,255,0.20);
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          font-size: 12px;
          transition: transform .12s ease, background .12s ease, opacity .12s ease;
          user-select: none;
        }
        .pill:hover { transform: translateY(-1px); background: rgba(255,255,255,0.98); }
        .pillDark {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.14);
          font-weight: 650;
          letter-spacing: .02em;
          text-transform: none;
        }
        .pillDark:hover { background: rgba(255,255,255,0.10); }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* HERO (Carrd-style) */}
        <div className="relative overflow-hidden rounded-[28px] glass">
          {/* blurred background image */}
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/broTportal.png"
              alt=""
              className="h-full w-full object-cover opacity-[0.18] blur-xl scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/85" />
          </div>

          <div className="relative px-6 py-10 sm:px-10">
            {/* top row: taglines left/right + center logo */}
            <div className="grid gap-6 sm:grid-cols-3 sm:items-center">
              <div className="text-center sm:text-left">
                <div className="text-sm text-white/80">Built on presence, not noise.</div>
                <div className="mt-2 h-px w-56 bg-white/20 mx-auto sm:mx-0" />
              </div>

              <div className="flex items-center justify-center">
                {/* SMALL logo (THIS is what pulses) */}
                <div className="broT-pulse">
                  <img
                    src="/broTportal.png"
                    alt="broT Members Portal"
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl"
                  />
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-sm text-white/80">Brotherhood without performance.</div>
                <div className="mt-2 h-px w-56 bg-white/20 mx-auto sm:ml-auto sm:mr-0" />
              </div>
            </div>

            {/* nav pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link className="pill" href="/members">Home</Link>
              <Link className="pill" href="/members/forms">Events</Link>
              <Link className="pill" href="/members/rooms">Live</Link>
              <a
                className="pill"
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
              >
                Chat
              </a>
            </div>

            {/* safety note + role + admin */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:items-center">
              <div className="text-center sm:text-left">
                <div className="text-sm text-white/80">
                  Nothing auto-joins. Nothing is recorded. You’re safe.
                </div>
                <div className="mt-2 text-xs text-white/55">
                  Quiet by design. Presence over performance.
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                <span className="pill pillDark">
                  Role: <span className="ml-2 text-white">{role}</span>
                </span>

                {isAdmin ? (
                  <Link className="pill pillDark" href="/admin/inbox">
                    Admin Inbox
                  </Link>
                ) : null}

                <button className="pill pillDark" onClick={logout}>
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS (real buttons, not dumb text links) */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-[22px] p-6">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Support"
                className="h-11 w-11 rounded-2xl border border-white/10 bg-black/30"
              />
              <div>
                <div className="text-lg font-semibold">Request Support</div>
                <div className="mt-1 text-sm text-white/70">
                  Resources • legal • medical • other
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="pill pillDark" href="/members/support">
                Open Support Form
              </Link>
            </div>
          </div>

          <div className="glass rounded-[22px] p-6">
            <div className="flex items-center gap-4">
              <img
                src="/brobot.png"
                alt="broBOT"
                className="h-11 w-11 rounded-2xl border border-white/10 bg-black/30"
              />
              <div>
                <div className="text-lg font-semibold">broBOT</div>
                <div className="mt-1 text-sm text-white/70">
                  Coming soon — inside the portal (not a widget mess).
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="pill pillDark opacity-70 cursor-not-allowed">
                Open broBOT (soon)
              </span>
            </div>
          </div>

          <div className="glass rounded-[22px] p-6">
            <div className="flex items-center gap-4">
              <img
                src="/brot-lounge.png"
                alt="broT Lounge"
                className="h-11 w-11 rounded-2xl border border-white/10 bg-black/30"
              />
              <div>
                <div className="text-lg font-semibold">broT Lounge</div>
                <div className="mt-1 text-sm text-white/70">
                  Rooms are secondary. Click opens — no auto-join.
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link className="pill pillDark" href="/members/rooms">
                Enter broT Lounge
              </Link>
            </div>
          </div>

          <div className="glass rounded-[22px] p-6">
            <div className="flex items-center gap-4">
              <img
                src="/broTportal.png"
                alt="Forms"
                className="h-11 w-11 rounded-2xl border border-white/10 bg-black/30"
              />
              <div>
                <div className="text-lg font-semibold">Forms</div>
                <div className="mt-1 text-sm text-white/70">
                  Google Forms for now. Native portal forms after launch.
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link className="pill pillDark" href="/members/forms">
                Open Forms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
