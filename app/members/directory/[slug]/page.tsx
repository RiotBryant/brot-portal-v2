"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  username: string | null;

  email: string | null;
  phone: string | null;
  bio: string | null;

  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;

  avatar_url: string | null;      // member-facing
  admin_photo_url: string | null; // admin-only
};

export default function DirectoryProfilePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"member" | "admin" | "superadmin">("member");
  const [row, setRow] = useState<ProfileRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = useMemo(() => role === "admin" || role === "superadmin", [role]);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        router.replace("/login");
        return;
      }

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      setRole((r?.role as any) ?? "member");

      // Find the profile by username OR by user_id (slug can be either)
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select(
          "user_id, display_name, username, email, phone, bio, instagram, tiktok, twitter, avatar_url, admin_photo_url"
        )
        .or(`username.eq.${slug},user_id.eq.${slug}`)
        .maybeSingle();

      if (profErr) {
        setError(profErr.message);
        setRow(null);
      } else if (!prof) {
        setError("Profile not found.");
        setRow(null);
      } else {
        setRow(prof as ProfileRow);
        setError(null);
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

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .wrap { width: min(980px, calc(100% - 28px)); margin: 0 auto; padding: 22px 0 60px; }
        .topbar { display:flex; align-items:center; justify-content:space-between; gap: 16px; }
        .btn {
          display:inline-flex; align-items:center; justify-content:center;
          height: 42px; padding: 0 14px; border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff; text-decoration:none;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
        }
        .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.22); }
        .card {
          margin-top: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 0 70px rgba(80,170,255,0.06);
        }
        .grid { display:grid; gap: 14px; grid-template-columns: 1.1fr 0.9fr; }
        @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
        .pill { display:inline-flex; gap: 8px; align-items:center; padding: 7px 10px; border-radius: 999px;
          background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.10); font-size: 12px; color: rgba(255,255,255,0.75); }
        .label { font-size: 12px; color: rgba(255,255,255,0.55); }
        .value { font-size: 14px; color: rgba(255,255,255,0.92); }
        .avatar {
          width: 74px; height: 74px; border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.35);
          display:grid; place-items:center;
          overflow:hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .bigPhoto {
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.35);
          overflow:hidden;
        }
        .bigPhoto img { width: 100%; height: 260px; object-fit: cover; display:block; }
        .tiny { font-size: 12px; color: rgba(255,255,255,0.55); margin-top: 8px; line-height: 1.35; }
        .sectionTitle { font-weight: 600; font-size: 14px; margin-top: 12px; }
        .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 14px 0; }
      `}</style>

      <div className="wrap">
        <div className="topbar">
          <div className="flex items-center gap-3">
            <Link href="/members/directory" className="btn">← Back</Link>
            <div className="pill">Directory • Members only</div>
          </div>
          <Link href="/members" className="btn">Portal Home</Link>
        </div>

        <div className="card">
          {error ? (
            <div>
              <div className="text-lg font-semibold">Couldn’t load profile</div>
              <div className="mt-2 text-sm text-white/70">{error}</div>
            </div>
          ) : row ? (
            <>
              <div className="grid">
                {/* Left: identity + info */}
                <div>
                  <div className="flex items-center gap-14">
                    <div className="avatar">
                      {row.avatar_url ? (
                        <img src={row.avatar_url} alt="Avatar" />
                      ) : (
                        <div className="text-sm text-white/60">No avatar</div>
                      )}
                    </div>

                    <div>
                      <div className="text-2xl font-semibold tracking-tight">
                        {row.display_name || row.username || "Member"}
                      </div>
                      <div className="mt-1 text-sm text-white/65">
                        @{row.username || "no-username"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {row.email ? <span className="pill">Email: {row.email}</span> : null}
                        {row.phone ? <span className="pill">Phone: {row.phone}</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="sectionTitle">Bio</div>
                  <div className="mt-2 text-sm text-white/75">
                    {row.bio ? row.bio : <span className="text-white/45">No bio yet.</span>}
                  </div>

                  <div className="divider" />

                  <div className="sectionTitle">Social</div>
                  <div className="mt-2 grid gap-2">
                    <div>
                      <div className="label">Instagram</div>
                      <div className="value">{row.instagram || "—"}</div>
                    </div>
                    <div>
                      <div className="label">TikTok</div>
                      <div className="value">{row.tiktok || "—"}</div>
                    </div>
                    <div>
                      <div className="label">Twitter/X</div>
                      <div className="value">{row.twitter || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Right: admin photo */}
                <div>
                  <div className="sectionTitle">Photo</div>
                  <div className="tiny">
                    This is the member-facing card photo. Admin photo is only visible to admins.
                  </div>

                  <div className="mt-3 bigPhoto">
                    {row.avatar_url ? (
                      <img src={row.avatar_url} alt="Member photo" />
                    ) : (
                      <div className="h-[260px] grid place-items-center text-sm text-white/60">
                        No photo yet
                      </div>
                    )}
                  </div>

                  {isAdmin ? (
                    <>
                      <div className="divider" />
                      <div className="sectionTitle">Admin Photo (admins only)</div>
                      <div className="tiny">
                        Private back-of-house photo. Not shown to members unless you’re admin.
                      </div>

                      <div className="mt-3 bigPhoto">
                        {row.admin_photo_url ? (
                          <img src={row.admin_photo_url} alt="Admin photo" />
                        ) : (
                          <div className="h-[260px] grid place-items-center text-sm text-white/60">
                            No admin photo
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="tiny">
          If you see “Profile not found”, that member has no profile row yet (or no username set).
        </div>
      </div>
    </div>
  );
}
