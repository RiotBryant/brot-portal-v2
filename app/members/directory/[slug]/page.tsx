"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  user_id: string;
  display_name: string | null;
  username: string | null;

  phone: string | null;
  email: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  website: string | null;
  bio: string | null;

  avatar_url: string | null;
  admin_photo_url: string | null;
  internal_notes: string | null;

  show_phone: boolean;
  show_email: boolean;
  show_instagram: boolean;
  show_tiktok: boolean;
  show_twitter: boolean;
  show_website: boolean;
  show_bio: boolean;
};

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export default function DirectoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);

  const [meAdmin, setMeAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace("/login");
        return;
      }

      // Check admin status from user_roles
      const myId = sess.session.user.id;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", myId)
        .maybeSingle();

      setMeAdmin(roleRow?.role === "admin" || roleRow?.role === "superadmin");

      // Fetch profile by username OR user_id
      const q = supabase
        .from("profiles")
        .select(
          `
          user_id, display_name, username,
          phone, email, instagram, tiktok, twitter, website, bio,
          avatar_url, admin_photo_url, internal_notes,
          show_phone, show_email, show_instagram, show_tiktok, show_twitter, show_website, show_bio
        `
        );

      const { data, error } = isUuid(slug)
        ? await q.eq("user_id", slug).maybeSingle()
        : await q.ilike("username", slug).maybeSingle();

      if (!error) setP((data as Profile) ?? null);
      setLoading(false);
    })();
  }, [router, slug]);

  const memberFields = useMemo(() => {
    if (!p) return [];
    return [
      { label: "Phone", value: p.phone, show: p.show_phone },
      { label: "Email", value: p.email, show: p.show_email },
      { label: "Instagram", value: p.instagram, show: p.show_instagram },
      { label: "TikTok", value: p.tiktok, show: p.show_tiktok },
      { label: "Twitter", value: p.twitter, show: p.show_twitter },
      { label: "Website", value: p.website, show: p.show_website },
      { label: "Bio", value: p.bio, show: p.show_bio },
    ].filter((x) => x.show && x.value);
  }, [p]);

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto w-[min(980px,calc(100%-24px))] py-10">
        <style>{`
          .wrap { display:grid; grid-template-columns: 1fr; gap:14px; }
          @media (min-width: 980px) { .wrap { grid-template-columns: 1fr 1fr; } }
          .card { background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.10); border-radius: 22px; padding: 18px; }
          .btn { height:38px; padding:0 14px; border-radius: 999px; border:1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); display:inline-flex; align-items:center; gap:8px; }
          .btn:hover { background: rgba(255,255,255,0.10); }
          .pill { font-size: 12px; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); color: rgba(255,255,255,0.80); }
          .row { display:flex; gap:12px; align-items:center; }
          .avatar { width:60px; height:60px; border-radius: 999px; background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.10); overflow:hidden; display:flex; align-items:center; justify-content:center; font-weight:800; }
          .avatar img { width:100%; height:100%; object-fit:cover; }
          .label { font-size: 12px; color: rgba(255,255,255,0.65); }
          .value { margin-top: 2px; font-weight: 600; }
          .kv { padding: 12px 14px; border-radius: 16px; background: rgba(0,0,0,0.20); border: 1px solid rgba(255,255,255,0.08); }
        `}</style>

        <div className="flex items-center justify-between gap-3">
          <Link href="/members/directory" className="btn">← Back</Link>
          <div className="flex items-center gap-2">
            <Link href="/members/profile" className="btn">My Profile</Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 card">Loading…</div>
        ) : !p ? (
          <div className="mt-6 card">Not found.</div>
        ) : (
          <div className="mt-6 wrap">
            {/* LEFT: what MEMBERS can see */}
            <div className="card">
              <div className="row">
                <div className="avatar">
                  {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{(p.display_name || "M").slice(0,1)}</span>}
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-semibold">{p.display_name || "Member"}</div>
                  <div className="text-white/70">@{p.username || "no-username"}</div>
                  <div className="mt-2"><span className="pill">Member view</span></div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {memberFields.length === 0 ? (
                  <div className="text-white/70">This member hasn’t shared any contact details yet.</div>
                ) : (
                  memberFields.map((f) => (
                    <div key={f.label} className="kv">
                      <div className="label">{f.label}</div>
                      <div className="value">{f.value}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: what ADMINS can see */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Admin view</div>
                <span className="pill">{meAdmin ? "Admin enabled" : "Not admin"}</span>
              </div>

              {!meAdmin ? (
                <div className="mt-3 text-white/70">
                  You’re not marked as admin, so you can’t see admin-only data here.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {/* Always show full data if present (no “empty:” rows) */}
                  {p.phone ? <div className="kv"><div className="label">Phone</div><div className="value">{p.phone}</div></div> : null}
                  {p.email ? <div className="kv"><div className="label">Email</div><div className="value">{p.email}</div></div> : null}
                  {p.instagram ? <div className="kv"><div className="label">Instagram</div><div className="value">{p.instagram}</div></div> : null}
                  {p.tiktok ? <div className="kv"><div className="label">TikTok</div><div className="value">{p.tiktok}</div></div> : null}
                  {p.twitter ? <div className="kv"><div className="label">Twitter</div><div className="value">{p.twitter}</div></div> : null}
                  {p.website ? <div className="kv"><div className="label">Website</div><div className="value">{p.website}</div></div> : null}
                  {p.bio ? <div className="kv"><div className="label">Bio</div><div className="value">{p.bio}</div></div> : null}

                  <div className="kv">
                    <div className="label">Admin-only photo</div>
                    {p.admin_photo_url ? (
                      <img
                        src={p.admin_photo_url}
                        alt=""
                        style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 14, marginTop: 10 }}
                      />
                    ) : (
                      <div className="text-white/70 mt-2">No admin photo uploaded.</div>
                    )}
                  </div>

                  <div className="kv">
                    <div className="label">Internal notes</div>
                    <div className="value">{p.internal_notes || "—"}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
