"use client";

import Link from "next/link";
import { useMemo } from "react";

const ROOM_MAP: Record<string, { title: string; jitsi: string }> = {
  "weekly-meeting": {
    title: "Weekly Meeting",
    jitsi: "https://meet.jit.si/SpaceToLand-broThercollecTive",
  },
  "chill-room-1": {
    title: "Chill Room 1",
    jitsi: "https://meet.jit.si/ChillRoom1",
  },
  "chill-room-2": {
    title: "Chill Room 2",
    jitsi: "https://meet.jit.si/ChillRoom2",
  },
  "admin-only": {
    title: "Admin Only",
    jitsi: "https://meet.jit.si/broTAdminOnly",
  },
};

export default function RoomEmbedPage({
  params,
}: {
  params: { room: string };
}) {
  const cfg = useMemo(() => ROOM_MAP[params.room], [params.room]);

  if (!cfg) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center">
        <div className="text-sm text-white/70">
          Room not found. <Link className="underline" href="/members/rooms">Back</Link>
        </div>
      </div>
    );
  }

  // Jitsi embedding: add #config.prejoinPageEnabled=false to reduce friction
  const src = `${cfg.jitsi}#config.prejoinPageEnabled=false`;

  return (
    <div className="min-h-screen text-white embedBg">
      <style>{`
        .embedBg{
          background:
            radial-gradient(1000px 700px at 20% 20%, rgba(0,210,255,0.12), transparent 60%),
            radial-gradient(900px 700px at 80% 40%, rgba(255,60,210,0.10), transparent 60%),
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
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .btn:hover{
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.08);
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">broT Lounge</div>
            <div className="text-xs text-white/60">{cfg.title}</div>
          </div>

          <div className="flex gap-2">
            <Link href="/members/rooms" className="h-10 rounded-2xl px-4 grid place-items-center text-sm btn">
              ← Back
            </Link>
            <a href={cfg.jitsi} target="_blank" rel="noreferrer" className="h-10 rounded-2xl px-4 grid place-items-center text-sm btn">
              Open in new tab
            </a>
          </div>
        </div>

        <div className="mt-5 glass rounded-[28px] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-lg font-semibold">{cfg.title}</div>
            <div className="text-xs text-white/60">Nothing auto-joins. You choose to enter.</div>
          </div>

          <div style={{ height: "min(72vh, 760px)" }}>
            <iframe
              src={src}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ width: "100%", height: "100%", border: "0" }}
              title={cfg.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
