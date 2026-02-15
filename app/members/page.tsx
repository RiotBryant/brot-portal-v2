"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Role = "member" | "admin" | "superadmin";

export default function MembersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>("member");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
        return;
      }

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      setRole((r?.role as Role) ?? "member");
      setLoading(false);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div className="p-6 text-white/70">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      {/* subtle “space” vibe */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
           style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(70,170,255,0.18), transparent 60%)" }} />

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/50">
            Role: <span className="text-white/80">{role}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/30 hover:text-white"
          >
            Log out
          </button>
        </div>

        {/* Hero */}
        <div className="mt-10 text-center">
          {/* Replace src with your broT portal logo once you add it to /public */}
          <div className="mx-auto h-44 w-44 rounded-full border border-white/10 bg-black/30 shadow-[0_0_50px_rgba(70,170,255,0.20)] animate-[pulse_5s_ease-in-out_infinite]" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">broT Members Portal</h1>
          <p className="mt-3 text-white/70">
            Built on presence, not noise. Brotherhood without performance.
          </p>
          <p className="mt-2 text-xs text-white/45">
            Nothing auto-joins. Nothing is recorded here. You’re safe.
          </p>
        </div>

        {/* Primary action */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Request Support</h2>
          <p className="mt-2 text-sm text-white/70">
            Resources, legal, medical, or something personal. This goes to the admin inbox.
          </p>
          <Link
            href="/members/support"
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-[#46AAFF]/40 bg-black/30 px-5 py-3 text-sm font-medium hover:border-[#46AAFF]/70 hover:shadow-[0_0_30px_rgba(70,170,255,0.25)]"
          >
            Open Support Form
          </Link>
        </div>

        {/* Secondary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Community</h3>
            <p className="mt-2 text-sm text-white/70">GroupMe for now. Portal chat later.</p>

            <a
              href="https://groupme.com/join_group/113145463/Wxy8CAFk"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm hover:border-white/30"
            >
              Open GroupMe
            </a>

            <Link
              href="/members/rooms"
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm hover:border-white/30"
            >
              Enter Rooms
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Forms</h3>
            <p className="mt-2 text-sm text-white/70">
              Temporary Google forms. Native portal forms coming soon.
            </p>
            <Link
              href="/members/forms"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm hover:border-white/30"
            >
              Open Forms
            </Link>
          </div>
        </div>

        {/* broBOT */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-semibold">broBOT</h3>
          <p className="mt-2 text-sm text-white/70">
            Space-mode companion. Guidance, grounding, and routing. (Full chamber coming soon.)
          </p>
          <Link
            href="/members/brobot"
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#46AAFF]/25 bg-black/30 px-4 py-3 text-sm hover:border-[#46AAFF]/50"
          >
            Open broBOT (Coming Soon)
          </Link>
        </div>

        {/* Admin-only */}
        {(role === "admin" || role === "superadmin") && (
          <div className="mt-6 rounded-2xl border border-[#46AAFF]/20 bg-white/5 p-6">
            <h3 className="font-semibold">Admin Layer</h3>
            <p className="mt-2 text-sm text-white/70">Inbox + requests. (Members never see this.)</p>
            <Link
              href="/admin/inbox"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#46AAFF]/40 bg-black/30 px-4 py-3 text-sm hover:border-[#46AAFF]/70"
            >
              Open Admin Inbox
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

