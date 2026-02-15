"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Room = {
  slug: string;
  title: string;
  subtitle: string;
};

const ROOMS: Room[] = [
  {
    slug: "weekly",
    title: "Weekly Meeting",
    subtitle: "Primary room • steady cadence",
  },
  {
    slug: "chill-1",
    title: "Chill Room 1",
    subtitle: "Low pressure • drop in",
  },
  {
    slug: "chill-2",
    title: "Chill Room 2",
    subtitle: "High energy talks • sharpen it",
  },
  {
    slug: "admin",
    title: "Admin Only",
    subtitle: "Locked by trust",
  },
];

export default function RoomsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">broT Lounge</h1>
            <p className="mt-1 text-sm text-white/70">Choose a room. No auto-join.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="h-10 rounded-full px-4 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
            >
              ← Back
            </button>

            <Link
              href="/members/rooms/weekly"
              className="h-10 rounded-full px-4 text-sm bg-white text-black hover:opacity-90 transition grid place-items-center"
            >
              Weekly Meeting
            </Link>
          </div>
        </div>

        {/* Centered card */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_80px_rgba(120,90,255,0.10)]">
          <div className="grid gap-4">
            {ROOMS.map((room) => (
              <div
                key={room.slug}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-base font-semibold">{room.title}</div>
                  <div className="mt-1 text-sm text-white/60">{room.subtitle}</div>
                </div>

                <Link
                  href={`/members/rooms/${room.slug}`}
                  className="h-11 rounded-full px-5 text-sm bg-white text-black hover:opacity-90 transition grid place-items-center"
                >
                  Enter
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-xs text-white/45">
          Quiet by design • presence over performance
        </div>
      </div>
    </div>
  );
}
