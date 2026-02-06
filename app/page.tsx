import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 48, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>
        broTher collecTive
      </h1>

      <p style={{ marginTop: 16, fontSize: 18 }}>
        A private, intentional brotherhood.
      </p>

      <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <Link href="/login">
          <button>Login</button>
        </Link>
        <Link href="/request-access">
          <button>Request Access</button>
        </Link>
      </div>
    </main>
  );
}
