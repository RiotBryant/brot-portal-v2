"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(p || {});
    });
  }, []);

  async function save() {
    setSaving(true);
    await supabase.from("profiles").upsert(profile);
    setSaving(false);
    alert("Saved");
  }

  function field(name: string, label: string) {
    return (
      <div>
        <label>{label}</label>
        <input
          value={profile[name] || ""}
          onChange={(e) => setProfile({ ...profile, [name]: e.target.value })}
        />
      </div>
    );
  }

  return (
    <main style={{ padding: 48, maxWidth: 600 }}>
      <h1>My Profile</h1>

      {field("display_name", "Display Name")}
      {field("username", "Username")}
      {field("pronouns", "Pronouns")}
      {field("bio", "Bio")}
      {field("email", "Email")}
      {field("phone", "Phone")}
      {field("location", "Location")}
      {field("avatar_url", "Avatar URL")}

      <div>
        <label>Role</label>
        <input value={profile.role || ""} disabled />
      </div>

      <div>
        <label>Title</label>
        <input value={profile.title || ""} disabled />
      </div>

      <button disabled={saving} onClick={save}>
        Save
      </button>
    </main>
  );
}
