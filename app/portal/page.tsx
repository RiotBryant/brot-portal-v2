"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PortalPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <main style={{ padding: 48 }}>
      <h1>Member Portal</h1>
      <p>Welcome, {user?.email}</p>

      <ul style={{ marginTop: 24 }}>
        <li>broChAT (coming next)</li>
        <li>Brother Lounge (video)</li>
        <li>Member Directory</li>
        <li>Events</li>
      </ul>
    </main>
  );
}
