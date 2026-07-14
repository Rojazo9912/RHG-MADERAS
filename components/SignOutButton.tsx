"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/crm/login");
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} className="text-brown-dark/60 hover:text-forest underline">
      Salir
    </button>
  );
}
