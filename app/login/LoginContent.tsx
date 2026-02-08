"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // /login?next=/portal  (safe: only internal paths)
  const redirectTo = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/portal";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // if already logged in -> go where they should be
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!alive) return;

      if (error) {
        setError(error.message || "Could not check session.");
        return;
      }

      if (data.session) {
        router.replace(redirectTo);
        router.refresh();
      }
    })();

    return () => {
      alive = false;
    };
  }, [router, redirectTo]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);

    const cleanEmail = email.trim();

    // basic validation
    if (!cleanEmail || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError("Enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("invalid login")) setError("Incorrect email or password.");
        else if (msg.includes("email not confirmed")) setError("Confirm your email first.");
        else setError(error.message || "Login failed.");
        return;
      }

      if (!data.session) {
        setError("Login didn’t complete. Try again.");
        return;
      }

      setStatus("Logged in. Redirecting…");
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setStatus(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Enter your email first.");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError("Enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message || "Could not send reset email.");
        return;
      }

      setStatus("Reset email sent. Check spam too.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Login</h1>
      <p style={{ opacity: 0.75, marginBottom: 16 }}>Sign in to continue.</p>

      {error && (
        <div
          role="alert"
          style={{
            background: "#ffe5e5",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {status && (
        <div
          style={{
            background: "#e7ffe5",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          {status}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="you@email.com"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={loa
