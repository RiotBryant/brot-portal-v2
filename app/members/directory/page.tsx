"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  username: string | null;

  phone: string | null;
  email: string | null;
  instagram: string | null;
  tiktok: string | null;
  x: string | null;
  linkedin: string | null;
  bio: string | null;

  avatar_path: string | null;
  created_at?: string | null;
};

type RowWithAvatar = ProfileRow & { avatarUrl?: string | null };

function cleanHandle(v: string | null) {
  if (!v) return null;
  const s = v.trim();
  if (!s) return null;
  return s.startsWith("@") ? s : s;
}

export default function DirectoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RowWithAvatar[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "user_id, display_name, username, phone, email, instagram, tiktok, x, linkedin, bio, avatar_path, created_at"
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setRows([]);
        setLoading(false);
        return;
      }

      const list = (data ?? []) as ProfileRow[];

      // avatars bucket is private -> signed urls
      const withAvatars: RowWithAvatar[] = await Promise.all(
        list.map(async (p) => {
          if (!p.avatar_path) return { ...p, avatarUrl: null };
          const { data: signed, error: e2 } = await supabase.storage
            .from("avatars")
            .createSignedUrl(p.avatar_path, 60 * 60); // 1 hour

          if (e2) return { ...p, avatarUrl: null };
          return { ...p, avatarUrl: signed?.signedUrl ?? null };
        })
      );

      setRows(withAvatars);
      setLoading(false);
    })();
  }, [router]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((r) => {
      const hay = [
        r.display_name ?? "",
        r.username ?? "",
        r.bio ?? "",
        r.instagram ?? "",
        r.tiktok ?? "",
        r.x ?? "",
        r.linkedin ?? "",
        r.email ?? "",
        r.phone ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, rows]);

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
        .wrap { max-width: 1100px; margin: 0 auto; padding: 22px 18px 90px; }
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(80,170,255,0.06);
          border-radius: 24px;
        }
        .pill {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          height: 42px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .pill:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.08); }
        .card {
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 22px;
          padding: 16px;
        }
        .muted { color: rgba(255,255,255,0.68); }
        .tiny { color: rgba(255,255,255,0.55); font-size: 12px; }
        .grid { display:grid; gap:12px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .row { display:flex; gap:12px; align-items:flex-start; }
        .avatar {
          width: 54px; height: 54px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          overflow:hidden;
          flex: 0 0 auto;
        }
        .avatar img { width:100%; height:100%; object-fit:cover; display:block; }
        .tag {
          display:inline-flex; align-items:center; gap:6px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          font-size: 12px;
          color: rgba(255,255,255,0.78);
        }
        .link {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        input[type="text"]{
          height: 44px;
          width: 100%;
          border-radius: 14px;
          padding: 0 14px;
          outline: none;
          color: white;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }
      `}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Directory</h1>
            <p className="mt-1 text-sm text-white/70">Members-only.</p>
          </div>

          <div className="flex gap-2">
            <Link href="/members" className="pill text-sm">
              ← Back
            </Link>
            <Link href="/members/profile" className="pill text-sm">
              Edit my profile
            </Link>
          </div>
        </div>

        <div className="glass mt-4 p-4">
          <input
            type="text"
            placeholder="Search name, username, bio, socials…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mt-2 tiny">
            Showing {filtered.length} / {rows.length}
          </div>
        </div>

        <div className="mt-4 grid">
          {filtered.map((p) => {
            const name = p.display_name ?? "—";
            const user = p.username ? `@${p.username}` : "—";

            const ig = cleanHandle(p.instagram);
            const tk = cleanHandle(p.tiktok);
            const xx = cleanHandle(p.x);

            return (
              <div key={p.user_id} className="card">
                <div className="row">
                  <div className="avatar" aria-hidden="true">
                    {p.avatarUrl ? <img src={p.avatarUrl} alt="" /> : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold leading-tight truncate">
                          {name}
                        </div>
                        <div className="tiny truncate">{user}</div>
                      </div>

                      <Link
                        href={`/members/directory/${encodeURIComponent(
                          p.username || p.user_id
                        )}`}
                        className="pill text-sm"
                      >
                        View
                      </Link>
                    </div>

                    {p.bio ? (
                      <div className="mt-3 muted text-sm">{p.bio}</div>
                    ) : (
                      <div className="mt-3 tiny">No bio yet.</div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.phone ? <span className="tag">📱 {p.phone}</span> : null}
                      {p.email ? <span className="tag">✉️ {p.email}</span> : null}

                      {ig ? <span className="tag">IG {ig}</span> : null}
                      {tk ? <span className="tag">TikTok {tk}</span> : null}
                      {xx ? <span className="tag">X {xx}</span> : null}
                      {p.linkedin ? (
                        <span className="tag">LinkedIn {p.linkedin}</span>
                      ) : null}
                    </div>

                    <div className="mt-3 tiny">
                      If someone leaves fields blank, we don’t show them. Simple.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 tiny opacity-70">
          Directory is visible only when logged in.
        </div>
      </div>
    </div>
  );
}
