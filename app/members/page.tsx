"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Role = "member" | "admin" | "superadmin";

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/65">{desc}</div>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
  newTab,
}: {
  href: string;
  children: React.ReactNode;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
      className="inline-flex w-full items-center justify-center rounded-2xl border border-[#46AAFF]/35 bg-black/40 px-5 py-3 text-sm font-medium text-white hover:border-[#46AAFF]/70 hover:shadow-[0_0_30px_rgba(70,170,255,0.22)]"
    >
      {children}
    </Link>
  );
}

function GhostButton({
  href,
  children,
  newTab,
}: {
  href: string;
  children: React.ReactNode;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/85 hover:border-white/25 hover:text-white"
    >
      {children}
    </Link>
  );
}

export default function MembersPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("member");

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.push("/login");
        return;
      }

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .maybeSingle();

      setRole(((r?.role as Role) ?? "member") as Role);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 0%, rgba(70,170,255,0.18), transparent 65%), radial-gradient(40% 40% at 80% 30%, rgba(168,85,247,0.08), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/70">
              Role: <span className="text-white/90">{role}</span>
            </span>

            {(role === "admin" || role === "superadmin") && (
              <Link
                href="/admin/inbox"
                className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-xs text-white/80 hover:border-white/25 hover:text-white"
              >
                Admin Inbox
              </Link>
            )}
          </div>

          <button
            onClick={logout}
            className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:border-white/25 hover:text-white"
          >
            Log out
          </button>
        </div>

        {/* hero */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
            <div className="flex items-center gap-4">
              {/* Pulsing logo */}
              <div className="relative">
                <div className="absolute -inset-3 rounded-3xl opacity-50 blur-xl animate-pulse bg-[#46AAFF]/20" />
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-3">
                  {/* expects public/broTportal.png */}
                  <Image
                    src="/broTportal.png"
                    alt="broT Members Portal"
                    width={92}
                    height={92}
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
                  Nothing auto-joins. Nothing is recorded here. You’re safe.
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PrimaryButton href="/members/support">Request Support</PrimaryButton>
              <GhostButton href="https://groupme.com/join_group/113145463/Wxy8CAFk" newTab>
                Open GroupMe
              </GhostButton>
            </div>
          </div>

          {/* broBOT teaser */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
            <div className="text-lg font-semibold">broBOT</div>
            <div className="mt-1 text-sm text-white/65">
              Space-mode companion for grounding, guidance, and routing.
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white/75">
              Coming soon: broBOT inside the portal (not a widget mess).
            </div>

            <div className="mt-5">
              <GhostButton href="/members/brobot">Open broBOT (Coming Soon)</GhostButton>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card
            title="Support"
            desc="Private request → goes to the admin inbox. Trackable and calm."
          >
            <div className="grid gap-3">
              <PrimaryButton href="/members/support">Open Support Form</PrimaryButton>
              <div className="text-xs text-white/50">
                Categories: resources • legal • medical • other
              </div>
            </div>
          </Card>

          <Card
            title="Rooms"
            desc="Click to open. No auto-join. Rooms are secondary on purpose."
          >
            <div className="grid gap-3">
              <GhostButton href="https://meet.jit.si/SpaceToLand-broThercollecTive" newTab>
                Meeting Room
              </GhostButton>
              <GhostButton href="https://meet.jit.si/ChillRoom1" newTab>
                Chill Room 1
              </GhostButton>
              <GhostButton href="https://meet.jit.si/ChillRoom2" newTab>
                Chill Room 2
              </GhostButton>
              <GhostButton href="https://meet.jit.si/broTAdminOnly" newTab>
                Admin Only
              </GhostButton>
            </div>
          </Card>

          <Card
            title="Forms"
            desc="Google forms for now. Portal-native forms come after launch."
          >
            <div className="grid gap-3">
              <GhostButton href="/members/forms">Open Forms</GhostButton>
              <div className="text-xs text-white/50">
                We’re building forward — no rework chaos.
              </div>
            </div>
          </Card>
        </div>

        {/* footer vibe */}
        <div className="mt-10 text-center text-xs text-white/45">
          This is a private layer. Quiet by design.
        </div>
      </div>
    </div>
  );
}
