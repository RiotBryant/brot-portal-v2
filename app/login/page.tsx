import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/portal");

  const error =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-white/10" />
          <h1 className="text-2xl font-bold">broTher collecTive porTal</h1>
          <p className="mt-2 text-sm text-white/70">
            Members only. Log in to continue.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
            Login error: <span className="text-white/70">{error}</span>
          </div>
        ) : null}

        <form action="/api/auth/login" method="post" className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl bg-black/40 border border-white/10 p-3"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-xl bg-black/40 border border-white/10 p-3"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-white text-black font-semibold p-3"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <a className="text-sm underline" href="/request-access">
            Get Access
          </a>
        </div>
      </div>
    </main>
  );
}
