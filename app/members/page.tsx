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
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#07070b", color: "white" }}>
        <div style={{ opacity: 0.7, fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#07070b", color: "white" }}>
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }

        .bgGlow {
          position: fixed;
          inset: -260px;
          background:
            radial-gradient(55% 55% at 30% 35%, rgba(92,177,255,0.18), transparent 60%),
            radial-gradient(55% 55% at 70% 35%, rgba(255,90,200,0.14), transparent 60%),
            radial-gradient(65% 65% at 50% 70%, rgba(120,255,240,0.10), transparent 60%);
          filter: blur(28px);
          opacity: 0.95;
          pointer-events: none;
          z-index: 0;
        }

        .wrap { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 18px 18px 96px; }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(7,7,11,0.78);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.10);
        }

        .topbarInner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .title {
          font-weight: 650;
          letter-spacing: -0.02em;
          font-size: 16px;
          line-height: 1.2;
          margin: 0;
        }
        .sub {
          margin: 4px 0 0;
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }

        .pillRow { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.78);
          font-size: 12px;
        }

        .hero {
          margin-top: 18px;
          border-radius: 26px;
          padding: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 90px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }
        .heroH1 {
          margin: 12px 0 0;
          font-size: 30px;
          letter-spacing: -0.03em;
          line-height: 1.1;
          font-weight: 700;
        }
        .heroP {
          margin: 10px 0 0;
          font-size: 14px;
          line-height: 1.5;
          color: rgba(255,255,255,0.72);
          max-width: 760px;
        }

        .btnRow { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 10px; }

        /* REAL BUTTONS (works even if Tailwind is broken) */
        .btn {
          height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.92);
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
          user-select: none;
          white-space: nowrap;
        }
        .btn:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.09); }
        .btnPrimary {
          background: rgba(255,255,255,0.92);
          color: #0b0b12;
          border: 1px solid rgba(255,255,255,0.60);
        }
        .btnDanger { background: rgba(255,255,255,0.06); }
        .btnSmall { height: 38px; padding: 0 14px; font-size: 13px; font-weight: 600; }

        .grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 860px) {
          .hero { padding: 22px; }
          .grid { grid-template-columns: 1fr 1fr; gap: 14px; }
          .heroTop { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
        }

        .card {
          border-radius: 20px;
          padding: 16px;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
          transition: transform .14s ease, border-color .14s ease, background .14s ease;
        }
        .card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.20); background: rgba(0,0,0,0.45); }

        .cardTitle { font-size: 16px; font-weight: 700; margin: 0; }
        .cardP { margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.70); line-height: 1.45; }
        .cardMeta { margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.55); }
        .cardBtns { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 10px; }

        /* Mobile bottom dock */
        .dock {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 60;
          background: rgba(7,7,11,0.86);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,0.10);
          padding: 10px 10px 12px;
        }
        .dockInner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .dockBtn {
          height: 46px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.92);
        }
        .dockBtnPrimary {
          background: rgba(255,255,255,0.92);
          color: #0b0b12;
          border: 1px solid rgba(255,255,255,0.60);
        }

        /* Make sure links never look like underlined 1999 links */
        .linkReset { text-decoration: none !important; color: inherit !important; }
      `}</style>

      <div className="bgGlow" />

      <div className="topbar">
        <div className="topbarInner">
          <div style={{ minWidth: 0 }}>
            <div className="title">broT Members Portal</div>
            <div className="sub">Quiet by design • presence over performance</div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isAdmin ? (
              <Link href="/admin/inbox" className="linkReset">
                <span className="btn btnSmall">Admin Inbox</span>
              </Link>
            ) : null}

            <button onClick={logout} className="btn btnSmall btnDanger" type="button">
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="hero">
          <div className="heroTop">
            <div>
              <div className="pillRow">
                <span className="pill">Role: <span style={{ color: "white" }}>{role}</span></span>
                <span className="pill">Nothing auto-joins</span>
                <span className="pill">Nothing is recorded</span>
              </div>

              <h1 className="heroH1">Built for calm access.</h1>
              <p className="heroP">
                Everything here is deliberate: support routes to admins, lounge opens rooms, forms stay simple,
                and broBOT will live inside the portal later (not a widget mess).
              </p>
            </div>

            <div className="btnRow">
              <Link href="/members/support" className="linkReset">
                <span className="btn btnPrimary">Request Support</span>
              </Link>
              <Link href="/members/rooms" className="linkReset">
                <span className="btn">Enter Lounge</span>
              </Link>
              <Link href="/members/forms" className="linkReset">
                <span className="btn">Forms</span>
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, fontWeight: 700, fontSize: 14 }}>Quick Actions</div>

        <div className="grid">
          <div className="card">
            <h2 className="cardTitle">Support</h2>
            <p className="cardP">Private request → goes to admin inbox.</p>
            <div className="cardMeta">resources • legal • medical • other</div>
            <div className="cardBtns">
              <Link href="/members/support" className="linkReset">
                <span className="btn btnPrimary">Open Support Form</span>
              </Link>
              {isAdmin ? (
                <Link href="/admin/inbox" className="linkReset">
                  <span className="btn">View Inbox</span>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="card">
            <h2 className="cardTitle">Community</h2>
            <p className="cardP">GroupMe for now. Portal chat later.</p>
            <div className="cardMeta">temporary channel</div>
            <div className="cardBtns">
              <a
                href="https://groupme.com/join_group/113145463/Wxy8CAFk"
                target="_blank"
                rel="noreferrer"
                className="linkReset"
              >
                <span className="btn btnPrimary">Open GroupMe</span>
              </a>
              <span className="btn" style={{ opacity: 0.72, cursor: "default" }}>Chat: coming soon</span>
            </div>
          </div>

          <div className="card">
            <h2 className="cardTitle">broT Lounge</h2>
            <p className="cardP">Rooms are secondary on purpose. Click opens. No auto-join.</p>
            <div className="cardMeta">safe entry</div>
            <div className="cardBtns">
              <Link href="/members/rooms" className="linkReset">
                <span className="btn btnPrimary">Enter Lounge</span>
              </Link>
              <a
                href="https://meet.jit.si/SpaceToLand-broThercollecTive"
                target="_blank"
                rel="noreferrer"
                className="linkReset"
              >
                <span className="btn">Weekly Meeting</span>
              </a>
            </div>
          </div>

          <div className="card">
            <h2 className="cardTitle">broBOT</h2>
            <p className="cardP">Grounding • guidance • routing. Portal-native later.</p>
            <div className="cardMeta">coming soon</div>
            <div className="cardBtns">
              <Link href="/members/brobot" className="linkReset">
                <span className="btn">Open broBOT</span>
              </Link>
              <span className="btn" style={{ opacity: 0.72, cursor: "default" }}>Not a widget mess</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dock">
        <div className="dockInner">
          <Link href="/members/support" className="linkReset">
            <div className="dockBtn dockBtnPrimary">Support</div>
          </Link>
          <Link href="/members/rooms" className="linkReset">
            <div className="dockBtn">Lounge</div>
          </Link>
          <Link href="/members/forms" className="linkReset">
            <div className="dockBtn">Forms</div>
          </Link>
          <a
            href="https://groupme.com/join_group/113145463/Wxy8CAFk"
            target="_blank"
            rel="noreferrer"
            className="linkReset"
          >
            <div className="dockBtn">GroupMe</div>
          </a>
        </div>
      </div>
    </div>
  );
}
