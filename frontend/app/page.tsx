"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HeroSection from "./components/herosection";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Handles the case where Supabase redirects back to the root URL
    // with hash tokens (#access_token=...) — the Supabase client auto-parses
    // them and fires SIGNED_IN. We then forward the user to /dashboard.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          router.replace("/dashboard");
        }
      }
    );

    // Also handle already-logged-in users visiting the homepage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection />
    </div>
  );
}