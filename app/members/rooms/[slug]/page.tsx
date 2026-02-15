"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type RoomConfig = {
  title: string;
  subtitle: string;
  jitsiUrl: string;
};

const ROOM_MAP: Record<string, RoomConfig> = {
  "weekly": {
    title: "Weekly Meeting",
    subtitle: "Primary room • steady cadence",
    jitsiUrl: "https://meet.jit.si/SpaceToLand-broThercollecTive",
  },
  "chill-1": {
    title: "Chill Room 1",
    subtitle: "Low pressure • drop in",
    jitsiUrl: "https://meet.jit.si/ChillRoom1",
  },
  "chill-2": {
    title: "Chill Room 2",
    subtitle: "High energy talks • sharpen it",
    jitsiUrl: "https://meet.jit.si/ChillRoom2",
  },
  "admin": {
    title: "Admin Only",
    subtitle: "Locked by trust",
    jitsiUrl: "https://meet.jit.si/broTAdminOnly",
  },
};

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const room = useMemo(() => ROOM_MAP[params.slug ?? ""], [params.slug]);

  if (!room) {
    return (
      <div className="min-h-screen bg-[#07070b] text-white grid place-items-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-lg font-semibold">Room not found</div>
          <div className="mt-2 text-sm text-white/60">
            That room link doesn’t exist.
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.back()}
              className="h-10 rounded-full px-4 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
            >
              ← Back
            </button>
            <Link
              href="/members/rooms"
              className="h-10 rounded-full px-4 text-sm bg-white text-black hover:opacity-90 transition grid place-items-center"
            >
              Lounge
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{room.title}</h1>
            <p className="mt-1 text-sm text-white/60">{room.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="h-10 rounded-full px-4 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
            >
              ← Back
            </button>

            <Link
              href="/members/rooms"
              className="h-10 rounded-full px-4 text-sm bg-white text-black hover:opacity-90 transition grid place-items-center"
            >
              Lounge
            </Link>
          </div>
        </div>

        {/* Embedded meeting */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-[0_0_120px_rgba(120,90,255,0.10)]">
          <div className="aspect-video w-full">
            <iframe
              src={room.jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
