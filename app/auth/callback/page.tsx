"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    // Optional: prefetch tujuan
    router.prefetch("/dashboard");
    router.prefetch("/auth/signin");
  }, [router]);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const supabase = createClient();

      // Tukar code -> session; gunakan hasilnya langsung
      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("Auth callback error:", error);
        router.replace("/auth/signin?error=callback_error");
        return;
      }

      // `data.session` sudah ada kalau sukses
      router.replace(data.session ? "/dashboard" : "/auth/signin");
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" />
        <p className="mt-4 text-gray-600">Memproses login...</p>
      </div>
    </div>
  );
}
