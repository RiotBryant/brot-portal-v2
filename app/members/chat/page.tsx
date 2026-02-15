"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
  };
};

export default function BroChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [me, setMe] = useState<any>(null);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      setMe(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || "member");

      const { data: initialMessages } = await supabase
        .from("group_messages")
        .select("id, content, created_at, profiles(username)")
        .order("created_at", { ascending: true });

      setMessages(initialMessages || []);
      setLoading(false);
    }

    init();

    const channel = supabase
      .channel("brochat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function send() {
    if (!text.trim() || !me) return;

    await supabase.from("group_messages").insert({
      user_id: me.id,
      content: text.trim(),
    });

    setText("");
  }

  async function del(id: string) {
    await supabase.from("group_messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) return <p>Loading chat...</p>;

  return (
    <main style={{ padding: 48 }}>
      <h1>broChAT</h1>

      {messages.map((m) => (
        <div key={m.id} style={{ marginBottom: 8 }}>
          <b>{m.profiles?.username || "member"}:</b> {m.content}
          {["admin", "superadmin"].includes(role) && (
            <button
              style={{ marginLeft: 8 }}
              onClick={() => del(m.id)}
            >
              x
            </button>
          )}
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={send} style={{ marginLeft: 8 }}>
          Send
        </button>
      </div>
    </main>
  );
}
