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

  const redirectTo = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/portal";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

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

    if (!cleanEmail || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError("Enter a valid email.");
      return;
    }

    setLoading(true);
    tr
