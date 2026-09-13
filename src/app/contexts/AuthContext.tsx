import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { API_BASE, SUPABASE_ANON_KEY, hasSupabaseConfig } from "../lib/config";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  weight?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, userData?: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  isInitializing: boolean;
  enterDemo: () => void;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "smartfit-access-token";
const DEMO_KEY = "smartfit-demo-session";

function mapApiUser(data: Record<string, unknown>): User {
  return {
    id: String(data.id),
    name: String(data.name || "Usuário"),
    email: String(data.email || ""),
    weight: typeof data.weight === "number" ? data.weight : undefined,
    age: typeof data.age === "number" ? data.age : undefined,
    gender: data.gender === "male" || data.gender === "female" || data.gender === "other" ? data.gender : undefined,
    is_admin: Boolean(data.is_admin),
    createdAt: new Date(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const demoSession = localStorage.getItem(DEMO_KEY);
      try {
        if (demoSession === "1") {
          setUser({
            id: "demo-user",
            name: "Visitante",
            email: "demo@smartfit.local",
            createdAt: new Date(),
            weight: 70,
            age: 25,
            gender: "other",
            is_admin: false,
          });
          setIsDemo(true);
          return;
        }
        if (!savedToken || !hasSupabaseConfig) return;

        const response = await fetch(`${API_BASE}/auth/session`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (!response.ok) {
          localStorage.removeItem(TOKEN_KEY);
          return;
        }

        const data = await response.json();
        setUser(mapApiUser(data.user));
        setAccessToken(savedToken);
      } catch (error) {
        console.warn("Não foi possível restaurar a sessão:", error);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!hasSupabaseConfig) {
      console.error("Supabase não configurado. Consulte .env.example.");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.access_token) return false;

      setUser(mapApiUser(data.user));
      setAccessToken(data.access_token);
      setIsDemo(false);
      localStorage.removeItem(DEMO_KEY);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      return true;
    } catch (error) {
      console.warn("Falha no login:", error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    userData?: Partial<User>,
  ): Promise<boolean> => {
    if (!hasSupabaseConfig) {
      console.error("Supabase não configurado. Consulte .env.example.");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          weight: userData?.weight,
          age: userData?.age,
          gender: userData?.gender,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) return false;
      return login(email, password);
    } catch (error) {
      console.warn("Falha no cadastro:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DEMO_KEY);
    setIsDemo(false);
  };


  const enterDemo = () => {
    setUser({
      id: "demo-user",
      name: "Visitante",
      email: "demo@smartfit.local",
      createdAt: new Date(),
      weight: 70,
      age: 25,
      gender: "other",
      is_admin: false,
    });
    setAccessToken(null);
    setIsDemo(true);
    localStorage.setItem(DEMO_KEY, "1");
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateProfile = (updates: Partial<User>) => {
    setUser((current) => current ? { ...current, ...updates } : current);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: user !== null,
        isAdmin: user?.is_admin || false,
        accessToken,
        isInitializing,
        enterDemo,
        isDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
