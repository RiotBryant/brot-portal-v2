"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
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
};

function slugifyUsername(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

export default function ProfilePage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [form, setForm] = useState<Profile>({
    user_id: "",
    display_name: "",
    username: "",
    phone: "",
    email: "",
    instagram: "",
    tiktok: "",
    x: "",
    linkedin: "",
    bio: "",
    avatar_path: null,
    admin_photo_path: null,
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [adminPhotoUrl, setAdminPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace("/login");
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const id = u.user?.id ?? null;
      if (!id) {
        router.replace("/login");
        return;
      }
      setUid(id);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "user_id, display_name, username, phone, email, instagram, tiktok, x, linkedin, bio, avatar_path, admin_photo_path"
        )
        .eq("user_id", id)
        .maybeSingle();

      if (error) console.error(error);

      const merged: Profile = {
        user_id: id,
        display_name: data?.display_name ?? "",
        username: data?.username ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        instagram: data?.instagram ?? "",
        tiktok: data?.tiktok ?? "",
        x: data?.x ?? "",
        linkedin: data?.linkedin ?? "",
        bio: data?.bio ?? "",
        avatar_path: data?.avatar_path ?? null,
        admin_photo_path: data?.admin_photo_path ?? null,
      };

      setForm(merged);

      // signed urls for private buckets
      if (merged.avatar_path) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl(merged.avatar_path, 60 * 60);
        setAvatarUrl(signed?.signedUrl ?? null);
      }

      if (merged.admin_photo_path) {
        const { data: signed } = await supabase.storage
          .from("admin-photos")
          .createSignedUrl(merged.admin_photo_path, 60 * 60);
        setAdminPhotoUrl(signed?.signedUrl ?? null);
      }

      setLoading(false);
    })();
  }, [router]);

  const canSave = useMemo(() => {
    return !!uid && !!form.display_name?.trim() && !!form.username?.trim();
  }, [uid, form.display_name, form.username]);

  async function saveProfile() {
    if (!uid) return;
    setSaving(true);
    setMsg("");

    const cleanedUsername = slugifyUsername(form.username ?? "");
    if (!cleanedUsername) {
      setSaving(false);
      setMsg("Username is required (letters/numbers/underscore only).");
      return;
    }

    const payload = {
      user_id: uid,
      display_name: form.display_name?.trim() || null,
      username: cleanedUsername,

      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
      instagram: form.instagram?.trim() || null,
      tiktok: form.tiktok?.trim() || null,
      x: form.x?.trim() || null,
      linkedin: form.linkedin?.trim() || null,
      bio: form.bio?.trim() || null,

      avatar_path: form.avatar_path,
      admin_photo_path: form.admin_photo_path,
    };

    const { error } = await supabase.from("profiles").upsert(payload, {
      onConflict: "user_id",
    });

    if (error) {
      console.error(error);
      setMsg(error.message);
      setSaving(false);
      return;
    }

    setForm((f) => ({ ...f, username: cleanedUsername }));
    setMsg("Saved.");
    setSaving(false);
  }

  async function uploadAvatar(file: File) {
    if (!uid) return;
    setMsg("");

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${uid}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      console.error(upErr);
      setMsg(upErr.message);
      return;
    }

    setForm((f) => ({ ...f, avatar_path: path }));

    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60);

    setAvatarUrl(signed?.signedUrl ?? null);
    setMsg("Avatar updated.");
  }

  async function uploadAdminPhoto(file: File) {
    if (!uid) return;
    setMsg("");

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${uid}/photo.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("admin-photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      console.error(upErr);
      setMsg(upErr.message);
      return;
    }

    setForm((f) => ({ ...f, admin_photo_path: path }));

    const { data: signed } = await supabase.storage
      .from("admin-photos")
      .createSignedUrl(path, 60 * 60);

    setAdminPhotoUrl(signed?.signedUrl ?? null);
    setMsg("Admin photo updated.");
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
      <style>{`
        .wrap { max-width: 900px; margin: 0 auto; padding: 22px 18px 90px; }
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
        .primary { background:#fff; color:#000; border:none; }
        label { font-size: 12px; color: rgba(255,255,255,0.7); display:block; margin-bottom:6px; }
        input, textarea {
          width: 100%;
          border-radius: 14px;
          padding: 10px 12px;
          outline: none;
          color: white;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }
        textarea { min-height: 110px; resize: vertical; }
        .grid { display:grid; gap: 12px; grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .card { background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.10); border-radius: 22px; padding: 16px; }
        .tiny { color: rgba(255,255,255,0.55); font-size: 12px; }
        .avatarBox {
          width: 84px; height: 84px; border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          overflow:hidden;
        }
        .avatarBox img { width:100%; height:100%; object-fit:cover; display:block; }
      `}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
            <p className="mt-1 text-sm text-white/70">
              Your portal identity + what you want other members to see.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/members" className="pill text-sm">
              ← Back
            </Link>
            <Link href="/members/directory" className="pill text-sm">
              Directory
            </Link>
          </div>
        </div>

        <div className="glass mt-4 p-4">
          <div className="grid">
            <div className="card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Display Avatar</div>
                  <div className="tiny">
                    This is what members see in the directory.
                  </div>
                </div>
                <div className="avatarBox">{avatarUrl ? <img src={avatarUrl} alt="" /> : null}</div>
              </div>

              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                  }}
                />
                <div className="tiny mt-2">
                  Tip: use a clear face/upper-body shot.
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Admin Photo</div>
                  <div className="tiny">
                    Only admins can view this. For back-of-house identity.
                  </div>
                </div>
                <div className="avatarBox">{adminPhotoUrl ? <img src={adminPhotoUrl} alt="" /> : null}</div>
              </div>

              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAdminPhoto(f);
                  }}
                />
                <div className="tiny mt-2">
                  Please use a normal photo (no filters). This is private.
                </div>
              </div>
            </div>
          </div>

          <div className="grid mt-4">
            <div>
              <label>Portal Name (display)</label>
              <input
                value={form.display_name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                placeholder="Riot Bryant"
              />
            </div>

            <div>
              <label>Username (no spaces)</label>
              <input
                value={form.username ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="riotbryant"
              />
              <div className="tiny mt-1">
                Allowed: letters, numbers, underscore. We auto-clean it on save.
              </div>
            </div>

            <div>
              <label>Phone (optional)</label>
              <input
                value={form.phone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 555-5555"
              />
            </div>

            <div>
              <label>Email (optional)</label>
              <input
                value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label>Instagram (optional)</label>
              <input
                value={form.instagram ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                placeholder="@handle"
              />
            </div>

            <div>
              <label>TikTok (optional)</label>
              <input
                value={form.tiktok ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, tiktok: e.target.value }))}
                placeholder="@handle"
              />
            </div>

            <div>
              <label>X (optional)</label>
              <input
                value={form.x ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, x: e.target.value }))}
                placeholder="@handle"
              />
            </div>

            <div>
              <label>LinkedIn (optional)</label>
              <input
                value={form.linkedin ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                placeholder="linkedin.com/in/… or name"
              />
            </div>
          </div>

          <div className="mt-4">
            <label>Bio (optional)</label>
            <textarea
              value={form.bio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A few lines about you. Keep it real."
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              className={`pill primary text-sm ${saving ? "opacity-70" : ""}`}
              disabled={!canSave || saving}
              onClick={saveProfile}
            >
              {saving ? "Saving…" : "Save"}
            </button>

            {msg ? <div className="tiny">{msg}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
