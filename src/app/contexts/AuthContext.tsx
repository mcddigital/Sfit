
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  cadastrarUsuario,
  loginJava,
  javaApiRequest,
} from "../lib/javaApi";

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
  login: (
    email: string,
    password: string
  ) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    userData?: Partial<User>
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  isInitializing: boolean;
  enterDemo: () => void;
  isDemo: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "smartfit-access-token";
const USER_KEY = "smartfit-java-user";
const DEMO_KEY = "smartfit-demo-session";

function createDemoUser(): User {
  return {
    id: "demo-user",
    name: "Visitante",
    email: "demo@smartfit.local",
    createdAt: new Date(),
    weight: 70,
    age: 25,
    gender: "other",
    is_admin: false,
  };
}

function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSavedSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function loadSavedUser(): User | null {
  const saved = localStorage.getItem(USER_KEY);

  if (!saved) return null;

  try {
    const data = JSON.parse(saved);

    if (
      typeof data.id !== "string" ||
      typeof data.name !== "string" ||
      typeof data.email !== "string"
    ) {
      return null;
    }

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      is_admin: false,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [isInitializing, setIsInitializing] =
    useState(true);

  const [isDemo, setIsDemo] = useState(false);

  // Restaurar sessão ao atualizar a página
  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const demoSession =
          localStorage.getItem(DEMO_KEY);

        if (demoSession === "1") {
          if (active) {
            setUser(createDemoUser());
            setIsDemo(true);
          }
          return;
        }

        const savedToken =
          localStorage.getItem(TOKEN_KEY);

        const savedUser = loadSavedUser();

        if (!savedToken || !savedUser) {
          clearSavedSession();
          return;
        }

        // Confirmar o token com a API Java
        const response = await javaApiRequest(
          "/api/atividades",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          }
        );

        if (!response.ok) {
          clearSavedSession();
          return;
        }

        if (active) {
          setUser(savedUser);
          setAccessToken(savedToken);
          setIsDemo(false);
        }
      } catch (error) {
        console.warn(
          "Não foi possível restaurar a sessão:",
          error
        );
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  // Login pela API Java
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const data = await loginJava(email, password);

      if (!data.token) {
        return false;
      }

      const loggedUser: User = {
        id: String(data.id),
        name: data.nome,
        email: data.email,
        createdAt: new Date(),
        is_admin: false,
      };

      setUser(loggedUser);
      setAccessToken(data.token);
      setIsDemo(false);

      localStorage.removeItem(DEMO_KEY);

      localStorage.setItem(
        TOKEN_KEY,
        data.token
      );

      saveUser(loggedUser);

      return true;
    } catch (error) {
      console.warn(
        "Falha no login Java:",
        error
      );

      return false;
    }
  };

  // Cadastro pela API Java
  const register = async (
    name: string,
    email: string,
    password: string,
    userData?: Partial<User>
  ): Promise<boolean> => {
    try {
      await cadastrarUsuario({
        nome: name,
        email,
        senha: password,
      });

      const loggedIn = await login(email, password);

      if (loggedIn && userData) {
        const profileUpdates = {
          weight: userData.weight,
          age: userData.age,
          gender: userData.gender,
        };

        setUser((current) => {
          if (!current) return current;

          const updatedUser = {
            ...current,
            ...profileUpdates,
          };

          saveUser(updatedUser);

          return updatedUser;
        });
      }

      return loggedIn;
    } catch (error) {
      console.warn(
        "Falha no cadastro Java:",
        error
      );

      return false;
    }
  };

  // Encerrar sessão
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setIsDemo(false);

    clearSavedSession();
    localStorage.removeItem(DEMO_KEY);
  };

  // Entrar como visitante
  const enterDemo = () => {
    const demoUser = createDemoUser();

    clearSavedSession();

    setUser(demoUser);
    setAccessToken(null);
    setIsDemo(true);

    localStorage.setItem(DEMO_KEY, "1");
  };

  // Atualizar informações locais do perfil
  const updateProfile = (
    updates: Partial<User>
  ) => {
    setUser((current) => {
      if (!current) return current;

      const updatedUser: User = {
        ...current,
        ...updates,
        id: current.id,
        email: current.email,
        is_admin: false,
      };

      if (!isDemo) {
        saveUser(updatedUser);
      }

      return updatedUser;
    });
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

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}
