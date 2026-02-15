"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  admin_photo_path: string | null;

  created_at?: string | null;
};

function cleanHandle(v: string | null) {
  if (!v) return null;
  const s = v.trim();
  if (!s) return null;
  return s.startsWith("@") ? s : `@${s}`;
}

function isUuidLike(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s
  );
}

export default function DirectoryMemberPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [adminPhotoUrl, setAdminPhotoUrl] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      // must be logged in
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace("/login");
        return;
      }

      // check admin role for revealing admin photo
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;

      if (uid) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .maybeSingle();

        setIsAdmin(roleRow?.role === "superadmin" || roleRow?.role === "admin");
      }

      // fetch by username OR user_id
      let q = supabase
        .from("profiles")
        .select(
          "user_id, display_name, username, phone, email, instagram, tiktok, x, linkedin, bio, avatar_path, admin_photo_path, created_at"
        );

      if (isUuidLike(slug)) {
        q = q.eq("user_id", slug);
      } else {
        q = q.eq("username", slug);
      }

      const { data, error } = await q.maybeSingle();

      if (error) {
        console.error(error);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const p = data as ProfileRow;
      setProfile(p);

      // signed avatar url
      if (p.avatar_path) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl(p.avatar_path, 60 * 60);
        setAvatarUrl(signed?.signedUrl ?? null);
      }

      // signed admin photo url (only if admin)
      if (p.admin_photo_path && (roleRowIsAdmin(roleRowFromCache(p.user_id)) ?? true)) {
        // NOTE: we already computed isAdmin above; use it
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, slug]);

  // small helper that avoids TS complaining above
  function roleRowFromCache(_: string) {
    return { role: isAdmin ? "admin" : "member" };
  }
  function roleRowIsAdmin(r: { role: string } | null) {
    return r?.role === "superadmin" || r?.role === "admin";
  }

  useEffect(() => {
    (async () => {
      if (!profile) return;
      if (!profile.admin_photo_path) return;
      if (!isAdmin) return;

      const { data: signed } = await supabase.storage
        .from("admin-photos")
        .createSignedUrl(profile.admin_photo_path, 60 * 60);

      setAdminPhotoUrl(signed?.signedUrl ?? null);
    })();
  }, [profile, isAdmin]);

  const pretty = useMemo(() => {
    if (!profile) return null;

    const ig = cleanHandle(profile.instagram);
    const tk = cleanHandle(profile.tiktok);
    const xx = cleanHandle(profile.x);

    return { ig, tk, xx };
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white">
        <div className="max-w-[920px] mx-auto px-5 py-10">
          <Link href="/members/directory" className="inline-flex items-center gap-2 text-sm underline underline-offset-4 opacity-80">
            ← Back to Directory
          </Link>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-xl font-semibold">Member not found</div>
            <div className="mt-2 text-sm text-white/70">
              That profile doesn’t exist yet, or they haven’t set a username.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const name = profile.display_name ?? "—";
  const user = profile.username ? `@${profile.username}` : "—";

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .wrap { max-width: 980px; margin: 0 auto; padding: 22px 18px 90px; }
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 70px rgba(80,170,255,0.06);
          border-radius: 26px;
        }
        .hero {
          position: relative;
          overflow: hidden;
          padding: 18px;
        }
        .hero::before{
          content:"";
          position:absolute; inset:-120px;
          background: radial-gradient(600px 220px at 20% 30%, rgba(0,255,255,0.18), transparent 60%),
                      radial-gradient(520px 220px at 80% 35%, rgba(255,0,200,0.16), transparent 60%),
                      radial-gradient(720px 320px at 50% 90%, rgba(120,140,255,0.10), transparent 60%);
          filter: blur(10px);
          opacity: 0.9;
          pointer-events:none;
        }
        .heroInner { position: relative; z-index: 1; display:flex; gap:16px; align-items:center; }
        .avatar {
          width: 88px; height: 88px; border-radius: 26px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          overflow:hidden;
          flex: 0 0 auto;
          box-shadow: 0 0 30px rgba(0,0,0,0.35);
        }
        .avatar img { width:100%; height:100%; object-fit:cover; display:block; }
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
        .primary { background:#fff; color:#000; border:none; }
        .card {
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 22px;
          padding: 16px;
        }
        .muted { color: rgba(255,255,255,0.70); }
        .tiny { color: rgba(255,255,255,0.55); font-size: 12px; }
        .grid { display:grid; gap: 12px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .tag {
          display:inline-flex; align-items:center; gap:6px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          font-size: 12px;
          color: rgba(255,255,255,0.78);
        }
        .hr { height: 1px; background: rgba(255,255,255,0.10); margin: 12px 0; }
      `}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <Link href="/members/directory" className="pill text-sm">
            ← Back
          </Link>

          <div className="flex gap-2">
            <Link href="/members/profile" className="pill text-sm">
              Edit my profile
            </Link>
          </div>
        </div>

        <div className="glass hero mt-4">
          <div className="heroInner">
            <div className="avatar" aria-hidden="true">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-2xl font-semibold leading-tight truncate">
                {name}
              </div>
              <div className="tiny truncate">{user}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile.phone ? <span className="tag">📱 {profile.phone}</span> : null}
                {profile.email ? <span className="tag">✉️ {profile.email}</span> : null}
                {pretty?.ig ? <span className="tag">IG {pretty.ig}</span> : null}
                {pretty?.tk ? <span className="tag">TikTok {pretty.tk}</span> : null}
                {pretty?.xx ? <span className="tag">X {pretty.xx}</span> : null}
                {profile.linkedin ? (
                  <span className="tag">LinkedIn {profile.linkedin}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="heroInner" style={{ marginTop: 12 }}>
            <div className="tiny">
              This profile is visible only to logged-in members.
            </div>
          </div>
        </div>

        <div className="grid mt-4">
          <div className="card">
            <div className="text-lg font-semibold">Bio</div>
            <div className="hr" />
            {profile.bio ? (
              <div className="muted text-sm whitespace-pre-wrap">{profile.bio}</div>
            ) : (
              <div className="tiny">No bio yet.</div>
            )}
          </div>

          <div className="card">
            <div className="text-lg font-semibold">Quick Contact</div>
            <div className="hr" />

            <div className="space-y-2 text-sm">
              <div>
                <div className="tiny">Phone</div>
                <div className="muted">{profile.phone ?? "—"}</div>
              </div>
              <div>
                <div className="tiny">Email</div>
                <div className="muted">{profile.email ?? "—"}</div>
              </div>
              <div>
                <div className="tiny">Social</div>
                <div className="muted">
                  {[pretty?.ig, pretty?.tk, pretty?.xx, profile.linkedin]
                    .filter(Boolean)
                    .join(" • ") || "—"}
                </div>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div className="text-lg font-semibold">Admin Only</div>
              <div className="tiny mt-1">
                Back-of-house identity photo (only visible to admins).
              </div>
              <div className="hr" />

              {adminPhotoUrl ? (
                <div
                  style={{
                    width: "100%",
                    maxWidth: 520,
                    borderRadius: 22,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <img
                    src={adminPhotoUrl}
                    alt=""
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              ) : (
                <div className="tiny">No admin photo uploaded.</div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
