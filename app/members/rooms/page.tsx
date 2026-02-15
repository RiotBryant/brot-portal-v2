"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Role = "member" | "admin" | "superadmin";

const ROOMS = [
  { name: "Meeting Room", url: "https://meet.jit.si/SpaceToLand-broThercollecTive" },
  { name: "Chill Room 1", url: "https://meet.jit.si/ChillRoom1" },
  { name: "Chill Room 2", url: "https://meet.jit.si/ChillRoom2" },
] as const;

export default function RoomsPage() {
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

  if (loading) return <div className="p-6 text-white/70">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <button onClick={() => router.push("/members")} className="text-sm text-white/60 hover:text-white">
          ← Back to Portal
        </button>

        <h1 className="mt-6 text-2xl font-semibold">Rooms</h1>
        <p className="mt-2 text-sm text-white/70">
          Nothing auto-joins. Clicking opens a room in a new tab.
        </p>

        <div className="mt-8 space-y-3">
          {ROOMS.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/25"
            >
              <div className="font-semibold">{r.name}</div>
              <div className="mt-1 text-xs text-white/50">{r.url}</div>
            </a>
          ))}

          {(role === "admin" || role === "superadmin") && (
            <a
              href="https://meet.jit.si/broTAdminOnly"
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-[#46AAFF]/25 bg-white/5 p-5 hover:border-[#46AAFF]/55"
            >
              <div className="font-semibold">Admin Only</div>
              <div className="mt-1 text-xs text-white/50">https://meet.jit.si/broTAdminOnly</div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
