import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  Clock3,
  Flame,
  Plus,
  Route,
  Target,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface ActivityItem {
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

interface DashboardProps {
  activities: ActivityItem[];
  goals: Goal[];
  userName?: string;
  onAddActivity?: () => void;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Activity;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.04em]">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="icon-chip">
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ activities, goals, userName, onAddActivity }: DashboardProps) {
  const totalMinutes = activities.reduce((sum, item) => sum + item.duration, 0);
  const totalDistance = activities.reduce((sum, item) => sum + (item.distance || 0), 0);
  const totalCalories = activities.reduce((sum, item) => sum + item.calories, 0);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekActivities = activities.filter((item) => item.date >= weekAgo);
  const weekMinutes = weekActivities.reduce((sum, item) => sum + item.duration, 0);
  const weekCalories = weekActivities.reduce((sum, item) => sum + item.calories, 0);

  const weeklyMinutesGoal = goals.find((goal) => goal.period === "weekly" && goal.type === "minutes");
  const weeklyTarget = weeklyMinutesGoal?.target || 150;
  const goalProgress = Math.min((weekMinutes / weeklyTarget) * 100, 100);
  const remainingMinutes = Math.max(weeklyTarget - weekMinutes, 0);

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
    const daily = activities.filter(
      (item) => format(item.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    );

    return {
      date: format(date, "EEE", { locale: ptBR }).replace(".", ""),
      minutos: daily.reduce((sum, item) => sum + item.duration, 0),
    };
  });

  const recentActivities = activities.slice(0, 4);
  const firstName = userName?.split(" ")[0] || "Atleta";

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="relative overflow-hidden rounded-[28px] bg-[#101a16] px-6 py-7 text-white shadow-[0_24px_70px_rgba(16,26,22,0.16)] sm:px-8 sm:py-8">
        <div className="soft-grid absolute inset-0 opacity-[0.16]" />
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#25c77f]/20 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7ee2b5]">Visão geral</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              Continue no ritmo, {firstName}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/58 sm:text-base">
              Acompanhe sua semana, mantenha as metas visíveis e registre cada treino sem complicação.
            </p>
            <Button
              onClick={onAddActivity}
              className="mt-6 bg-[#25c77f] text-[#07120d] hover:bg-[#3bd48f]"
            >
              <Plus className="h-4 w-4" /> Registrar treino
            </Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Meta semanal</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{Math.round(goalProgress)}%</p>
              </div>
              <CalendarCheck className="h-5 w-5 text-[#58df9e]" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#25c77f] transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/48">
              <span>{weekMinutes} min realizados</span>
              <span>{weeklyTarget} min</span>
            </div>
            <p className="mt-4 text-sm text-white/72">
              {remainingMinutes === 0
                ? "Meta concluída. Ótimo trabalho nesta semana."
                : `Faltam ${remainingMinutes} minutos para concluir a meta.`}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Atividades"
          value={String(activities.length)}
          hint={`${weekActivities.length} nos últimos 7 dias`}
          icon={Activity}
        />
        <StatCard
          label="Tempo ativo"
          value={`${totalMinutes} min`}
          hint={`${weekMinutes} min nesta semana`}
          icon={Clock3}
        />
        <StatCard
          label="Calorias"
          value={`${totalCalories.toLocaleString("pt-BR")}`}
          hint={`${weekCalories.toLocaleString("pt-BR")} kcal nesta semana`}
          icon={Flame}
        />
        <StatCard
          label="Distância"
          value={`${totalDistance.toFixed(1)} km`}
          hint="Total registrado"
          icon={Route}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.7fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-5">
            <div>
              <p className="eyebrow">Desempenho</p>
              <CardTitle className="mt-2 text-lg">Minutos ativos por dia</CardTitle>
            </div>
            <div className="icon-chip">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days} margin={{ top: 5, right: 6, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="minutesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#18a66b" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#18a66b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e9eeeb" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#7a8580", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#7a8580", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ stroke: "#cfd8d3", strokeDasharray: "4 4" }}
                    contentStyle={{ borderRadius: 14, border: "1px solid #e1e7e4", boxShadow: "0 14px 40px rgba(15,23,20,.08)" }}
                    formatter={(value) => [`${value} min`, "Tempo ativo"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutos"
                    stroke="#18a66b"
                    strokeWidth={2.5}
                    fill="url(#minutesFill)"
                    activeDot={{ r: 5, fill: "#18a66b", strokeWidth: 3, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Objetivo</p>
                <CardTitle className="mt-2 text-lg">Progresso semanal</CardTitle>
              </div>
              <Target className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-semibold tracking-[-0.045em]">{weekMinutes}</p>
                <p className="mt-1 text-sm text-muted-foreground">de {weeklyTarget} minutos</p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                {Math.round(goalProgress)}%
              </span>
            </div>
            <Progress value={goalProgress} className="mt-6 h-2" />
            <div className="mt-6 rounded-2xl bg-muted/65 p-4">
              <div className="flex items-start gap-3">
                <div className="icon-chip h-9 w-9 shrink-0 bg-white">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {weekActivities.length > 0
                    ? `Você registrou ${weekActivities.length} ${weekActivities.length === 1 ? "atividade" : "atividades"} nesta semana.`
                    : "Registre a primeira atividade da semana para começar a acompanhar sua evolução."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-5">
          <div>
            <p className="eyebrow">Atividade recente</p>
            <CardTitle className="mt-2 text-lg">Últimos registros</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{activities.length} no total</span>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="icon-chip h-12 w-12">
                <Activity className="h-5 w-5" />
              </div>
              <p className="mt-4 font-medium">Nenhuma atividade registrada</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                Seu histórico aparecerá aqui assim que você registrar o primeiro treino.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {recentActivities.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <div className="icon-chip shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-medium">{item.type}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(item.date, "dd 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.duration} min · {item.calories} kcal
                      {item.distance ? ` · ${item.distance.toFixed(1)} km` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
