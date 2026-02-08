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

  const redirectTo = useMemo(() => {
    // safe-ish fallback
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/protected";
  }, [searchParams]);

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // user-facing message
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If already logged in, bounce them
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        // Don't hard-crash UI; show something actionable
        setError(error.message || "Could not check session.");
        return;
      }

      if (data.session) {
        router.replace(redirectTo);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, redirectTo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const email = form.email.trim();
    const password = form.password;

    // Client-side validation (fast + clearer than Supabase errors)
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
        // normalize common auth errors into human text
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("invalid login")) {
          setError("Incorrect email or password.");
        } else if (msg.includes("email not confirmed")) {
          setError("Check your email and confirm your account first.");
        } else if (msg.includes("too many")) {
          setError("Too many attempts. Try again in a bit.");
        } else {
          setError(error.message || "Login failed.");
        }
        return;
      }

      if (!data.session) {
        // rare, but handle it
        setError("Login didn’t complete. Try again.");
        return;
      }

      setSuccess("Logged in. Redirecting…");
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function onSendReset() {
    setError(null);
    setSuccess(null);

    const email = form.email.trim();
    if (!email) return setError("Enter your email first.");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // make sure you have this route if you use it
        redirectTo: `${location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message || "Could not send reset email.");
        return;
      }

      setSuccess("Password reset email sent (check spam too).");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Login</h1>
      <p style={{ opacity: 0.75, marginBottom: 16 }}>
        Sign in to continue.
      </p>

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
            onChange={(e) =>
              setForm((s) => ({ ...s, password: e.target.value }))
            }
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

    // move user to main portal
    window.location.href = "/portal";
  }

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "400px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "1rem" }}>Log in</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.5rem",
              border: "1px solid #ff8888",
              backgroundColor: "#442222",
              color: "white",
            }}
          >
            Login error: {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}
