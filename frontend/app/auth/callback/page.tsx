"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Handle hash-based implicit flow (#access_token=...) — Supabase sets session from hash automatically
      // Handle PKCE code flow (?code=...) — Supabase client exchanges it automatically
      // In both cases, just wait for the session to be ready.

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
        return;
      }

      // Listen for the auth state change (fires after automatic code/hash exchange)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
            subscription.unsubscribe();
            router.replace("/dashboard");
          }
        }
      );

      // Safety fallback — if 5 seconds pass with no event, go to login
      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        router.replace("/login");
      }, 5000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
      <p className="text-cyan-400 text-xl font-bold tracking-wide">Signing you in…</p>
      <p className="text-gray-500 text-sm">Hang tight, almost there.</p>
    </div>
  );
}
