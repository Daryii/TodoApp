"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-[#3c2f2f] border border-[#4a3a3a] text-gray-300 px-4 py-2 rounded-lg hover:brightness-105 transition-all"
    >
      Logout
    </button>
  );
}
