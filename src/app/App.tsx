
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent } from "./components/ui/tabs";
import { Button } from "./components/ui/button";

import {
  CalendarDays,
  ChevronRight,
  Crown,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Target,
  X,
} from "lucide-react";

import { Dashboard } from "./components/Dashboard";
import { ActivityForm } from "./components/ActivityForm";
import { Goals } from "./components/Goals";
import { History } from "./components/History";
import { AdminPanel } from "./components/AdminPanel";
import { WorkoutSuggestions } from "./components/WorkoutSuggestions";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { NotificationManager } from "./components/NotificationManager";
import { AuthScreen } from "./components/AuthScreen";
import { BrandMark } from "./components/BrandMark";

import {
  AuthProvider,
  useAuth,
} from "./contexts/AuthContext";

import { Toaster, toast } from "sonner";

import {
  registerServiceWorker,
  setupPWAInstallPrompt,
} from "./utils/pwaInstaller";

import { cn } from "./components/ui/utils";

import {
  listarAtividadesJava,
  salvarAtividadeJava,
  listarMetasJava,
  salvarMetaJava,
  type AtividadeJava,
  type MetaJava,
} from "./lib/javaApi";

interface Activity {
  id: string;
  type: string;
  duration: number;
  distance?: number;
  date: Date;
  notes?: string;
  calories: number;
}

interface Goal {
  id: string;
  type: "steps" | "minutes" | "distance";
  target: number;
  period: "daily" | "weekly" | "monthly";
}

const MOTIVATIONAL_MESSAGES = [
  "Consistência vence intensidade sem direção.",
  "Um treino de cada vez. Continue avançando.",
  "Seu progresso é construído nos pequenos hábitos.",
  "Movimento hoje, energia para o resto do dia.",
  "Disciplina transforma metas em resultados.",
];

const navItems = [
  {
    value: "dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
  },
  {
    value: "goals",
    label: "Metas",
    icon: Target,
  },
  {
    value: "history",
    label: "Histórico",
    icon: CalendarDays,
  },
  {
    value: "suggestions",
    label: "Treinos",
    icon: Dumbbell,
  },
];

function converterAtividade(
  atividade: AtividadeJava
): Activity {
  return {
    id: String(atividade.id),
    type: atividade.tipo,
    duration: atividade.duracaoMinutos,
    calories: atividade.calorias,
    date: new Date(
      `${atividade.data}T12:00:00`
    ),
  };
}

function converterMeta(meta: MetaJava): Goal {
  return {
    id: String(meta.id),
    type: meta.tipo,
    target: meta.objetivo,
    period: meta.periodo,
  };
}

function lerAtividadesLocais(
  usuarioId: string
): Activity[] {
  const saved = localStorage.getItem(
    `smartfit-activities-${usuarioId}`
  );

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((activity: Activity) => ({
      ...activity,
      date: new Date(activity.date),
    }));
  } catch {
    return [];
  }
}

