"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ROOM_MAP: Record<string, { title: string; jitsi: string }> = {
  weekly: { title: "Weekly Meeting", jitsi: "https://meet.jit.si/SpaceToLand-broThercollecTive" },
  "chill-1": { title: "Chill Room 1", jitsi: "https://meet.jit.si/ChillRoom1" },
  "chill-2": { title: "Chill Room 2", jitsi: "https://meet.jit.si/ChillRoom2" },
  admin: { title: "Admin Only", jitsi: "https://meet.jit.si/broTAdminOnly" },
};

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const room = useMemo(() => (slug ? ROOM_MAP[String(slug)] : null), [slug]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    })();
  }, [router]);

  if (!room) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="opacity-70 text-sm">Room not found.</div>
      </div>
    );
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
      <style>{`
        .wrap { width: min(1100px, calc(100% - 24px)); margin: 0 auto; padding: 18px 0 26px; }
        .top {
          background:
            radial-gradient(900px 460px at 20% 20%, rgba(80,170,255,0.20), transparent 60%),
            radial-gradient(900px 460px at 80% 30%, rgba(255,80,210,0.14), transparent 60%),
            rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 14px;
          box-shadow: 0 0 70px rgba(0,0,0,0.45);
        }
        .btn {
          display:inline-flex; align-items:center; justify-content:center;
          height:42px; padding:0 14px; border-radius:999px;
          border:1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color:#fff; font-size:14px;
          transition: transform .12s ease, background .12s ease, border-color .12s ease;
        }
        .btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); }
        .btnPrimary { background:#fff; color:#000; border:none; }
        .frameWrap {
          margin-top: 12px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          overflow: hidden;
          background: rgba(0,0,0,0.35);
          box-shadow: 0 0 80px rgba(0,0,0,0.55);
        }
        iframe { width: 100%; height: calc(100vh - 160px); border: 0; }
        @media (max-width: 640px) {
          iframe { height: calc(100vh - 210px); }
        }
      `}</style>

      <div className="wrap">
        <div className="top flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{room.title}</div>
            <div className="text-sm text-white/60">Quiet by design.</div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Link href="/members/lounge" className="btn">← Back</Link>
            <a className="btn btnPrimary" href={room.jitsi} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          </div>
        </div>

        <div className="frameWrap">
          <iframe
            src={room.jitsi}
            allow="camera; microphone; fullscreen; display-capture"
          />
        </div>
      </div>
    </div>
  );
}
