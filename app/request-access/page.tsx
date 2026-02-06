"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RequestAccess() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    await supabase.from("access_requests").insert({
      email,
      message,
    });
    alert("Request submitted. You will be contacted.");
    setEmail("");
    setMessage("");
  }

  return (
    <main style={{ padding: 48, maxWidth: 600 }}>
      <h1>Request Access</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea
        placeholder="Why do you want to join?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={submit}>Submit</button>
    </main>
  );
}
