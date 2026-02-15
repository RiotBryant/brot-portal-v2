"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = ["resources", "legal", "medical", "other"] as const;

export default function SupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("resources");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [urgentNote, setUrgentNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
        return;
      }
      setLoading(false);
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("requests").insert({
      created_by: uid,
      category,
      subject,
      body: message,
      urgent_note: urgentNote || null,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    setOk("Submitted. An admin will respond inside the portal.");
    setSubject("");
    setMessage("");
    setUrgentNote("");
  }

  if (loading) return <div className="p-6 text-white/70">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <button
          onClick={() => router.push("/members")}
          className="text-sm text-white/60 hover:text-white"
        >
          ← Back to Portal
        </button>

        <h1 className="mt-6 text-2xl font-semibold">Request Support</h1>
        <p className="mt-2 text-sm text-white/70">
          Private. Direct to the admin inbox. Choose a category, write your subject and message.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <label className="block text-sm text-white/80">
            Category
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-white/80">
            Subject
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={120}
              placeholder="Short summary"
            />
          </label>

          <label className="block text-sm text-white/80">
            Message
            <textarea
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              placeholder="Tell us what’s going on."
            />
          </label>

          <label className="block text-sm text-white/80">
            If urgent, explain why + timeline (optional)
            <textarea
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white"
              value={urgentNote}
              onChange={(e) => setUrgentNote(e.target.value)}
              rows={3}
              placeholder="Example: Court date next week / meds issue today / housing by Friday."
            />
          </label>

          {err && <div className="text-sm text-red-300">{err}</div>}
          {ok && <div className="text-sm text-green-300">{ok}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl border border-[#46AAFF]/40 bg-black/30 px-5 py-3 text-sm font-medium hover:border-[#46AAFF]/70 hover:shadow-[0_0_30px_rgba(70,170,255,0.25)]"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
