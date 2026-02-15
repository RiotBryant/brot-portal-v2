"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default function MembersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("member");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    display_name: null,
    username: null,
    avatar_url: null,
  });

  const isAdmin = useMemo(
    () => role === "admin" || role === "superadmin",
    [role]
  );

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

      // role
      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      // profile (for bottom bar)
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url")
        .eq("user_id", uid)
        .maybeSingle();

      setRole(r?.role ?? "member");
      setProfile({
        display_name: p?.display_name ?? null,
        username: p?.username ?? null,
        avatar_url: p?.avatar_url ?? null,
      });
      setLoading(false);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const displayLabel =
    profile.username?.trim() ||
    profile.display_name?.trim() ||
    "Member";

  const initial =
    (profile.display_name?.trim()?.[0] ||
      profile.username?.trim()?.[0] ||
      "M").toUpperCase();

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
        @keyframes softPulse {
          0%, 100% { opacity: 0.70; transform: scale(1); }
          50% { opacity: 0.92; transform: scale(1.02); }
        }
        .heroGlow {
          background:
            radial-gradient(900px 500px at 20% 20%, rgba(80,170,255,0.25), transparent 60%),
            radial-gradient(900px 500px at 80% 30%, rgba(255,80,210,0.18), transparent 60%),
            radial-gradient(900px 500px at 50% 90%, rgba(40,255,200,0.10), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.0));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 0 80px rgba(0,0,0,0.35);
          animation: softPulse 6s ease-in-out infinite;
        }
        .card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(0,0,0,0.35);
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: white;
          font-size: 14px;
          line-height: 1;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
          user-select: none;
        }
        .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
        .btnPrimary {
          background: #fff;
          color: #000;
          border: none;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.25);
          color: rgba(255,255,255,0.80);
          font-size: 12px;
        }
        .dock {
          position: sticky;
          bottom: 18px;
          margin-top: 22px;
          z-index: 20;
        }
        .dockInner {
          width: min(980px, calc(100% - 24px));
          margin: 0 auto;
          padding: 10px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .dockLeft, .dockRight {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .miniBtn {
          height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.92);
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
        }
        .miniBtn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
        .profileBtn {
          height: 40px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.92);
          font-size: 13px;
        }
        .avatar {
          width: 28px; height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(0,0,0,0.35);
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 12px;
        }
      `}</style>

      {/* Top bar */}
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">broT Members Portal</div>
            <div className="text-sm text-white/60">
              Quiet by design • presence over performance
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link href="/admin/inbox" className="btn">
                Admin Inbox
              </Link>
            ) : null}
            <button onClick={logout} className="btn">
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-6xl px-5 pt-6">
        <div className="heroGlow rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="pill">Role: <b style={{ color: "white" }}>{role}</b></span>
                <span className="pill">Nothing auto-joins</span>
                <span className="pill">Nothing is recorded</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                Built for Brotherhood.
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/members/support" className="btn btnPrimary">
                Request Support
              </Link>
              <Link href="/members/lounge" className="btn">
                Enter Lounge
              </Link>
              <Link href="/members/forms" className="btn">
                Forms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="mx-auto max-w-6xl px-5 pt-7 pb-8">
        <div className="text-sm text-white/60 mb-3">Quick Actions</div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Support widget */}
          <div className="card rounded-3xl p-6">
            <div className="text-lg font-semibold mb-2">Support</div>
            <div className="text-sm text-white/70">
              Private request → goes to admin inbox.
            </div>
            <div className="text-xs text-white/55 mt-2">
              resources • legal • medical • other
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/members/support" className="btn btnPrimary">
                Open Support Form
              </Link>
              {isAdmin ? (
                <Link href="/admin/inbox" className="btn">
                  View Inbox
                </Link>
              ) : null}
            </div>
          </div>

          {/* Community widget */}
          <div className="card rounded-3xl p-6">
            <div className="text-lg font-semibold mb-2">Community</div>
            <div className="text-sm text-white/70">
              GroupMe for now. Portal chat later.
            </div>
            <div className="text-xs text-white/55 mt-2">temporary channel</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="btn btnPrimary"
              >
                Open GroupMe
              </a>
              <span className="btn" style={{ opacity: 0.55, cursor: "default" }}>
                Chat: coming soon
              </span>
            </div>
          </div>

          {/* Lounge widget */}
          <div className="card rounded-3xl p-6">
            <div className="text-lg font-semibold mb-2">broT Lounge</div>
            <div className="text-sm text-white/70">
              Rooms are secondary on purpose. Click opens. No auto-join.
            </div>
            <div className="text-xs text-white/55 mt-2">safe entry</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/members/lounge" className="btn btnPrimary">
                Enter Lounge
              </Link>
              <Link href="/members/room/weekly" className="btn">
                Weekly Meeting
              </Link>
            </div>
          </div>

          {/* broBOT widget */}
          <div className="card rounded-3xl p-6">
            <div className="text-lg font-semibold mb-2">broBOT</div>
            <div className="text-sm text-white/70">
              Grounding • guidance • routing
            </div>
            <div className="text-xs text-white/55 mt-2">coming soon</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/members/brobot" className="btn btnPrimary">
                Signal broBOT
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom dock */}
        <div className="dock">
          <div className="dockInner">
            <div className="dockLeft">
              <Link href="/members/support" className="miniBtn">Support</Link>
              <Link href="/members/lounge" className="miniBtn">Lounge</Link>
              <Link href="/members/forms" className="miniBtn">Forms</Link>
              <a
                className="miniBtn"
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
              >
                GroupMe
              </a>
            </div>

            <div className="dockRight">
              <Link href="/members/directory" className="miniBtn">
                Directory
              </Link>

              <Link href="/members/profile" className="profileBtn">
                <span className="avatar">{initial}</span>
                <span style={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {displayLabel}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
