"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    router.push("/members");
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Members Login</h1>

      <p style={{ marginBottom: 20, opacity: 0.8 }}>
        Username = your email. Password is what you were given.
      </p>

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email (username)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
          autoComplete="email"
          required
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
          type="password"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, fontSize: 16, cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        {msg && <div style={{ color: "crimson" }}>{msg}</div>}
      </form>
    </div>
  );
}