function lerMetasLocais(
  usuarioId: string
): Goal[] {
  const saved = localStorage.getItem(
    `smartfit-goals-${usuarioId}`
  );

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function SmartFitApp() {
  const {
    user,
    logout,
    isAuthenticated,
    isAdmin,
    isInitializing,
    accessToken,
    isDemo,
  } = useAuth();

  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [activitiesLoading, setActivitiesLoading] =
    useState(false);

  const [goalsLoading, setGoalsLoading] =
    useState(false);

  const [showActivityForm, setShowActivityForm] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // Inicializar recursos PWA
  useEffect(() => {
    registerServiceWorker();
    setupPWAInstallPrompt();
  }, []);

  // Navegação por URL
  useEffect(() => {
    if (!isAuthenticated) return;

    const params = new URLSearchParams(
      window.location.search
    );

    const requestedTab = params.get("tab");

    const allowedTabs = [
      "dashboard",
      "goals",
      "history",
      "suggestions",
      ...(isAdmin ? ["admin"] : []),
    ];

    if (
      requestedTab &&
      allowedTabs.includes(requestedTab)
    ) {
      setActiveTab(requestedTab);
    }

    if (params.get("action") === "new") {
      setShowActivityForm(true);
    }
  }, [isAuthenticated, isAdmin]);

  // Carregar atividades do PostgreSQL
  // ou do armazenamento local no modo demo.
  useEffect(() => {
    if (!user) {
      setActivities([]);
      setActivitiesLoading(false);
      return;
    }

    let cancelled = false;

    if (isDemo) {
      setActivities(
        lerAtividadesLocais(user.id)
      );

      setActivitiesLoading(false);
      return;
    }

    setActivities([]);

    if (!accessToken) {
      setActivitiesLoading(false);
      return;
    }

    setActivitiesLoading(true);

    const carregarAtividades = async () => {
      try {
        const dados =
          await listarAtividadesJava(
            accessToken
          );

        if (cancelled) return;

        setActivities(
          dados.map(converterAtividade)
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Erro ao carregar atividades:",
          error
        );

        toast.error(
          "Não foi possível carregar suas atividades online."
        );
      } finally {
        if (!cancelled) {
          setActivitiesLoading(false);
        }
      }
    };

    carregarAtividades();

    return () => {
      cancelled = true;
    };
  }, [user?.id, accessToken, isDemo]);

  // Carregar metas do PostgreSQL
  // ou do armazenamento local no modo demo.
  useEffect(() => {
    if (!user) {
      setGoals([]);
      setGoalsLoading(false);
      return;
    }

    let cancelled = false;

    if (isDemo) {
      setGoals(lerMetasLocais(user.id));
      setGoalsLoading(false);
      return;
    }

    // Não apagar os dados antigos do navegador.
    // Apenas separar as metas locais das online.
    setGoals([]);

    if (!accessToken) {
      setGoalsLoading(false);
      return;
    }

    setGoalsLoading(true);

    const carregarMetas = async () => {
      try {
        const dados = await listarMetasJava(
          accessToken
        );

        if (cancelled) return;

        setGoals(
          dados.map(converterMeta)
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Erro ao carregar metas:",
          error
        );

        toast.error(
          "Não foi possível carregar suas metas online."
        );
      } finally {
        if (!cancelled) {
          setGoalsLoading(false);
        }
      }
    };

    carregarMetas();

    return () => {
      cancelled = true;
    };
  }, [user?.id, accessToken, isDemo]);

  // Mensagem motivacional diária
  useEffect(() => {
    if (!user) return;

    const messageKey =
      `smartfit-last-message-${user.id}`;

    const today = new Date().toDateString();

    if (
      localStorage.getItem(messageKey) === today
    ) {
      return;
    }

    const message =
      MOTIVATIONAL_MESSAGES[
        Math.floor(
          Math.random() *
          MOTIVATIONAL_MESSAGES.length
        )
      ];

    const timeout = window.setTimeout(() => {
      toast.success(
        `${user.name.split(" ")[0]}, ${message}`,
        { duration: 4500 }
      );

      localStorage.setItem(
        messageKey,
        today
      );
    }, 700);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [user?.id]);

  const allNavItems = useMemo(
    () =>
      isAdmin
        ? [
            ...navItems,
            {
              value: "admin",
              label: "Administração",
              icon: Crown,
            },
          ]
        : navItems,
    [isAdmin]
  );

  // CADASTRAR ATIVIDADE
  const handleAddActivity = async (
    activity: Omit<Activity, "id">
  ): Promise<void> => {
    if (isDemo) {
      const updated = [
        {
          ...activity,
          id: crypto.randomUUID(),
        },
        ...activities,
      ];

      setActivities(updated);

      localStorage.setItem(
        `smartfit-activities-${user!.id}`,
        JSON.stringify(updated)
      );

      return;
    }

    if (!accessToken) {
      toast.error(
        "Sua sessão expirou. Entre novamente."
      );

      throw new Error(
        "Token de autenticação ausente."
      );
    }

    try {
      const dataLocal =
        `${activity.date.getFullYear()}-` +
        `${String(
          activity.date.getMonth() + 1
        ).padStart(2, "0")}-` +
        `${String(
          activity.date.getDate()
        ).padStart(2, "0")}`;

      const salva =
        await salvarAtividadeJava(
          accessToken,
          {
            tipo: activity.type,
            duracaoMinutos: activity.duration,
            calorias: activity.calories,
            data: dataLocal,
          }
        );

      setActivities((current) => [
        converterAtividade(salva),
        ...current.filter(
          (item) =>
            item.id !== String(salva.id)
        ),
      ]);
    } catch (error) {
      console.error(
        "Erro ao salvar atividade:",
        error
      );

      toast.error(
        "Falha ao salvar atividade no servidor."
      );

      throw error;
    }
  };

  // EXCLUIR ATIVIDADE
  const handleDeleteActivity = (
    id: string
  ) => {
    if (!isDemo) {
      toast.error(
        "A exclusão de atividades online ainda não está disponível."
      );
      return;
    }

    const updated = activities.filter(
      (activity) => activity.id !== id
    );

    setActivities(updated);

    localStorage.setItem(
      `smartfit-activities-${user!.id}`,
      JSON.stringify(updated)
    );
  };

  // CADASTRAR META
  const handleAddGoal = async (
    goal: Omit<Goal, "id">
  ): Promise<void> => {
    if (isDemo) {
      const updated = [
        ...goals,
        {
          ...goal,
          id: crypto.randomUUID(),
        },
      ];

      setGoals(updated);

      localStorage.setItem(
        `smartfit-goals-${user!.id}`,
        JSON.stringify(updated)
      );

      return;
    }

    if (!accessToken) {
      throw new Error(
        "Sessão expirada. Faça login novamente."
      );
    }

    const salva = await salvarMetaJava(
      accessToken,
      {
        tipo: goal.type,
        objetivo: goal.target,
        periodo: goal.period,
      }
    );

    setGoals((current) => [
      ...current.filter(
        (item) =>
          item.id !== String(salva.id)
      ),
      converterMeta(salva),
    ]);
  };

  // EXCLUIR META
  const handleDeleteGoal = async (
    id: string
  ): Promise<void> => {
    if (!isDemo) {
      // Exclusão online só será habilitada
      // quando criarmos o endpoint DELETE.
      throw new Error(
        "A exclusão online ainda não está disponível."
      );
    }

    const updated = goals.filter(
      (goal) => goal.id !== id
    );

    setGoals(updated);

    localStorage.setItem(
      `smartfit-goals-${user!.id}`,
      JSON.stringify(updated)
    );
  };

  const navigate = (value: string) => {
    setActiveTab(value);
    setMobileMenuOpen(false);
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
        <div className="flex flex-col items-center gap-4">
          <BrandMark />

          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#dfe7e3]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="app-shell lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">

      {/* MENU LATERAL */}
      <aside className="hidden min-h-screen border-r border-white/5 bg-[#101a16] px-4 py-5 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">

        <div className="flex items-center gap-3 px-2">
          <BrandMark className="bg-white/10 shadow-none" />

          <div>
            <p className="text-[17px] font-semibold tracking-tight">
              SmartFit
            </p>

            <p className="text-xs text-white/45">
              Activity tracker
            </p>
          </div>
        </div>

        <Button
          className="mt-8 h-11 justify-between bg-[#25c77f] text-[#07120d] hover:bg-[#3bd48f]"
          onClick={() => setShowActivityForm(true)}
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova atividade
          </span>

          <ChevronRight className="h-4 w-4 opacity-70" />
        </Button>

        <nav
          className="mt-8 space-y-1"
          aria-label="Navegação principal"
        >
          {allNavItems.map(
            ({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => navigate(value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                  activeTab === value
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    activeTab === value &&
                      "text-[#58df9e]"
                  )}
                />

                {label}
              </button>
            )
          )}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold text-[#7ee2b5]">
              {initials || "SF"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.name}
              </p>

              <p className="truncate text-xs text-white/45">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="min-w-0">

        {/* CABEÇALHO */}
        <header className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark className="h-10 w-10 rounded-xl" />

              <div>
                <p className="font-semibold tracking-tight">
                  SmartFit
                </p>

                <p className="text-[11px] text-muted-foreground">
                  Seu progresso em movimento
                </p>
              </div>
            </div>

            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">
                Bem-vindo de volta,
              </p>

              <p className="font-semibold tracking-tight">
                {user.name.split(" ")[0]}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowActivityForm(true)}
                className="hidden shadow-[0_7px_20px_rgba(24,166,107,0.18)] sm:inline-flex lg:hidden"
              >
                <Plus className="h-4 w-4" />
                Registrar atividade
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() =>
                  setMobileMenuOpen(
                    (open) => !open
                  )
                }
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? (
                  <X />
                ) : (
                  <Menu />
                )}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-t bg-white px-4 py-3 lg:hidden">
              <div className="mx-auto grid max-w-[1480px] gap-1">

                {allNavItems.map(
                  ({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => navigate(value)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                        activeTab === value
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </header>

        {/* PÁGINAS */}
        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">

          {!isDemo &&
            (activitiesLoading || goalsLoading) && (
              <div className="mb-4 rounded-xl border bg-white p-3 text-sm text-muted-foreground">
                Carregando informações do PostgreSQL...
              </div>
            )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
          >

            <TabsContent
              value="dashboard"
              className="mt-0 focus-visible:outline-none"
            >
              <Dashboard
                activities={activities}
                goals={goals}
                userName={user.name}
                onAddActivity={() =>
                  setShowActivityForm(true)
                }
              />
            </TabsContent>

            <TabsContent
              value="goals"
              className="mt-0 focus-visible:outline-none"
            >
              <Goals
                goals={goals}
                activities={activities}
                onAddGoal={handleAddGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            </TabsContent>

            <TabsContent
              value="history"
              className="mt-0 focus-visible:outline-none"
            >
              <History
                activities={activities}
                onDeleteActivity={handleDeleteActivity}
              />
            </TabsContent>

            <TabsContent
              value="suggestions"
              className="mt-0 focus-visible:outline-none"
            >
              <WorkoutSuggestions />
            </TabsContent>

            {isAdmin && (
              <TabsContent
                value="admin"
                className="mt-0 focus-visible:outline-none"
              >
                <AdminPanel />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>

      {/* BOTÃO MOBILE */}
      <div className="fixed bottom-4 left-4 z-40 sm:hidden">
        <Button
          size="lg"
          onClick={() => setShowActivityForm(true)}
          className="shadow-[0_12px_30px_rgba(24,166,107,0.28)]"
        >
          <Plus className="h-4 w-4" />
          Nova atividade
        </Button>
      </div>

      <ActivityForm
        open={showActivityForm}
        onOpenChange={setShowActivityForm}
        onSave={handleAddActivity}
      />

      <PWAInstallButton />
      <NotificationManager />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        richColors
      />
      <SmartFitApp />
    </AuthProvider>
  );
}

export default App;
