import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Download, Flame, Route, Trash2 } from "lucide-react";
import { format, isAfter, startOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Activity {
  id: string;
  type: string;
  duration: number;
  distance?: number;
  date: Date;
  notes?: string;
  calories: number;
}

interface HistoryProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
}

type PeriodFilter = "all" | "7days" | "month";

export function History({ activities, onDeleteActivity }: HistoryProps) {
  const [period, setPeriod] = useState<PeriodFilter>("all");

  const filteredActivities = useMemo(() => {
    const now = new Date();
    return activities.filter((activity) => {
      if (period === "7days") return isAfter(activity.date, subDays(now, 7));
      if (period === "month") return isAfter(activity.date, startOfMonth(now));
      return true;
    });
  }, [activities, period]);

  const totalMinutes = filteredActivities.reduce((sum, item) => sum + item.duration, 0);
  const totalCalories = filteredActivities.reduce((sum, item) => sum + item.calories, 0);
  const totalDistance = filteredActivities.reduce((sum, item) => sum + (item.distance || 0), 0);

  const exportCsv = () => {
    if (filteredActivities.length === 0) {
      toast.error("Não há atividades para exportar.");
      return;
    }

    const rows = [
      ["Data", "Atividade", "Duracao (min)", "Distancia (km)", "Calorias", "Observacoes"],
      ...filteredActivities.map((item) => [
        format(item.date, "dd/MM/yyyy"),
        item.type,
        String(item.duration),
        item.distance?.toFixed(1) || "",
        String(item.calories),
        (item.notes || "").replace(/"/g, '""'),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smartfit-atividades-${format(new Date(), "yyyy-MM-dd")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Histórico exportado em CSV.");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Registros</p>
          <h1 className="page-title mt-2">Histórico de atividades</h1>
          <p className="page-subtitle">Revise seus treinos, compare volume e mantenha um registro organizado da evolução.</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
            <SelectTrigger className="h-10 w-[150px] rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Registros", value: String(filteredActivities.length), icon: CalendarDays },
          { label: "Tempo ativo", value: `${totalMinutes} min`, icon: Clock3 },
          { label: "Calorias", value: `${totalCalories.toLocaleString("pt-BR")} kcal`, icon: Flame },
          { label: "Distância", value: `${totalDistance.toFixed(1)} km`, icon: Route },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="icon-chip h-9 w-9"><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-semibold tracking-tight">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <Card className="overflow-hidden">
        {filteredActivities.length === 0 ? (
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="icon-chip h-14 w-14"><CalendarDays className="h-6 w-6" /></div>
            <h2 className="mt-5 text-lg font-semibold">Nenhuma atividade neste período</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Ajuste o filtro ou registre um novo treino para começar seu histórico.
            </p>
          </CardContent>
        ) : (
          <div className="divide-y">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="group px-5 py-5 sm:px-6">
                <div className="flex items-start gap-4">
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#101a16] text-white sm:flex">
                    <span className="text-xs font-semibold text-[#7ee2b5]">{format(activity.date, "dd")}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h3 className="font-semibold">{activity.type}</h3>
                          <span className="text-xs text-muted-foreground">
                            {format(activity.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                          <span>{activity.duration} min</span>
                          <span>{activity.calories} kcal</span>
                          {activity.distance !== undefined && <span>{activity.distance.toFixed(1)} km</span>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground opacity-70 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Excluir atividade"
                        onClick={() => {
                          onDeleteActivity(activity.id);
                          toast.success("Atividade removida.");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {activity.notes && (
                      <p className="mt-3 rounded-xl bg-muted/55 px-3 py-2 text-sm leading-6 text-muted-foreground">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
