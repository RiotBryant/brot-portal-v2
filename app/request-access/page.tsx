export default function RequestAccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-white/10" />
          <h1 className="text-2xl font-bold">Request Access</h1>
          <p className="mt-2 text-sm text-white/70">
            This portal is members only. Submit a request and we’ll review it.
          </p>
        </div>

        <form action="/api/request-access" method="post" className="space-y-3">
          <input
            name="full_name"
            required
            placeholder="Full name"
            className="w-full rounded-xl bg-black/40 border border-white/10 p-3"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl bg-black/40 border border-white/10 p-3"
          />
          <textarea
            name="message"
            required
            placeholder="Why do you want to join?"
            className="w-full min-h-32 rounded-xl bg-black/40 border border-white/10 p-3"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-white text-black font-semibold p-3"
          >
            Submit Request
          </button>
        </form>

        <div className="mt-4 text-center">
          <a className="text-sm underline" href="/login">
            Back to Login
          </a>
        </div>
      </div>
    </main>
  );
}
