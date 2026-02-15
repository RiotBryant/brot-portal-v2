"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BroChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState<any>(null);
  const [role, setRole] = useState("member");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setMe(data.user);
      if (!data.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      setRole(p?.role || "member");
    });

    supabase
      .from("group_messages")
      .select("id, content, created_at, profiles(username)")
      .order("created_at")
      .then(({ data }) => setMessages(data || []));

    const channel = supabase
      .channel("brochat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_messages" },
        async () => {
          const { data } = await supabase
            .from("group_messages")
            .select("id, content, created_at, profiles(username)")
            .order("created_at");
          setMessages(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function send() {
    if (!text.trim()) return;
    await supabase.from("group_messages").insert({
      user_id: me.id,
      content: text,
    });
    setText("");
  }

  async function del(id: string) {
    await supabase.from("group_messages").delete().eq("id", id);
    setMessages((m) => m.filter((x) => x.id !== id));
  }

  return (
    <main style={{ padding: 48 }}>
      <h1>broChAT</h1>

      {messages.map((m) => (
        <div key={m.id}>
          <b>{m.profiles?.username || "member"}:</b> {m.content}
          {["admin", "superadmin"].includes(role) && (
            <button onClick={() => del(m.id)}>x</button>
          )}
        </div>
      ))}

      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </main>
  );
}
