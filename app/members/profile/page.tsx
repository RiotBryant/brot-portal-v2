"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

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

      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("user_id", uid)
        .maybeSingle();

      setDisplayName(p?.display_name ?? "");
      setUsername(p?.username ?? "");
      setLoading(false);
    })();
  }, [router]);

  async function save() {
    setSaving(true);
    setMsg(null);

    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) {
      router.replace("/login");
      return;
    }

    const cleanUsername = username.trim().replace(/\s+/g, "").toLowerCase();

    const { error } = await supabase.from("profiles").upsert({
      user_id: uid,
      display_name: displayName.trim() || null,
      username: cleanUsername || null,
    });

    if (error) setMsg(error.message);
    else setMsg("Saved.");

    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .wrap { width: min(720px, calc(100% - 24px)); margin: 0 auto; padding: 22px 0 40px; }
        .card { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.10); border-radius: 24px; padding: 18px; }
        .btn { display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 16px; border-radius:999px;
          border:1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color:#fff; font-size:14px; }
        .btnPrimary { background:#fff; color:#000; border:none; }
        input {
          width: 100%;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.35);
          color: white;
          padding: 0 12px;
          outline: none;
        }
        label { font-size: 12px; color: rgba(255,255,255,0.65); }
      `}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Profile</div>
            <div className="text-sm text-white/60">Portal name + username</div>
          </div>
          <Link className="btn" href="/members">← Back</Link>
        </div>

        <div className="card mt-5">
          {loading ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : (
            <div className="grid gap-4">
              <div>
                <label>Portal Name (display)</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Riot Bryant"
                />
              </div>

              <div>
                <label>Username (no spaces)</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., riotbryant"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="btn btnPrimary" onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                {msg ? <div className="text-sm text-white/70">{msg}</div> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
