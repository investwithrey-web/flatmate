"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HeroSection from "./components/herosection";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Only redirect on a fresh OAuth login (SIGNED_IN event from hash tokens).
    // Do NOT redirect users who are already logged in and just visiting the homepage.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // This fires right after Google OAuth redirects back here with tokens.
          subscription.unsubscribe();
          router.replace("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection />
    </div>
  );
}