"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.refresh();
    router.replace("/login");
  }

  return (
    <button
      onClick={logout}
      style={{
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: 10,
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Log out
    </button>
  );
}
