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

  useEffect(() => {
    supabase
      .from("group_messages")
      .select("*")
      .order("created_at")
      .then(({ data }) => setMessages(data || []));

    const channel = supabase
      .channel("brochat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function send() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("group_messages").insert({
      user_id: user?.id,
      content: text,
    });
    setText("");
  }

  return (
    <main style={{ padding: 48 }}>
      <h1>broChAT</h1>
      <div>
        {messages.map((m) => (
          <div key={m.id}>{m.content}</div>
        ))}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </main>
  );
}
