import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import {
  Activity as ActivityIcon,
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster, toast } from "sonner";
import { registerServiceWorker, setupPWAInstallPrompt } from "./utils/pwaInstaller";
import { cn } from "./components/ui/utils";

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
  { value: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { value: "goals", label: "Metas", icon: Target },
  { value: "history", label: "Histórico", icon: CalendarDays },
  { value: "suggestions", label: "Treinos", icon: Dumbbell },
];

function SmartFitApp() {
  const { user, logout, isAuthenticated, isAdmin, isInitializing } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    setupPWAInstallPrompt();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get("tab");
    const allowedTabs = ["dashboard", "goals", "history", "suggestions", ...(isAdmin ? ["admin"] : [])];
    if (requestedTab && allowedTabs.includes(requestedTab)) setActiveTab(requestedTab);
    if (params.get("action") === "new") setShowActivityForm(true);
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!user) return;

    const activitiesKey = `smartfit-activities-${user.id}`;
    const goalsKey = `smartfit-goals-${user.id}`;
    const savedActivities = localStorage.getItem(activitiesKey);
    const savedGoals = localStorage.getItem(goalsKey);

    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        setActivities(parsed.map((activity: Activity) => ({ ...activity, date: new Date(activity.date) })));
      } catch {
        setActivities([]);
      }
    } else {
      setActivities([]);
    }

    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch {
        setGoals([]);
      }
    } else {
      setGoals([]);
    }

    const messageKey = `smartfit-last-message-${user.id}`;
    const today = new Date().toDateString();
    if (localStorage.getItem(messageKey) !== today) {
      const message = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      window.setTimeout(() => {
        toast.success(`${user.name.split(" ")[0]}, ${message}`, { duration: 4500 });
        localStorage.setItem(messageKey, today);
      }, 700);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`smartfit-activities-${user.id}`, JSON.stringify(activities));
  }, [activities, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`smartfit-goals-${user.id}`, JSON.stringify(goals));
  }, [goals, user]);

  const allNavItems = useMemo(
    () => (isAdmin ? [...navItems, { value: "admin", label: "Administração", icon: Crown }] : navItems),
    [isAdmin],
  );

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

  if (!isAuthenticated || !user) return <AuthScreen />;

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleAddActivity = (activity: Omit<Activity, "id">) => {
    setActivities((current) => [{ ...activity, id: crypto.randomUUID?.() ?? Date.now().toString() }, ...current]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((current) => current.filter((activity) => activity.id !== id));
  };

  const handleAddGoal = (goal: Omit<Goal, "id">) => {
    setGoals((current) => [...current, { ...goal, id: crypto.randomUUID?.() ?? Date.now().toString() }]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((current) => current.filter((goal) => goal.id !== id));
  };

  const navigate = (value: string) => {
    setActiveTab(value);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-white/5 bg-[#101a16] px-4 py-5 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <BrandMark className="bg-white/10 shadow-none" />
          <div>
            <p className="text-[17px] font-semibold tracking-tight">SmartFit</p>
            <p className="text-xs text-white/45">Activity tracker</p>
          </div>
        </div>

        <Button
          className="mt-8 h-11 justify-between bg-[#25c77f] text-[#07120d] hover:bg-[#3bd48f]"
          onClick={() => setShowActivityForm(true)}
        >
          <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Nova atividade</span>
          <ChevronRight className="h-4 w-4 opacity-70" />
        </Button>

        <nav className="mt-8 space-y-1" aria-label="Navegação principal">
          {allNavItems.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => navigate(value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                activeTab === value
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white/90",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", activeTab === value && "text-[#58df9e]")} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold text-[#7ee2b5]">
              {initials || "SF"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-white/45">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair da conta
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark className="h-10 w-10 rounded-xl" />
              <div>
                <p className="font-semibold tracking-tight">SmartFit</p>
                <p className="text-[11px] text-muted-foreground">Seu progresso em movimento</p>
              </div>
            </div>

            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
              <p className="font-semibold tracking-tight">{user.name.split(" ")[0]}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowActivityForm(true)}
                className="hidden shadow-[0_7px_20px_rgba(24,166,107,0.18)] sm:inline-flex lg:hidden"
              >
                <Plus className="h-4 w-4" /> Registrar atividade
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-t bg-white px-4 py-3 lg:hidden">
              <div className="mx-auto grid max-w-[1480px] gap-1">
                {allNavItems.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => navigate(value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                      activeTab === value ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={logout}
                  className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sair da conta
                </button>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
              <Dashboard activities={activities} goals={goals} userName={user.name} onAddActivity={() => setShowActivityForm(true)} />
            </TabsContent>
            <TabsContent value="goals" className="mt-0 focus-visible:outline-none">
              <Goals goals={goals} activities={activities} onAddGoal={handleAddGoal} onDeleteGoal={handleDeleteGoal} />
            </TabsContent>
            <TabsContent value="history" className="mt-0 focus-visible:outline-none">
              <History activities={activities} onDeleteActivity={handleDeleteActivity} />
            </TabsContent>
            <TabsContent value="suggestions" className="mt-0 focus-visible:outline-none">
              <WorkoutSuggestions />
            </TabsContent>
            {isAdmin && (
              <TabsContent value="admin" className="mt-0 focus-visible:outline-none">
                <AdminPanel />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>

      <div className="fixed bottom-4 left-4 z-40 sm:hidden">
        <Button
          size="lg"
          onClick={() => setShowActivityForm(true)}
          className="shadow-[0_12px_30px_rgba(24,166,107,0.28)]"
        >
          <Plus className="h-4 w-4" /> Nova atividade
        </Button>
      </div>

      <ActivityForm open={showActivityForm} onOpenChange={setShowActivityForm} onSave={handleAddActivity} />
      <PWAInstallButton />
      <NotificationManager />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <SmartFitApp />
    </AuthProvider>
  );
}

export default App;
