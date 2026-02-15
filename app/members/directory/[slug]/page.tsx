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

  show_phone: boolean | null;
  show_email: boolean | null;
  show_instagram: boolean | null;
  show_tiktok: boolean | null;
  show_x: boolean | null;
  show_linkedin: boolean | null;
  show_bio: boolean | null;

  avatar_path: string | null;
  admin_photo_path: string | null;

  // optional (only if you add later)
  internal_notes?: string | null;
};

type RoleRow = { role: "member" | "admin" | "superadmin" | string };

function isUuidMaybe(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s
  );
}

export default function DirectoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = String(params?.slug ?? "").trim();

  const [loading, setLoading] = useState(true);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [adminPhotoUrl, setAdminPhotoUrl] = useState<string | null>(null);

  const safeItems = useMemo(() => {
    if (!profile) return [];

    const items: { label: string; value: string; href?: string }[] = [];

    const on = (v: boolean | null | undefined) => v === true;

    if (on(profile.show_phone) && profile.phone) items.push({ label: "Phone", value: profile.phone });
    if (on(profile.show_email) && profile.email) items.push({ label: "Email", value: profile.email });

    if (on(profile.show_instagram) && profile.instagram)
      items.push({ label: "Instagram", value: profile.instagram });
    if (on(profile.show_tiktok) && profile.tiktok) items.push({ label: "TikTok", value: profile.tiktok });
    if (on(profile.show_x) && profile.x) items.push({ label: "X", value: profile.x });
    if (on(profile.show_linkedin) && profile.linkedin)
      items.push({ label: "LinkedIn", value: profile.linkedin });

    return items;
  }, [profile]);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace("/login");
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const me = u.user?.id ?? null;
      if (!me) {
        router.replace("/login");
        return;
      }
      setViewerId(me);

      // role check
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", me)
        .maybeSingle();

      const role = (roleRow as RoleRow | null)?.role ?? "member";
      setIsAdmin(role === "admin" || role === "superadmin");

      // load profile by username OR by user_id
      let q = supabase
        .from("profiles")
        .select(
          `
          user_id, display_name, username,
          phone, email, instagram, tiktok, x, linkedin, bio,
          show_phone, show_email, show_instagram, show_tiktok, show_x, show_linkedin, show_bio,
          avatar_path, admin_photo_path
        `
        );

      if (isUuidMaybe(slug)) {
        q = q.eq("user_id", slug);
      } else {
        q = q.eq("username", slug);
      }

      const { data, error } = await q.maybeSingle();

      if (error) console.error(error);
      if (!data) {
        setLoading(false);
        setProfile(null);
        return;
      }

      setProfile(data as ProfileRow);

      // signed urls
      const row = data as ProfileRow;

      if (row.avatar_path) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl(row.avatar_path, 60 * 60);
        setAvatarUrl(signed?.signedUrl ?? null);
      }

      if ((role === "admin" || role === "superadmin") && row.admin_photo_path) {
        const { data: signed } = await supabase.storage
          .from("admin-photos")
          .createSignedUrl(row.admin_photo_path, 60 * 60);
        setAdminPhotoUrl(signed?.signedUrl ?? null);
      }

      setLoading(false);
    })();
  }, [router, slug]);

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
        <div className="max-w-[980px] mx-auto px-5 py-10">
          <div className="flex items-center justify-between">
            <Link href="/members/directory" className="pill text-sm">
              ← Directory
            </Link>
            <Link href="/members" className="pill text-sm">
              Home
            </Link>
          </div>
          <div className="mt-8 glass p-6">
            <div className="text-xl font-semibold">Not found</div>
            <div className="text-white/60 text-sm mt-1">That member profile doesn’t exist.</div>
          </div>
        </div>

        <style>{baseCss}</style>
      </div>
    );
  }

  const title = profile.display_name?.trim() || "Member";
  const uname = profile.username?.trim() || "";

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{baseCss}</style>

      <div className="max-w-[980px] mx-auto px-5 py-10 pb-24">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Link href="/members/directory" className="pill text-sm">
              ← Directory
            </Link>
            <Link href="/members" className="pill text-sm">
              Home
            </Link>
          </div>

          <div className="flex gap-2">
            {viewerId === profile.user_id ? (
              <Link href="/members/profile" className="pill text-sm">
                Edit your profile
              </Link>
            ) : null}
          </div>
        </div>

        <div className="glass mt-5 p-5">
          <div className="flex items-center gap-4">
            <div className="avatarBig">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : null}
            </div>

            <div className="min-w-0">
              <div className="text-2xl font-semibold tracking-tight truncate">{title}</div>
              {uname ? <div className="text-white/60 text-sm">@{uname}</div> : null}
            </div>
          </div>

          <div className={`grid2 mt-5 ${isAdmin ? "admin" : ""}`}>
            {/* Member-safe */}
            <div className="card">
              <div className="text-lg font-semibold">Member View</div>

              {profile.show_bio && profile.bio ? (
                <div className="mt-3">
                  <div className="tiny mb-1">Bio</div>
                  <div className="text-white/80 leading-relaxed">{profile.bio}</div>
                </div>
              ) : null}

              {safeItems.length ? (
                <div className="mt-4 list">
                  {safeItems.map((it) => (
                    <div key={it.label} className="row">
                      <div className="tiny">{it.label}</div>
                      <div className="text-white/85 break-words">{it.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-white/55 text-sm">No shared contact info.</div>
              )}
            </div>

            {/* Admin-only */}
            {isAdmin ? (
              <div className="card">
                <div className="text-lg font-semibold">Admin View</div>
                <div className="tiny mt-1">Back-of-house only.</div>

                <div className="mt-4">
                  <div className="tiny mb-2">Admin Photo</div>
                  <div className="adminPhoto">
                    {adminPhotoUrl ? <img src={adminPhotoUrl} alt="" /> : <div className="tiny">None</div>}
                  </div>
                </div>

                <div className="mt-4 list">
                  {profile.phone ? (
                    <div className="row">
                      <div className="tiny">Phone</div>
                      <div className="text-white/85 break-words">{profile.phone}</div>
                    </div>
                  ) : null}
                  {profile.email ? (
                    <div className="row">
                      <div className="tiny">Email</div>
                      <div className="text-white/85 break-words">{profile.email}</div>
                    </div>
                  ) : null}
                  {profile.instagram ? (
                    <div className="row">
                      <div className="tiny">Instagram</div>
                      <div className="text-white/85 break-words">{profile.instagram}</div>
                    </div>
                  ) : null}
                  {profile.tiktok ? (
                    <div className="row">
                      <div className="tiny">TikTok</div>
                      <div className="text-white/85 break-words">{profile.tiktok}</div>
                    </div>
                  ) : null}
                  {profile.x ? (
                    <div className="row">
                      <div className="tiny">X</div>
                      <div className="text-white/85 break-words">{profile.x}</div>
                    </div>
                  ) : null}
                  {profile.linkedin ? (
                    <div className="row">
                      <div className="tiny">LinkedIn</div>
                      <div className="text-white/85 break-words">{profile.linkedin}</div>
                    </div>
                  ) : null}
                </div>

                {/* Internal notes later (we’ll add column + UI next) */}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const baseCss = `
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
  .tiny { color: rgba(255,255,255,0.55); font-size: 12px; }

  .avatarBig{
    width: 88px; height: 88px; border-radius: 26px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    overflow:hidden;
    flex: 0 0 auto;
  }
  .avatarBig img{ width:100%; height:100%; object-fit:cover; display:block; }

  .grid2{ display:grid; gap: 14px; grid-template-columns: 1fr; }
  @media (min-width: 980px){ .grid2.admin{ grid-template-columns: 1fr 1fr; } }

  .card{
    background: rgba(0,0,0,0.28);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 22px;
    padding: 16px;
  }

  .list{ display:flex; flex-direction:column; gap: 10px; margin-top: 6px; }
  .row{
    display:flex; justify-content:space-between; gap: 14px;
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 10px;
  }
  .row:first-child{ border-top:none; padding-top:0; }

  .adminPhoto{
    width: 100%;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.05);
    overflow: hidden;
    min-height: 160px;
    display:grid;
    place-items:center;
  }
  .adminPhoto img{ width:100%; height:100%; object-fit:cover; display:block; }
`;
