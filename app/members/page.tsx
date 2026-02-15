"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type RoleName = "member" | "admin" | "superadmin";

export default function MembersPage() {
  const [role, setRole] = useState<RoleName>("member");

  useEffect(() => {
    (async () => {
      // If you already have role logic elsewhere, this won't break anything.
      // Worst case: it just stays "member" and the page still works.
      try {
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;

        if (!userId) return;

        // Try to read role from your existing table if present.
        // If this fails, we just default to member.
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        const r = (roleRow?.role as RoleName) || "member";
        setRole(r);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 0%, rgba(70,170,255,0.18), transparent 65%), radial-gradient(35% 35% at 20% 30%, rgba(236,72,153,0.08), transparent 60%), radial-gradient(35% 35% at 85% 55%, rgba(99,102,241,0.08), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Pulsing portal logo */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl blur-2xl animate-pulse bg-[#46AAFF]/15" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-2">
                {/* expects /public/broTportal.png */}
                <Image
                  src="/broTportal.png"
                  alt="broT Members Portal"
                  width={78}
                  height={78}
                  priority
                />
              </div>
            </div>

            <div>
              <div className="text-3xl font-semibold tracking-tight">
                broT Members Portal
              </div>
              <div className="mt-2 text-sm text-white/70">
                Built on presence, not noise. Brotherhood without performance.
              </div>
              <div className="mt-2 text-xs text-white/55">
                Nothing auto-joins. Nothing is recorded. You’re safe.
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-white/50">Role: {role}</div>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/85 hover:border-white/25 hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Card
            title="Request Support"
            desc="Resources, legal, medical, or something personal. This goes to the admin inbox."
            ctaText="Open Support Form"
            href="/members/support"
            icon="/brobot.png"
          />

          <Card
            title="Community"
            desc="GroupMe for now. Portal chat later."
            ctaText="Open GroupMe"
            href="https://groupme.com/join_group/113145463/Wxy8CAFk"
            external
            icon="/brot-lounge.png"
          />

          <Card
            title="Rooms"
            desc="Nothing auto-joins. Clicking a room opens it."
            ctaText="Enter Rooms"
            href="/members/rooms"
            icon="/chill-room-1.png"
          />

          <Card
            title="Forms"
            desc="Temporary Google forms. Native portal forms coming soon."
            ctaText="Open Forms"
            href="/members/forms"
            icon="/logo.png"
          />
        </div>

        {/* Admin panel shortcut (only shows for admins/superadmin) */}
        {(role === "admin" || role === "superadmin") && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-lg font-semibold tracking-tight">
                  Admin Console
                </div>
                <div className="mt-1 text-sm text-white/65">
                  View support requests in one place.
                </div>
              </div>
              <Link
                href="/admin/inbox"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-sm font-medium text-white hover:border-[#46AAFF]/45 hover:shadow-[0_0_28px_rgba(70,170,255,0.18)]"
              >
                Open Inbox
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-xs text-white/45">
          Quiet by design. Presence over performance.
        </div>
      </div>
    </div>
  );
}

function Card(props: {
  title: string;
  desc: string;
  ctaText: string;
  href: string;
  icon: string;
  external?: boolean;
}) {
  const Inner = (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#46AAFF]/10 blur-3xl transition group-hover:bg-[#46AAFF]/14" />

      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-lg font-semibold tracking-tight">
            {props.title}
          </div>
          <div className="mt-2 text-sm text-white/65">{props.desc}</div>

          <div className="mt-5 inline-flex items-center justify-center rounded-2xl border border-white/12 bg-black/35 px-5 py-3 text-sm font-medium text-white/85 transition group-hover:border-white/25 group-hover:text-white">
            {props.ctaText}
          </div>
        </div>

        <div className="relative shrink-0">
          <div className="absolute -inset-6 rounded-3xl blur-2xl bg-[#46AAFF]/10 opacity-70" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
            <Image
              src={props.icon}
              alt=""
              width={74}
              height={74}
              className="opacity-95"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (props.external) {
    return (
      <a href={props.href} target="_blank" rel="noreferrer">
        {Inner}
      </a>
    );
  }
  return <Link href={props.href}>{Inner}</Link>;
}
