"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type RoomDef = {
  slug: string;
  title: string;
  subtitle: string;
  // Put your real Jitsi links here (or keep placeholders for now)
  url: string;
  adminOnly?: boolean;
};

const ROOMS: RoomDef[] = [
  {
    slug: "weekly",
    title: "Weekly Meeting",
    subtitle: "Primary room • steady cadence",
    url: "https://meet.jit.si/broThercollecTive-VirtualMeeting",
  },
  {
    slug: "chill-1",
    title: "Chill Room 1",
    subtitle: "Low pressure • drop in",
    url: "https://meet.jit.si/SpaceToLand-broThercollecTive",
  },
  {
    slug: "chill-2",
    title: "Chill Room 2",
    subtitle: "Quiet talk • reset",
    url: "https://meet.jit.si/SpaceToLand-broThercollecTive-2",
  },
  {
    slug: "admin",
    title: "Admin Meeting Room",
    subtitle: "Locked by trust",
    url: "https://meet.jit.si/broThercollecTive-AdminRoom",
    adminOnly: true,
  },
];

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("member");

  const room = useMemo(() => ROOMS.find((r) => r.slug === slug), [slug]);

  useEffect(() => {
    (async () => {
      // 1) Must be logged in
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.replace(`/login?next=${encodeURIComponent(`/members/room/${slug || "weekly"}`)}`);
        return;
      }

      // 2) Get role (for admin-only room)
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        router.replace(`/login?next=${encodeURIComponent(`/members/room/${slug || "weekly"}`)}`);
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
  }, [router, slug]);

  const isAdmin = role === "admin" || role === "superadmin";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Loading…</div>
      </div>
    );
  }

  // If slug not found, bounce back to lounge
  if (!room) {
    router.replace("/members/lounge");
    return null;
  }

  // Admin guard
  if (room.adminOnly && !isAdmin) {
    router.replace("/members/lounge");
    return null;
  }

  const baseCSS = `
    .wrap { width: min(980px, calc(100% - 24px)); margin: 0 auto; padding: 24px 0 36px; }
    .glass {
      background:
        radial-gradient(900px 460px at 20% 25%, rgba(80,170,255,0.18), transparent 60%),
        radial-gradient(900px 460px at 80% 25%, rgba(255,80,210,0.12), transparent 60%),
        rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow: 0 0 70px rgba(0,0,0,0.45);
    }
    .btn {
      display:inline-flex; align-items:center; justify-content:center;
      height:44px; padding:0 16px; border-radius:999px;
      border:1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color:#fff; font-size:14px;
      transition: transform .12s ease, background .12s ease, border-color .12s ease;
      cursor:pointer;
      text-decoration:none;
    }
    .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
    .btnPrimary { background:#fff; color:#000; border:none; }
    .frame {
      width: 100%;
      height: 70vh;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 24px;
      overflow: hidden;
      background: rgba(0,0,0,0.35);
    }
    .hint { color: rgba(255,255,255,0.65); font-size: 14px; }
  `;

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{baseCSS}</style>

      <div className="wrap">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{room.title}</div>
            <div className="text-sm text-white/60">{room.subtitle}</div>
          </div>

          <div className="flex gap-2">
            <Link href="/members/lounge" className="btn">
              ← Lounge
            </Link>
            <a className="btn btnPrimary" href={room.url} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 mt-5">
          <div className="hint">
            Nothing auto-joins. If the embed doesn’t load (some browsers block it), use “Open in new tab.”
          </div>

          <div className="frame mt-4">
            <iframe
              title={room.title}
              src={room.url}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ width: "100%", height: "100%", border: "0" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
