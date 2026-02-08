"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type FormState = {
  email: string;
  password: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Supports /login?next=/portal (only allows internal paths)
  const redirectTo = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/portal"; // <-- default
  }, [searchParams]);

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in, bounce them
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("invalid login")) setError("Incorrect email or password.");
        else if (msg.includes("email not confirmed")) setError("Confirm your email first.");
        else if (msg.includes("too many")) setError("Too many attempts. Try again later.");
        else setError(error.message || "Login failed.");
        return;
      }

      if (!data.session) {
        setError("Login didn’t complete. Try again.");
        return;
      }

      setSuccess("Logged in. Redirecting…");

      // IMPORTANT: use router, not window.location
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSendReset() {
    setError(null);
    setSuccess(null);

    const email = form.email.trim();
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message || "Could not send reset email.");
        return;
      }

      setSuccess("Password reset email sent. Check spam too.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error. Try again.");
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

      {success && (
        <div
          style={{
            background: "#e7ffe5",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            disabled={loading}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={loading}
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
          onClick={onSendReset}
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ccc",
            background: "transparent",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Forgot password
        </button>
      </form>
    </main>
  );
}
