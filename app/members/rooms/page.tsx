"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RoomsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("member");
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(
    () => role === "admin" || role === "superadmin",
    [role]
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        router.replace("/login");
        return;
      }

      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      setRole(r?.role ?? "member");
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white loungeBg">
      <style>{`
        .loungeBg{
          background:
            radial-gradient(1000px 600px at 22% 20%, rgba(0,210,255,0.14), transparent 60%),
            radial-gradient(900px 600px at 84% 42%, rgba(255,60,210,0.12), transparent 62%),
            #07070b;
        }
        .glass{
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }
        .btn{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          transition: transform .12s ease, border-color .12s ease, background .12s ease, box-shadow .12s ease;
        }
        .btn:hover{
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 4px rgba(120,190,255,0.06);
        }
        .btnPrimary{
          background: #ffffff;
          color: #000000;
          border: none;
          box-shadow: 0 10px 40px rgba(0,0,0,0.35);
        }
        .btnPrimary:hover{
          box-shadow: 0 0 0 4px rgba(120,190,255,0.12), 0 10px 45px rgba(0,0,0,0.38);
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">broT Lounge</div>
            <div className="text-xs text-white/60">click opens • no auto-join</div>
          </div>
          <Link href="/members" className="h-10 rounded-2xl px-4 grid place-items-center text-sm btn">
            ← Back
          </Link>
        </div>

        <div className="mt-6 glass rounded-[28px] p-7">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Choose a room.
          </h1>
          <div className="mt-2 text-sm text-white/70">
            Every room opens the same way: branded page + back button + embedded room.
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Link href="/members/rooms/weekly-meeting" className="glass rounded-[22px] p-6 hover:border-white/20 transition border border-white/10">
              <div className="text-sm text-white/70">Primary</div>
              <div className="mt-1 text-lg font-semibold">Weekly Meeting</div>
              <div className="mt-2 inline-flex h-10 rounded-2xl px-4 items-center text-sm btn btnPrimary">
                Enter
              </div>
            </Link>

            <Link href="/members/rooms/chill-room-1" className="glass rounded-[22px] p-6 hover:border-white/20 transition border border-white/10">
              <div className="text-sm text-white/70">Chill</div>
              <div className="mt-1 text-lg font-semibold">Chill Room 1</div>
              <div className="mt-2 inline-flex h-10 rounded-2xl px-4 items-center text-sm btn btnPrimary">
                Enter
              </div>
            </Link>

            <Link href="/members/rooms/chill-room-2" className="glass rounded-[22px] p-6 hover:border-white/20 transition border border-white/10">
              <div className="text-sm text-white/70">Chill</div>
              <div className="mt-1 text-lg font-semibold">Chill Room 2</div>
              <div className="mt-2 inline-flex h-10 rounded-2xl px-4 items-center text-sm btn btnPrimary">
                Enter
              </div>
            </Link>

            {isAdmin ? (
              <Link href="/members/rooms/admin-only" className="glass rounded-[22px] p-6 hover:border-white/20 transition border border-white/10">
                <div className="text-sm text-white/70">Restricted</div>
                <div className="mt-1 text-lg font-semibold">Admin Only</div>
                <div className="mt-2 inline-flex h-10 rounded-2xl px-4 items-center text-sm btn">
                  Enter
                </div>
              </Link>
            ) : (
              <div className="glass rounded-[22px] p-6 border border-white/10 opacity-70">
                <div className="text-sm text-white/70">Restricted</div>
                <div className="mt-1 text-lg font-semibold">Admin Only</div>
                <div className="mt-2 text-sm text-white/60">locked by trust</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
