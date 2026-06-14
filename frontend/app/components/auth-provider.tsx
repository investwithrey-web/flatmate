"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndSyncUser = async (sessionUser: User | null) => {
      setUser(sessionUser);
      setLoading(false);
      
      if (sessionUser) {
        // Automatically sync the user to public.users
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (!dbUser) {
          await supabase.from("users").upsert({
            id: sessionUser.id,
            email: sessionUser.email,
            name: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0],
            image: sessionUser.user_metadata?.avatar_url,
            provider: sessionUser.app_metadata?.provider || "email",
          });
        }
      }
    };

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAndSyncUser(session?.user ?? null);
    });

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkAndSyncUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
