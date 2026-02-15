"use client";

import Link from "next/link";

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-[#07070b] text-white">
      <style>{`
        .glass {
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 70px rgba(80,170,255,0.06);
          backdrop-filter: blur(10px);
        }
        .card {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.12);
          transition: transform .12s ease, border-color .12s ease, background .12s ease;
        }
        .card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.22); background: rgba(0,0,0,0.45); }
        .muted { color: rgba(255,255,255,0.70); }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">broT Lounge</h1>
            <p className="mt-1 text-sm muted">Click a room icon. Nothing auto-joins.</p>
          </div>

          <Link href="/members" className="h-10 rounded-full px-5 grid place-items-center text-sm border border-white/15 bg-white/5 hover:bg-white/10">
            Back
          </Link>
        </div>

        <div className="mt-6 glass rounded-2xl p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Meeting Room (no logo provided, so clean tile) */}
            <a
              href="https://meet.jit.si/SpaceToLand-broThercollecTive"
              target="_blank"
              rel="noreferrer"
              className="card rounded-2xl p-5"
            >
              <div className="text-lg font-semibold">Weekly Meeting</div>
              <div className="mt-1 text-sm muted">Opens in new tab</div>
            </a>

            <a
              href="https://meet.jit.si/ChillRoom1"
              target="_blank"
              rel="noreferrer"
              className="card rounded-2xl p-5"
            >
              <img src="/chill-room-1.png" alt="Chill Room 1" className="h-14 w-auto" />
              <div className="mt-3 text-lg font-semibold">Chill Room 1</div>
              <div className="mt-1 text-sm muted">Tap to enter</div>
            </a>

            <a
              href="https://meet.jit.si/ChillRoom2"
              target="_blank"
              rel="noreferrer"
              className="card rounded-2xl p-5"
            >
              <img src="/chill-room-2.png" alt="Chill Room 2" className="h-14 w-auto" />
              <div className="mt-3 text-lg font-semibold">Chill Room 2</div>
              <div className="mt-1 text-sm muted">Tap to enter</div>
            </a>

            <a
              href="https://meet.jit.si/broTAdminOnly"
              target="_blank"
              rel="noreferrer"
              className="card rounded-2xl p-5 sm:col-span-2 lg:col-span-3"
            >
              <div className="text-lg font-semibold">Admin Only</div>
              <div className="mt-1 text-sm muted">Locked by trust</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
