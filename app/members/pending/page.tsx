import Link from "next/link";

export default function PendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-white/10" />
        <h1 className="text-2xl font-bold">Request Received</h1>
        <p className="mt-2 text-sm text-white/70">
          Your request is pending review. You’ll receive an email once a decision is made.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href=/members className="underline text-sm">
            Home
          </Link>
          <Link href="/" className="underline text-sm">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
