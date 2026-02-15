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

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

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
      <div className="page">
        <style>{baseCSS}</style>
        <div className="center">
          <div className="muted">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{baseCSS}</style>

      {/* Top bar */}
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <div className="title">broT Members Portal</div>
            <div className="subtitle">Quiet by design • presence over performance</div>
          </div>

          <div className="topActions">
            {isAdmin ? (
              <Link className="chipBtn" href="/members/admin/inbox">
                Admin Inbox
              </Link>
            ) : null}

            <button className="chipBtn" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="container">
        <div className="hero">
          <div className="heroLeft">
            <div className="pills">
              <span className="pill">
                Role: <b>{role}</b>
              </span>
              <span className="pill">Nothing auto-joins</span>
              <span className="pill">Nothing is recorded</span>
            </div>

            <h1 className="heroH1">Built for Brotherhood.</h1>
          </div>

          <div className="heroRight">
            <Link className="btn btnPrimary" href="/members/support">
              Request Support
            </Link>
            <Link className="btn" href="/members/lounge">
              Enter Lounge
            </Link>
            <Link className="btn" href="/members/forms">
              Forms
            </Link>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="container">
        <div className="sectionLabel">Quick Actions</div>

        <div className="grid">
          {/* Support widget */}
          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">Support</div>
              <div className="cardDesc">Private request → goes to admin inbox.</div>
              <div className="cardMeta">resources • legal • medical • other</div>
            </div>

            <div className="cardActions">
              <Link className="btn btnPrimary" href="/members/support">
                Open Support Form
              </Link>
              {isAdmin ? (
                <Link className="btn" href="/members/inbox">
                  View Inbox
                </Link>
              ) : null}
            </div>
          </div>

          {/* Community widget */}
<div className="card">
  <div className="cardHeader">
    <div className="cardTitle">Community</div>
    <div className="cardDesc">Live members chat is now active.</div>
    <div className="cardMeta">members-only channel</div>
  </div>

  <div className="cardActions">
    <a
      className="btn"
      href="https://groupme.com/join_group/113145463/Wxy8CAFk"
      target="_blank"
      rel="noreferrer"
    >
      Open GroupMe
    </a>

    <Link
      href="/members/chat"
      className="btn btnPrimary"
    >
      Open broChAT →
    </Link>
  </div>
</div>


          {/* Lounge widget */}
          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">broT Lounge</div>
              <div className="cardDesc">Click opens. No auto-join.</div>
              <div className="cardMeta">safe entry</div>
            </div>

            <div className="cardActions">
              <Link className="btn btnPrimary" href="/members/lounge">
                Enter Lounge
              </Link>
              <Link className="btn" href="/members/room/weekly">
                Weekly Meeting
              </Link>
            </div>
          </div>

          {/* broBOT widget */}
          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">broBOT</div>
              <div className="cardDesc">Grounding • guidance • routing</div>
              <div className="cardMeta">coming soon</div>
            </div>

            <div className="cardActions">
              <Link className="btn btnPrimary" href="/members/brobot">
                Signal broBOT
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom dock */}
      <div className="dockWrap">
        <div className="dock">
          <div className="dockLeft">
            <Link className="dockBtn" href="/members/support">Support</Link>
            <Link className="dockBtn" href="/members/lounge">Lounge</Link>
            <Link className="dockBtn" href="/members/forms">Forms</Link>
            <a
              className="dockBtn"
              href="https://groupme.com/join_group/113145463/Wxy8CAFk"
              target="_blank"
              rel="noreferrer"
            >
              GroupMe
            </a>
          </div>

          <div className="dockRight">
            <Link className="dockBtn" href="/members/directory">Directory</Link>

            <Link className="profileBtn" href="/members/profile">
              <span className="avatar">{initial}</span>
              <span className="profileName">{displayLabel}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const baseCSS = `
  :root { color-scheme: dark; }
  html, body { margin: 0; padding: 0; background: #07070b; color: #fff; }
  * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }

  .page { min-height: 100vh; background: #07070b; }
  .container { width: min(1100px, calc(100% - 28px)); margin: 0 auto; }

  .center { min-height: 100vh; display: grid; place-items: center; }
  .muted { opacity: .70; font-size: 14px; }

  .topbar {
    padding: 22px 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  .title { font-size: 18px; font-weight: 700; }
  .subtitle { margin-top: 4px; font-size: 13px; opacity: .65; }

  .topActions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
  .chipBtn {
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.06);
    color: rgba(255,255,255,.92);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    cursor: pointer;
    transition: transform .12s ease, background .12s ease, border-color .12s ease;
  }
  .chipBtn:hover { transform: translateY(-1px); background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.20); }

  .hero {
    margin-top: 10px;
    border-radius: 26px;
    padding: 22px;
    border: 1px solid rgba(255,255,255,.10);
    background:
      radial-gradient(900px 420px at 15% 25%, rgba(80,170,255,.22), transparent 60%),
      radial-gradient(900px 420px at 85% 30%, rgba(255,80,210,.16), transparent 60%),
      radial-gradient(900px 420px at 50% 90%, rgba(40,255,200,.10), transparent 60%),
      rgba(255,255,255,.03);
    box-shadow: 0 0 90px rgba(0,0,0,.55);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
  }

  .pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.26);
    color: rgba(255,255,255,.82);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  .pill b { color: #fff; }

  .heroH1 {
    margin: 14px 0 0 0;
    font-size: 44px;
    letter-spacing: -0.02em;
    font-weight: 800;
  }

  .heroRight { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

  .sectionLabel { margin-top: 18px; margin-bottom: 10px; font-size: 13px; opacity: .65; }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding-bottom: 26px;
  }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .heroH1 { font-size: 38px; } }

  .card {
    border-radius: 26px;
    padding: 18px;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(255,255,255,.035);
    box-shadow: 0 0 70px rgba(0,0,0,.45);
  }
  .cardTitle { font-size: 18px; font-weight: 800; }
  .cardDesc { margin-top: 8px; font-size: 14px; opacity: .72; }
  .cardMeta { margin-top: 8px; font-size: 12px; opacity: .55; }
  .cardActions { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; }

  .btn {
    height: 44px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.06);
    color: rgba(255,255,255,.95);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: transform .12s ease, background .12s ease, border-color .12s ease;
    user-select: none;
    cursor: pointer;
    font-size: 14px;
  }
  .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.20); }

  .btnPrimary { background: #fff; color: #000; border: none; }
  .btnDisabled { opacity: .55; cursor: default; pointer-events: none; }

  .dockWrap { position: sticky; bottom: 18px; z-index: 20; padding: 10px 0 18px; }
  .dock {
    width: min(1100px, calc(100% - 28px));
    margin: 0 auto;
    padding: 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.10);
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }
  .dockLeft, .dockRight { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

  .dockBtn {
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.06);
    color: rgba(255,255,255,.92);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: transform .12s ease, background .12s ease, border-color .12s ease;
  }
  .dockBtn:hover { transform: translateY(-1px); background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.20); }

  .profileBtn {
    height: 40px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.06);
    color: rgba(255,255,255,.92);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .avatar {
    width: 28px; height: 28px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(0,0,0,.30);
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
  }
  .profileName {
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
  }
`;
