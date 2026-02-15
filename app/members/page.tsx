"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function MembersPortalPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("member");
  const [username, setUsername] = useState<string>("member");

  const isAdmin = useMemo(() => role === "admin" || role === "superadmin", [role]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
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

      setRole(r?.role ?? "member");

      // username label
      const { data: p } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("user_id", uid)
        .maybeSingle();

      const label = p?.display_name || p?.username || "member";
      setUsername(label);

      setLoading(false);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const baseCSS = `
    :root { color-scheme: dark; }
    .page{
      min-height: 100vh;
      background: #07070b;
      color: white;
      padding: 24px;
    }
    .shell{
      max-width: 1100px;
      margin: 0 auto;
    }
    .topbar{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:16px;
      margin-bottom: 16px;
    }
    .brand h1{
      margin:0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand p{
      margin:6px 0 0;
      color: rgba(255,255,255,0.55);
      font-size: 12px;
    }
    .topActions{
      display:flex;
      gap:10px;
      align-items:center;
    }
    .pillBtn{
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.9);
      padding: 10px 14px;
      font-size: 13px;
      text-decoration: none;
      transition: transform .12s ease, background .12s ease, border-color .12s ease;
      white-space: nowrap;
    }
    .pillBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
    .pillBtnPrimary{
      background: rgba(255,255,255,0.10);
      border-color: rgba(255,255,255,0.18);
    }

    .hero{
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,0.10);
      background: radial-gradient(1200px 420px at 20% 35%, rgba(80,170,255,0.20), rgba(0,0,0,0.0)),
                  radial-gradient(900px 420px at 85% 50%, rgba(255,120,200,0.14), rgba(0,0,0,0.0)),
                  rgba(255,255,255,0.04);
      padding: 18px 18px 16px;
      box-shadow: 0 0 60px rgba(80,170,255,0.06);
      margin-bottom: 18px;
    }
    .heroRow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      flex-wrap: wrap;
    }
    .chipRow{
      display:flex;
      gap:10px;
      flex-wrap: wrap;
      align-items:center;
    }
    .chip{
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(0,0,0,0.25);
      padding: 8px 10px;
      font-size: 12px;
      color: rgba(255,255,255,0.70);
    }
    .chip b{ color: rgba(255,255,255,0.92); font-weight: 700; }
    .heroTitle{
      margin: 12px 0 0;
      font-size: 56px;
      line-height: 1.02;
      font-weight: 900;
      letter-spacing: -0.03em;
    }
    .heroButtons{
      display:flex;
      gap:10px;
      flex-wrap: wrap;
    }
    .cta{
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 13px;
      text-decoration:none;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.90);
      transition: transform .12s ease, background .12s ease, border-color .12s ease;
      white-space: nowrap;
      display:inline-flex;
      align-items:center;
      gap:8px;
    }
    .cta:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
    .ctaPrimary{
      background: #ffffff;
      color: #000000;
      border: none;
    }

    .sectionLabel{
      margin: 14px 0 10px;
      font-size: 12px;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.06em;
      text-transform: none;
    }

    .grid{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 900px){
      .grid{ grid-template-columns: 1fr; }
      .heroTitle{ font-size: 44px; }
    }

    .card{
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.04);
      padding: 18px;
      box-shadow: 0 0 50px rgba(0,0,0,0.35);
    }
    .cardHeader{ margin-bottom: 12px; }
    .cardTitle{
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .cardSub{
      margin-top: 6px;
      font-size: 12px;
      color: rgba(255,255,255,0.50);
    }
    .cardDesc{
      margin-top: 8px;
      font-size: 13px;
      color: rgba(255,255,255,0.70);
    }
    .cardMeta{
      margin-top: 8px;
      font-size: 12px;
      color: rgba(255,255,255,0.45);
    }

    .cardActions{
      display:flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }

    .btn{
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 13px;
      text-decoration:none;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.90);
      transition: transform .12s ease, background .12s ease, border-color .12s ease;
      display:inline-flex;
      align-items:center;
      gap:8px;
      white-space: nowrap;
      cursor: pointer;
    }
    .btn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
    .btnPrimary{
      background: #ffffff;
      color:#000;
      border:none;
    }
    .btnGhost{
      background: rgba(255,255,255,0.04);
    }
    .btnDisabled{
      opacity: .55;
      cursor:not-allowed;
      pointer-events:none;
    }

    .bubbleRow{
      display:flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    .bubble{
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 13px;
      text-decoration:none;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.90);
      transition: transform .12s ease, background .12s ease, border-color .12s ease;
      display:inline-flex;
      align-items:center;
      gap:8px;
      white-space: nowrap;
    }
    .bubble:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }

    .footerBar{
      margin-top: 18px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .footerLeft, .footerRight{
      display:flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items:center;
    }
    .footerChip{
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      padding: 10px 14px;
      font-size: 13px;
      color: rgba(255,255,255,0.85);
      text-decoration:none;
      display:inline-flex;
      align-items:center;
      gap: 10px;
    }
    .avatarDot{
      width: 22px;
      height: 22px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.08);
      display:inline-grid;
      place-items:center;
      font-size: 12px;
      font-weight: 800;
      color: rgba(255,255,255,0.85);
    }
  `;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{baseCSS}</style>

      {/* Top bar */}
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <h1>broT Members Portal</h1>
            <p>Quiet by design • presence over performance</p>
          </div>

          <div className="topActions">
            {isAdmin ? (
              <Link className="pillBtn pillBtnPrimary" href="/members/admin/inbox">
                Admin Inbox
              </Link>
            ) : null}

            <button className="pillBtn" onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="hero">
          <div className="heroRow">
            <div className="chipRow">
              <div className="chip">
                Role: <b>{role}</b>
              </div>
              <div className="chip">Nothing auto-joins</div>
              <div className="chip">Nothing is recorded</div>
            </div>

            <div className="heroButtons">
              <Link className="cta ctaPrimary" href="/members/support">
                Request Support
              </Link>
              <Link className="cta" href="/members/lounge">
                Enter Lounge
              </Link>
              <Link className="cta" href="/members/forms">
                Forms
              </Link>
            </div>
          </div>

          <div className="heroTitle">Built for Brotherhood.</div>
        </div>

        <div className="sectionLabel">Quick Actions</div>

        {/* Cards */}
        <div className="grid">
          {/* Support */}
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
              <Link className="btn btnGhost" href="/members/inbox">
                View Inbox
              </Link>
            </div>
          </div>

          {/* broCHAT (Community) */}
          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">broCHAT</div>
              <div className="cardSub">Community</div>
              <div className="cardDesc">Group chat in real time. Keep it intentional.</div>
              <div className="cardMeta">members-only channel</div>
            </div>

            <div className="cardActions">
              <Link className="btn btnPrimary" href="/members/chat">
                Open broChAT →
              </Link>
              <a
                className="btn btnGhost"
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
              >
                Open GroupMe
              </a>
              <Link className="btn btnGhost" href="/members/inbox">
                DM Inbox
              </Link>
            </div>
          </div>

          {/* broLOUNGE (Rooms) */}
          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">broLOUNGE</div>
              <div className="cardSub">Live rooms</div>
              <div className="cardDesc">Click a room to enter. No auto-join.</div>
              <div className="cardMeta">choose your door</div>
            </div>

            <div className="bubbleRow">
              <Link className="bubble" href="/members/room/chill-room-1">
                Chill Room 1
              </Link>
              <Link className="bubble" href="/members/room/chill-room-2">
                Chill Room 2
              </Link>
              <Link className="bubble" href="/members/room/brot-meeting">
                broT Meeting
              </Link>
              <Link className="bubble" href="/members/room/admin-meeting-room">
                Admin Meeting Room
              </Link>
            </div>

            <div className="cardActions">
              <Link className="btn btnPrimary" href="/members/lounge">
                Enter Lounge
              </Link>
              <Link className="btn btnGhost" href="/members/rooms">
                View All Rooms
              </Link>
            </div>
          </div>

          {/* broBOT */}
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

        {/* Bottom bar (leave as-is) */}
        <div className="footerBar">
          <div className="footerLeft">
            <Link className="footerChip" href="/members/support">
              Support
            </Link>
            <Link className="footerChip" href="/members/lounge">
              Lounge
            </Link>
            <Link className="footerChip" href="/members/forms">
              Forms
            </Link>
            <a
              className="footerChip"
              href="https://groupme.com/join_group/113145463/Wxy8CAFk"
              target="_blank"
              rel="noreferrer"
            >
              GroupMe
            </a>
          </div>

          <div className="footerRight">
            <Link className="footerChip" href="/members/directory">
              Directory
            </Link>
            <span className="footerChip">
              <span className="avatarDot">{(username || "m").slice(0, 1).toUpperCase()}</span>
              {username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
