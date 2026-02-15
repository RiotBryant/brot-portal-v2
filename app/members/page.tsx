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
        .glass {
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 90px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }
        .card {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
          transition: transform .14s ease, border-color .14s ease, background .14s ease;
        }
        .card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.20); background: rgba(0,0,0,0.45); }
        .btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .btn:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.08); }
        .btnPrimary {
          background: rgba(255,255,255,0.92);
          color: #0b0b12;
          border: 1px solid rgba(255,255,255,0.65);
        }
        .muted { color: rgba(255,255,255,0.70); }
        .muted2 { color: rgba(255,255,255,0.55); }
        .hairline { height: 1px; background: rgba(255,255,255,0.10); }
        .tag {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .glow {
          position: absolute;
          inset: -220px;
          background:
            radial-gradient(55% 55% at 30% 35%, rgba(92,177,255,0.18), transparent 60%),
            radial-gradient(55% 55% at 70% 35%, rgba(255,90,200,0.14), transparent 60%),
            radial-gradient(65% 65% at 50% 70%, rgba(120,255,240,0.10), transparent 60%);
          filter: blur(28px);
          opacity: 0.95;
          pointer-events: none;
        }
      `}</style>

      {/* Background glow */}
      <div className="relative">
        <div className="glow" />
      </div>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#07070b]/75 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-semibold tracking-tight truncate">
              broT Members Portal
            </div>
            <div className="text-xs muted2 truncate">
              Quiet by design • presence over performance
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link href="/admin/inbox" className="h-9 rounded-full px-3 text-sm grid place-items-center btn">
                Admin Inbox
              </Link>
            ) : null}

            <button onClick={logout} className="h-9 rounded-full px-3 text-sm btn">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-6 pb-24">
        {/* Hero */}
        <div className="glass rounded-[28px] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="tag rounded-full px-3 py-1 text-xs muted">
                  Role: <span className="text-white">{role}</span>
                </span>
                <span className="tag rounded-full px-3 py-1 text-xs muted">
                  Nothing auto-joins
                </span>
                <span className="tag rounded-full px-3 py-1 text-xs muted">
                  Nothing is recorded
                </span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
                Built for calm access.
              </h1>
              <p className="mt-2 text-sm muted max-w-2xl">
                Everything here is deliberate: support routes to admins, lounge opens rooms, forms stay simple,
                and broBOT will live inside the portal later (not a widget mess).
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link href="/members/support" className="h-11 rounded-full px-6 grid place-items-center text-sm btnPrimary">
                Request Support
              </Link>
              <Link href="/members/rooms" className="h-11 rounded-full px-6 grid place-items-center text-sm btn">
                Enter Lounge
              </Link>
              <Link href="/members/forms" className="h-11 rounded-full px-6 grid place-items-center text-sm btn">
                Forms
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <div className="text-sm font-semibold tracking-tight">Quick Actions</div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {/* Support */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Support</div>
                  <div className="mt-1 text-sm muted">
                    Private request → goes to admin inbox.
                  </div>
                </div>
                <div className="text-xs muted2">Tracked • calm</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/members/support" className="h-11 rounded-full px-6 grid place-items-center text-sm btnPrimary">
                  Open Support Form
                </Link>
                <div className="h-11 rounded-full px-6 grid place-items-center text-sm btn">
                  resources • legal • medical • other
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Community</div>
                  <div className="mt-1 text-sm muted">
                    GroupMe for now. Portal chat later.
                  </div>
                </div>
                <div className="text-xs muted2">Temporary</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 rounded-full px-6 grid place-items-center text-sm btnPrimary"
                >
                  Open GroupMe
                </a>
                <div className="h-11 rounded-full px-6 grid place-items-center text-sm btn">
                  chat: coming soon
                </div>
              </div>
            </div>

            {/* Lounge */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">broT Lounge</div>
                  <div className="mt-1 text-sm muted">
                    Rooms are secondary on purpose. Click opens. No auto-join.
                  </div>
                </div>
                <div className="text-xs muted2">Safe entry</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/members/rooms" className="h-11 rounded-full px-6 grid place-items-center text-sm btnPrimary">
                  Enter Lounge
                </Link>
                <a
                  href="https://meet.jit.si/SpaceToLand-broThercollecTive"
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 rounded-full px-6 grid place-items-center text-sm btn"
                >
                  Weekly Meeting
                </a>
              </div>
            </div>

            {/* broBOT */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">broBOT</div>
                  <div className="mt-1 text-sm muted">
                    Grounding • guidance • routing. Portal-native later.
                  </div>
                </div>
                <div className="text-xs muted2">Coming soon</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/members/brobot" className="h-11 rounded-full px-6 grid place-items-center text-sm btn">
                  Open broBOT
                </Link>
                <div className="h-11 rounded-full px-6 grid place-items-center text-sm btn">
                  not a widget mess
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-xs muted2">
          Quiet by design. Presence over performance.
        </div>
      </div>

      {/* Mobile bottom dock (real buttons; nobody has to “click words”) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#07070b]/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-4 gap-2 text-xs">
          <Link href="/members/support" className="h-11 rounded-2xl grid place-items-center btnPrimary">
            Support
          </Link>
          <Link href="/members/rooms" className="h-11 rounded-2xl grid place-items-center btn">
            Lounge
          </Link>
          <Link href="/members/forms" className="h-11 rounded-2xl grid place-items-center btn">
            Forms
          </Link>
          <a
            href="https://groupme.com/join_group/113145463/Wxy8CAFk"
            target="_blank"
            rel="noreferrer"
            className="h-11 rounded-2xl grid place-items-center btn"
          >
            GroupMe
          </a>
        </div>
      </div>
    </div>
  );
}
