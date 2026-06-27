"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // The Supabase JS client automatically reads the ?code= from the URL
    // and exchanges it for a session on the client side.
    // We just need to wait for the SIGNED_IN event and then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          router.replace("/dashboard");
        }
      }
    );

    // Also check if session already exists (handles fast exchanges)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
      <p className="text-cyan-400 text-xl font-bold">Signing you in…</p>
      <p className="text-gray-400 text-sm">Please wait a moment.</p>
    </div>
  );
}
