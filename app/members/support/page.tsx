"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Category = "resources" | "legal" | "medical" | "other";

export default function SupportPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState<Category>("resources");
  const [urgent, setUrgent] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return subject.trim().length >= 3 && message.trim().length >= 10;
  }, [subject, message]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.replace("/login");
      else setLoading(false);
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!canSubmit) {
      setErr("Add a subject + a clear message (10+ chars).");
      return;
    }

    setSubmitting(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      // Insert request
      const { data: req, error: reqErr } = await supabase
        .from("requests")
        .insert({
          created_by: user.id,
          category,
          subject: subject.trim(),
          body: message.trim(),
          status: "open",
          visibility: "admins",
        })
        .select("id")
        .single();

      if (reqErr) throw reqErr;

      // Optional: create first message record (future-proof thread)
      await supabase.from("request_messages").insert({
        request_id: req.id,
        author_id: user.id,
        body: `URGENT? ${urgent.trim() || "Not specified"}\n\n${message.trim()}`,
        is_internal: false,
      });

      setOk("Sent. This is now in the admin inbox.");
      setSubject("");
      setUrgent("");
      setMessage("");

      // If you want to bounce them back after a sec:
      // setTimeout(() => router.push("/members"), 900);
    } catch (e: any) {
      setErr(e?.message ?? "Something failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-6">
          <Link
            href="/members"
            className="text-sm text-white/70 hover:text-white"
          >
            ← Back to portal
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(80,170,255,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight">
            Request Support
          </h1>
          <p className="mt-2 text-sm text-white/70">
            This goes to the admin inbox. Quiet by design.
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-white/80">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="h-11 rounded-xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/25"
              >
                <option value="resources">resources</option>
                <option value="legal">legal</option>
                <option value="medical">medical</option>
                <option value="other">other</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/80">
                Is this urgent? (tell us)
              </label>
              <input
                value={urgent}
                onChange={(e) => setUrgent(e.target.value)}
                placeholder="Example: yes — need a call tonight / no — whenever"
                className="h-11 rounded-xl border border-white/10 bg-black/40 px-3 text-white placeholder:text-white/35 outline-none focus:border-white/25"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/80">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short + clear"
                className="h-11 rounded-xl border border-white/10 bg-black/40 px-3 text-white placeholder:text-white/35 outline-none focus:border-white/25"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/80">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write what’s going on. No performance required."
                rows={6}
                className="rounded-xl border border-white/10 bg-black/40 p-3 text-white placeholder:text-white/35 outline-none focus:border-white/25"
              />
            </div>

            {err ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            {ok ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {ok}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="mt-2 h-11 rounded-xl bg-white text-black font-medium tracking-tight disabled:opacity-40"
            >
              {submitting ? "Sending…" : "Send to Admin Inbox"}
            </button>

            <p className="text-xs text-white/45">
              If you’re in immediate danger, call local emergency services.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
