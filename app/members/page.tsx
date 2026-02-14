"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function MembersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
        return;
      }
      setLoading(false);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Members</h1>
        <button onClick={logout} style={{ padding: 10, cursor: "pointer" }}>
          Log out
        </button>
      </div>

      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Private, intentional brotherhood. This page is members-only.
      </p>

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        <div style={{ padding: 16, border: "1px solid #2a2a2a", borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Next Meeting</h2>
          <p>Put the same meeting info you have on the main site’s Members section.</p>
        </div>

        <div style={{ padding: 16, border: "1px solid #2a2a2a", borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Links</h2>
          <ul>
            <li>Meeting Link</li>
            <li>GroupMe / Contact</li>
            <li>Forms / Intake</li>
          </ul>
        </div>

        <div style={{ padding: 16, border: "1px solid #2a2a2a", borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Baseline Rules</h2>
          <p>Respect. Privacy. No screenshots. Intentional space.</p>
        </div>
      </div>
    </div>
  );
}
