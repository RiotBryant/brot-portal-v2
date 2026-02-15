"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

function initials(name?: string | null) {
  const s = (name ?? "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function MembersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("member");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      setRole(r?.role ?? "member");

      // profile fetch (safe if columns exist)
      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", uid)
        .maybeSingle();

      setProfile((p as any) ?? { id: uid, username: null, avatar_url: null });
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

  const displayName = profile?.username?.trim() || "Member";

  return (
    <div className="min-h-screen text-white portalBg">
      <style>{`
        .portalBg{
          background:
            radial-gradient(1100px 600px at 18% 78%, rgba(0,210,255,0.16), transparent 60%),
            radial-gradient(900px 600px at 82% 38%, rgba(255,60,210,0.14), transparent 62%),
            radial-gradient(800px 520px at 60% 92%, rgba(140,120,255,0.10), transparent 60%),
            #07070b;
        }
        .glass{
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }
        .chip{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .btn{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          transition: transform .12s ease, border-color .12s ease, background .12s ease, box-shadow .12s ease;
          user-select: none;
        }
        .btn:hover{
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 4px rgba(120,190,255,0.06);
        }
        .btnPrimary{
          background: #ffffff;
          color: #000000;
          border: none;
          box-shadow: 0 10px 40px rgba(0,0,0,0.35);
        }
        .btnPrimary:hover{
          box-shadow: 0 0 0 4px rgba(120,190,255,0.12), 0 10px 45px rgba(0,0,0,0.38);
        }
        .dock{
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 16px;
          width: min(680px, calc(100% - 22px));
          z-index: 50;
          padding: 10px;
          border-radius: 22px;
          background: rgba(10,10,14,0.55);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(14px);
        }
        .dockGrid{
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 520px){
          .dockGrid{ grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .dockHideOnMobile{ display: none; }
        }
        .dockBtn{
          height: 42px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 12px;
          letter-spacing: .2px;
        }
        .avatarChip{
          height: 42px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 10px;
          font-size: 12px;
        }
        .avatar{
          height: 26px;
          width: 26px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.35);
          display: grid;
          place-items: center;
          overflow: hidden;
          flex: 0 0 auto;
        }
        .fadeInUp{
          animation: fadeInUp 220ms ease-out both;
        }
        @keyframes fadeInUp{
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0px); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-10 pb-28">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 fadeInUp">
          <div>
            <div className="text-sm font-semibold">broT Members Portal</div>
            <div className="text-xs text-white/60">
              Quiet by design • presence over performance
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link
                href="/admin/inbox"
                className="h-10 rounded-2xl px-4 grid place-items-center text-sm btn"
              >
                Admin Inbox
              </Link>
            ) : null}

            <button
              onClick={logout}
              className="h-10 rounded-2xl px-4 text-sm btn"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-6 glass rounded-[28px] p-7 md:p-10 fadeInUp">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip rounded-full px-3 py-1 text-xs text-white/80">
              Role: <span className="text-white">{role}</span>
            </span>
            <span className="chip rounded-full px-3 py-1 text-xs text-white/70">
              Nothing auto-joins
            </span>
            <span className="chip rounded-full px-3 py-1 text-xs text-white/70">
              Nothing is recorded
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Built for Brotherhood.
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/members/support"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn btnPrimary"
              >
                Request Support
              </Link>
              <Link
                href="/members/rooms"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn"
              >
                Enter Lounge
              </Link>
              <Link
                href="/members/forms"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn"
              >
                Forms
              </Link>
            </div>
          </div>
        </div>

        {/* Widgets */}
        <div className="mt-7 grid gap-4 md:grid-cols-2 fadeInUp">
          {/* Support widget */}
          <div className="glass rounded-[24px] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Support</h2>
              {isAdmin ? (
                <Link
                  href="/admin/inbox"
                  className="h-9 rounded-2xl px-3 grid place-items-center text-sm btn"
                >
                  View Inbox
                </Link>
              ) : null}
            </div>

            <div className="mt-2 text-sm text-white/70">
              Private request → goes to admin inbox.
            </div>
            <div className="mt-2 text-xs text-white/60">
              resources • legal • medical • other
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/members/support"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn btnPrimary"
              >
                Open Support Form
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin/inbox"
                  className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn"
                >
                  Admin Inbox
                </Link>
              ) : null}
            </div>
          </div>

          {/* Community widget */}
          <div className="glass rounded-[24px] p-6">
            <h2 className="text-lg font-semibold">Community</h2>
            <div className="mt-2 text-sm text-white/70">
              GroupMe for now. Portal chat later.
            </div>
            <div className="mt-2 text-xs text-white/60">temporary channel</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn btnPrimary"
              >
                Open GroupMe
              </a>
              <div className="h-11 rounded-2xl px-5 grid place-items-center text-sm text-white/60 border border-white/10 bg-black/30">
                Chat: coming soon
              </div>
            </div>
          </div>

          {/* Lounge widget */}
          <div className="glass rounded-[24px] p-6">
            <h2 className="text-lg font-semibold">broT Lounge</h2>
            <div className="mt-2 text-sm text-white/70">
              Rooms are secondary on purpose. Click opens. No auto-join.
            </div>
            <div className="mt-2 text-xs text-white/60">safe entry</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/members/rooms"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn btnPrimary"
              >
                Enter Lounge
              </Link>
              <Link
                href="/members/rooms/weekly-meeting"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn"
              >
                Weekly Meeting
              </Link>
            </div>
          </div>

          {/* broBOT widget */}
          <div className="glass rounded-[24px] p-6">
            <h2 className="text-lg font-semibold">broBOT</h2>
            <div className="mt-2 text-sm text-white/70">
              Grounding • guidance • routing
            </div>
            <div className="mt-2 text-xs text-white/60">coming soon</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/members/brobot"
                className="h-11 rounded-2xl px-5 grid place-items-center text-sm btn btnPrimary"
              >
                Ping broBOT
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dock */}
      <div className="dock">
        <div className="dockGrid">
          <Link href="/members/support" className="dockBtn btn">Support</Link>
          <Link href="/members/rooms" className="dockBtn btn">Lounge</Link>
          <Link href="/members/forms" className="dockBtn btn">Forms</Link>
          <a
            href="https://groupme.com/join_group/113145463/Wxy8CAFk"
            target="_blank"
            rel="noreferrer"
            className="dockBtn btn"
          >
            GroupMe
          </a>

          <Link href="/members/directory" className="dockBtn btn">
            Directory
          </Link>

          {/* Profile chip (hides on very small screens so dock doesn’t overflow) */}
          <Link href="/members/profile" className="avatarChip btn dockHideOnMobile">
            <span className="avatar">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  style={{ height: "100%", width: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 11, opacity: 0.9 }}>
                  {initials(displayName)}
                </span>
              )}
            </span>
            <span className="text-white/85">{displayName}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
