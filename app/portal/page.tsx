import Link from "next/link";

export default function Portal() {
  return (
    <main style={{ padding: 48 }}>
      <h1>Member Portal</h1>
      <ul>
        <li><Link href="/chat">broChAT</Link></li>
        <li><Link href="/lounge">Brother Lounge</Link></li>
        <li><Link href="/admin">Admin</Link></li>
      </ul>
    </main>
  );
}
