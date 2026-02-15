"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function FormsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-6 text-white/70">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <button onClick={() => router.push("/members")} className="text-sm text-white/60 hover:text-white">
          ← Back to Portal
        </button>

        <h1 className="mt-6 text-2xl font-semibold">Forms</h1>
        <p className="mt-2 text-sm text-white/70">
          Temporary Google forms. Native portal forms will replace these later without changing the layout.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/70">
            Paste your Google Form link(s) here as buttons or embed them later.
          </div>

          {/* Replace these hrefs with your real form URLs */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm hover:border-white/30"
               href="#" target="_blank" rel="noreferrer">
              Member Intake (Google)
            </a>
            <a className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm hover:border-white/30"
               href="#" target="_blank" rel="noreferrer">
              Onboarding (Google)
            </a>
          </div>

          <div className="mt-6 text-xs text-white/45">
            Coming soon: portal-native forms + member file view (admin-only).
          </div>
        </div>
      </div>
    </div>
  );
}
