"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
  avatar_url: string | null;
  admin_photo_url: string | null;
};

function cleanUsername(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "") // no spaces
    .replace(/[^a-z0-9._-]/g, ""); // safe chars
}

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [role, setRole] = useState<string>("member");
  const isAdmin = useMemo(() => role === "admin" || role === "superadmin", [role]);

  const [uid, setUid] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>("");

  // fields
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");

  const [bio, setBio] = useState("");

  // avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // admin photo (private bucket)
  const [adminPhotoUrl, setAdminPhotoUrl] = useState<string | null>(null);
  const [adminPhotoSigned, setAdminPhotoSigned] = useState<string | null>(null);
  const [adminPhotoFile, setAdminPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      setOk(null);

      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace("/login");
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const id = u.user?.id;
      if (!id) {
        router.replace("/login");
        return;
      }

      setUid(id);
      setAuthEmail(u.user?.email ?? "");

      // role
      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", id)
        .maybeSingle();
      setRole(r?.role ?? "member");

      // profile
      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select(
          "user_id,display_name,username,phone,email,bio,instagram,tiktok,twitter,facebook,website,avatar_url,admin_photo_url"
        )
        .eq("user_id", id)
        .maybeSingle<ProfileRow>();

      if (pErr) {
        setErr(pErr.message);
        setLoading(false);
        return;
      }

      // If no row exists yet, we’ll create on save (upsert).
      if (p) {
        setDisplayName(p.display_name ?? "");
        setUsername(p.username ?? "");
        setPhone(p.phone ?? "");
        setEmail(p.email ?? "");
        setBio(p.bio ?? "");

        setInstagram(p.instagram ?? "");
        setTiktok(p.tiktok ?? "");
        setTwitter(p.twitter ?? "");
        setFacebook(p.facebook ?? "");
        setWebsite(p.website ?? "");

        setAvatarUrl(p.avatar_url ?? null);
        setAdminPhotoUrl(p.admin_photo_url ?? null);
      }

      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    // Refresh signed URL for admin photo preview
    (async () => {
      if (!adminPhotoUrl) {
        setAdminPhotoSigned(null);
        return;
      }
      // adminPhotoUrl is stored as the object path in bucket: "{uid}/admin.jpg"
      const { data, error } = await supabase.storage
        .from("admin-photos")
        .createSignedUrl(adminPhotoUrl, 60 * 10); // 10 min

      if (error) {
        setAdminPhotoSigned(null);
        return;
      }
      setAdminPhotoSigned(data.signedUrl);
    })();
  }, [adminPhotoUrl]);

  async function uploadAvatarIfNeeded() {
    if (!avatarFile) return avatarUrl;

    const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${uid}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (upErr) throw new Error(upErr.message);

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadAdminPhotoIfNeeded() {
    if (!adminPhotoFile) return adminPhotoUrl;

    const ext = adminPhotoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${uid}/admin.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("admin-photos")
      .upload(path, adminPhotoFile, { upsert: true, contentType: adminPhotoFile.type });

    if (upErr) throw new Error(upErr.message);

    // store object path (NOT a public URL) because this bucket is private
    return path;
  }

  async function save() {
    setErr(null);
    setOk(null);
    setSaving(true);

    try {
      const un = cleanUsername(username);

      if (!displayName.trim()) throw new Error("Portal Name is required.");
      if (!un) throw new Error("Username is required.");

      const nextAvatarUrl = await uploadAvatarIfNeeded();
      const nextAdminPath = await uploadAdminPhotoIfNeeded();

      const payload: Partial<ProfileRow> = {
        user_id: uid,
        display_name: displayName.trim(),
        username: un,
        phone: phone.trim() || null,
        email: (email.trim() || authEmail || "").trim() || null,
        bio: bio.trim() || null,
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
        twitter: twitter.trim() || null,
        facebook: facebook.trim() || null,
        website: website.trim() || null,
        avatar_url: nextAvatarUrl ?? null,
        admin_photo_url: nextAdminPath ?? null,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw new Error(error.message);

      setAvatarUrl(nextAvatarUrl ?? null);
      setAdminPhotoUrl(nextAdminPath ?? null);

      setAvatarFile(null);
      setAdminPhotoFile(null);

      setOk("Saved.");
    } catch (e: any) {
      setErr(e?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-white/60">Portal name + username</p>
          </div>

          <button
            onClick={() => router.back()}
            className="h-10 rounded-xl px-4 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            ← Back
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          {err ? (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          {ok ? (
            <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              {ok}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-white/60">Portal Name (display)</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="Riot Bryant"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Username (no spaces)</label>
              <input
                value={username}
                onChange={(e) => setUsername(cleanUsername(e.target.value))}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="riotbryant"
              />
              <div className="mt-2 text-[11px] text-white/45">
                This is what shows in Directory. Keep it clean.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-white/60">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="(###) ###-####"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder={authEmail || "you@email.com"}
              />
              <div className="mt-2 text-[11px] text-white/45">
                If you leave it blank, we’ll use your login email.
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-xs text-white/60">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-2 w-full min-h-[96px] rounded-xl px-4 py-3 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
              placeholder="Short and real. Nothing performative."
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-white/60">Instagram</label>
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="@handle"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">TikTok</label>
              <input
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="@handle"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Twitter / X</label>
              <input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="@handle"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Facebook</label>
              <input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="profile link"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-2 w-full h-11 rounded-xl px-4 bg-black/30 border border-white/10 focus:outline-none focus:border-white/25"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Display Avatar</div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                    alt="avatar"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-xs text-white/50">
                    —
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-white/60">
                This shows on your profile + directory. Keep it clean.
              </div>

              <input
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-xs text-white/70"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />

              {avatarFile ? (
                <div className="mt-3 text-xs text-white/50">
                  Selected: {avatarFile.name}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Admin Photo</div>
                {adminPhotoSigned ? (
                  <img
                    src={adminPhotoSigned}
                    className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                    alt="admin"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-xs text-white/50">
                    —
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-white/60">
                Private. Visible to admins only. Please use a clear photo.
              </div>

              <input
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-xs text-white/70"
                onChange={(e) => setAdminPhotoFile(e.target.files?.[0] ?? null)}
              />

              {adminPhotoFile ? (
                <div className="mt-3 text-xs text-white/50">
                  Selected: {adminPhotoFile.name}
                </div>
              ) : null}

              {isAdmin ? (
                <div className="mt-3 text-[11px] text-white/45">
                  You’re admin, so you can view admin photos in back-of-house later.
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <div className="text-xs text-white/45">
              UID: <span className="text-white/70">{uid}</span>
            </div>

            <button
              disabled={saving}
              onClick={save}
              className="h-11 rounded-xl px-6 text-sm bg-white text-black font-semibold disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
