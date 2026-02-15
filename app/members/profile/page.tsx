"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }

      const { data: u } = await supabase.auth.getUser();
      const id = u.user?.id ?? null;
      setUid(id);

      if (id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", id)
          .maybeSingle();

        setUsername(p?.username ?? "");
        setAvatarUrl(p?.avatar_url ?? "");
      }

      setLoading(false);
    })();
  }, [router]);

  async function save() {
    if (!uid) return;
    setSaving(true);
    setMsg(null);

    const cleanName = username.trim();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: uid,
        username: cleanName.length ? cleanName : null,
        avatar_url: avatarUrl.trim().length ? avatarUrl.trim() : null,
      },
      { onConflict: "id" }
    );

    setSaving(false);
    setMsg(error ? `Error: ${error.message}` : "Saved.");
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
      <div className="mx-auto max-w-xl px-5 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Profile</div>
            <div className="text-xs text-white/60">portal name • avatar</div>
          </div>
          <Link href="/members" className="h-10 rounded-2xl px-4 grid place-items-center text-sm border border-white/10 bg-white/5 hover:bg-white/10">
            ← Back
          </Link>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-6">
          <label className="block text-xs text-white/60">Portal name (not email)</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex: Riot Bryant"
            className="mt-2 w-full h-11 rounded-2xl px-4 bg-black/30 border border-white/10 outline-none"
          />

          <label className="block text-xs text-white/60 mt-5">Avatar URL (optional)</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="mt-2 w-full h-11 rounded-2xl px-4 bg-black/30 border border-white/10 outline-none"
          />

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 h-11 rounded-2xl px-5 bg-white text-black font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {msg ? <div className="mt-3 text-sm text-white/70">{msg}</div> : null}
        </div>
      </div>
    </div>
  );
}
