"use client";

import Link from "next/link";

const rooms = [
  {
    title: "Meeting Room",
    href: "https://meet.jit.si/SpaceToLand-broThercollecTive",
    img: "/brot-lounge.png", // best available “live” tile image
  },
  {
    title: "Chill Room 1",
    href: "https://meet.jit.si/ChillRoom1",
    img: "/chill-room-1.png",
  },
  {
    title: "Chill Room 2",
    href: "https://meet.jit.si/ChillRoom2",
    img: "/chill-room-2.png",
  },
  {
    title: "Admin Only",
    href: "https://meet.jit.si/broTAdminOnly",
    img: "/logo.png",
  },
];

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 60px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }
        .tile {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.10);
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .tile:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.18);
          background: rgba(0,0,0,0.45);
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">broT Lounge</h1>
            <p className="mt-2 text-sm text-white/70">
              Logos only. Click opens a room. Nothing auto-joins.
            </p>
          </div>

          <Link
            href="/members"
            className="rounded-xl px-4 h-10 grid place-items-center glass text-sm text-white/80 hover:text-white"
          >
            Back
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rooms.map((r) => (
            <a
              key={r.title}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="tile rounded-2xl p-5"
              aria-label={r.title}
              title={r.title}
            >
              <div className="flex items-center gap-4">
                <img
                  src={r.img}
                  alt={r.title}
                  className="h-14 w-14 rounded-2xl border border-white/10 bg-black/30 object-cover"
                />
                <div>
                  <div className="text-lg font-semibold">{r.title}</div>
                  <div className="mt-1 text-xs text-white/55">Opens in new tab</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-xs text-white/45">
          Secondary on purpose. Click opens — no auto-join.
        </div>
      </div>
    </div>
  );
}
