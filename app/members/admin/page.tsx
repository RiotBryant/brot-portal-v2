"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);

  async function load() {
    const { data } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests(data || []);
  }

  async function approve(id: string, email: string) {
    await supabase.from("access_requests").update({ status: "approved" }).eq("id", id);
    alert(`Approved ${email}`);
    load();
  }

  async function deny(id: string) {
    await supabase.from("access_requests").update({ status: "denied" }).eq("id", id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ padding: 48 }}>
      <h1>Admin Dashboard</h1>
      {requests.map((r) => (
        <div key={r.id} style={{ borderBottom: "1px solid #ccc", padding: 12 }}>
          <div>{r.email}</div>
          <div>{r.message}</div>
          <button onClick={() => approve(r.id, r.email)}>Approve</button>
          <button onClick={() => deny(r.id)}>Deny</button>
        </div>
      ))}
    </main>
  );
}
