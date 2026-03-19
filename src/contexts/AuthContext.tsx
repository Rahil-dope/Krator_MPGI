"use client";

import { createContext, useContext } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id ?? "",
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        role: (session.user as { role?: string }).role ?? "user",
      }
    : null;

  const isAdmin = user?.role === "admin";

  const handleSignIn = async () => {
    try {
      await signIn("google");
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithGoogle: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
