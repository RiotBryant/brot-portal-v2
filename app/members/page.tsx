"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const baseCSS = `
  .page{min-height:100vh;background:#07070b;color:#fff}
  .wrap{max-width:1100px;margin:0 auto;padding:40px 20px}
  .top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
  .title{font-size:28px;font-weight:700;letter-spacing:-.02em}
  .sub{margin-top:8px;font-size:13px;opacity:.7}
  .grid{margin-top:22px;display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
  .card{grid-column:span 6;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:16px}
  .cardTitle{font-size:16px;font-weight:650}
  .cardDesc{margin-top:6px;font-size:13px;opacity:.7}
  .actions{margin-top:12px;display:flex;gap:10px;flex-wrap:wrap}
  .btn{display:inline-grid;place-items:center;height:40px;padding:0 14px;border-radius:14px;
       background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;
       text-decoration:none;font-size:14px}
  .btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.22)}
  .primary{background:#fff;color:#000;border:none}
  .pill{font-size:12px;opacity:.7}
  @media (max-width:900px){.card{grid-column:span 12}}
`;

export default function MembersHomePage() {
  const router = useRouter();
  const [role, setRole] = useState<"member" | "admin" | "superadmin">("member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace(`/auth/login?next=${encodeURIComponent("/members")}`);
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        router.replace(`/auth/login?next=${encodeURIComponent("/members")}`);
        return;
      }

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      const myRole = (r?.role ?? "member") as any;
      setRole(myRole);
      setLoading(false);
    })();
  }, [router]);

  const isAdmin = role === "admin" || role === "superadmin";

  if (loading) {
    return (
      <div className="page">
        <style>{baseCSS}</style>
        <div className="wrap" style={{ opacity: 0.7, fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{baseCSS}</style>

      <div className="wrap">
        <div className="top">
          <div>
            <div className="title">Members Portal</div>
            <div className="sub">Everything lives here. Quiet by design.</div>
          </div>

          <div style={{ textAlign: "right" }}>
            {isAdmin ? (
              <Link className="btn" href="/members/admin/inbox">Admin Inbox →</Link>
            ) : (
              <span className="pill">Role: member</span>
            )}
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <div className="cardTitle">broChAT</div>
            <div className="cardDesc">Live room. Avatars + bubbles + realtime.</div>
            <div className="actions">
              <Link className="btn primary" href="/members/chat">Enter broChAT</Link>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Support</div>
            <div className="cardDesc">Send a request to the admin inbox.</div>
            <div className="actions">
              <Link className="btn primary" href="/members/support">Request Support</Link>
              <Link className="btn" href="/members/inbox">Your Inbox</Link>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Community</div>
            <div className="cardDesc">GroupMe link (fallback channel).</div>
            <div className="actions">
              <a className="btn primary" href="https://groupme.com/join_group/113145463/Wxy8CAFk" target="_blank" rel="noreferrer">
                Open GroupMe
              </a>
            </div>
          </div>

          <div className="card">
            <div className="cardTitle">Directory</div>
            <div className="cardDesc">Members list + profiles.</div>
            <div className="actions">
              <Link className="btn" href="/members/directory">Open Directory</Link>
              <Link className="btn" href="/members/profile">My Profile</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
