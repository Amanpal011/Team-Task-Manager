import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppRole = "admin" | "member";

type User = {
  email: string;
};

type AuthState = {
  session: boolean;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => void;
  refreshRole: () => Promise<void>;
};

const AuthCtx = createContext<AuthState>({
  session: false,
  user: null,
  role: null,
  loading: true,
  signOut: () => {},
  refreshRole: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>("member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setSession(true);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem("user");
    setSession(false);
    setUser(null);
  };

  const refreshRole = async () => {};

  return (
    <AuthCtx.Provider
      value={{
        session,
        user,
        role,
        loading,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);