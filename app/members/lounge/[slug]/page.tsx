"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ROOM_MAP: Record<string, { title: string; url: string; adminOnly?: boolean }> = {
  "weekly": { title: "broT Meeting", url: "https://meet.jit.si/broTMeeting" },
  "chill-1": { title: "Chill Room 1", url: "https://meet.jit.si/ChillRoom1" },
  "chill-2": { title: "Chill Room 2", url: "https://meet.jit.si/ChillRoom2" },
  "admin": { title: "Admin Only", url: "https://meet.jit.si/broTAdmin", adminOnly: true },
};

export default function LoungeRedirectPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const slug = (params?.slug || "").toString();
  const room = ROOM_MAP[slug];

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("member");
  const [err, setErr] = useState<string | null>(null);

  const isAdmin = useMemo(() => role === "admin" || role === "superadmin", [role]);

  useEffect(() => {
    (async () => {
      // Must be logged in
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // IMPORTANT: your login page is /login (outside members)
        router.replace(`/login?next=${encodeURIComponent(`/members/lounge/${slug}`)}`);
        return;
      }

      // Role check only for admin room
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        router.replace(`/login?next=${encodeURIComponent(`/members/lounge/${slug}`)}`);
        return;
      }

      const { data: r, error: rErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .maybeSingle();

      if (rErr) console.error(rErr);
      setRole(r?.role ?? "member");

      if (!room) {
        setErr("That room does not exist.");
        setLoading(false);
        return;
      }

      if (room.adminOnly && !(r?.role === "admin" || r?.role === "superadmin")) {
        setErr("Admin room is locked.");
        setLoading(false);
        return;
      }

      // Go to Jitsi
      window.location.href = room.url;
    })();
  }, [router, slug, room]);

  if (loading && !err) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Opening room…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white grid place-items-center px-5">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-lg font-semibold">Can’t open room</div>
        <div className="mt-2 text-sm text-white/70">{err || "Something went wrong."}</div>

        <div className="mt-5 flex gap-2">
          <Link href="/members/lounge" className="h-10 px-4 rounded-xl grid place-items-center border border-white/15 bg-white/5">
            Back to Lounge
          </Link>
          <Link href="/members" className="h-10 px-4 rounded-xl grid place-items-center border border-white/15 bg-white/5">
            Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
