import { useState } from "react";
import { CheckCircle2, Flag, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
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

interface Goal {
  id: string;
  type: "steps" | "minutes" | "distance";
  target: number;
  period: "daily" | "weekly" | "monthly";
}

interface GoalsProps {
  goals: Goal[];
  activities: Activity[];
  onAddGoal: (goal: Omit<Goal, "id">) => void;
  onDeleteGoal: (id: string) => void;
}

const typeLabels = {
  minutes: { title: "Tempo ativo", unit: "min" },
  distance: { title: "Distância", unit: "km" },
  steps: { title: "Passos", unit: "passos" },
};

const periodLabels = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
};

function startOfPeriod(period: Goal["period"]) {
  const now = new Date();
  if (period === "daily") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "monthly") return new Date(now.getFullYear(), now.getMonth(), 1);

  const start = new Date(now);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function Goals({ goals, activities, onAddGoal, onDeleteGoal }: GoalsProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Goal["type"]>("minutes");
  const [target, setTarget] = useState("");
  const [period, setPeriod] = useState<Goal["period"]>("weekly");

  const getCurrentValue = (goal: Goal) => {
    const periodActivities = activities.filter((activity) => activity.date >= startOfPeriod(goal.period));
    if (goal.type === "minutes") return periodActivities.reduce((sum, activity) => sum + activity.duration, 0);
    if (goal.type === "distance") return periodActivities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
    return 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedTarget = Number(target);
    if (!parsedTarget || parsedTarget <= 0) {
      toast.error("Informe um objetivo maior que zero.");
      return;
    }

    onAddGoal({ type, target: parsedTarget, period });
    setTarget("");
    setOpen(false);
    toast.success("Meta criada com sucesso.");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Planejamento</p>
          <h1 className="page-title mt-2">Metas</h1>
          <p className="page-subtitle">Transforme sua rotina em objetivos claros e acompanhe o progresso em tempo real.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nova meta
        </Button>
      </header>

      {goals.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="icon-chip h-14 w-14">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">Defina seu próximo objetivo</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Crie metas de tempo ou distância. O progresso será calculado automaticamente com base nas atividades registradas.
            </p>
            <Button className="mt-5" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const current = getCurrentValue(goal);
            const progress = Math.min((current / goal.target) * 100, 100);
            const done = progress >= 100;
            const label = typeLabels[goal.type];

            return (
              <Card key={goal.id} className="group overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="icon-chip">
                        {done ? <CheckCircle2 className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold">{label.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Meta {periodLabels[goal.period].toLowerCase()}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground opacity-70 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() => {
                        onDeleteGoal(goal.id);
                        toast.success("Meta removida.");
                      }}
                      aria-label="Remover meta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-semibold tracking-[-0.04em]">
                        {current.toFixed(goal.type === "distance" ? 1 : 0)}
                        <span className="ml-1 text-base font-medium text-muted-foreground">{label.unit}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">de {goal.target} {label.unit}</p>
                    </div>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <Progress value={progress} className="mt-5 h-2" />
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    {goal.type === "steps"
                      ? "O contador automático de passos ainda não está integrado."
                      : done
                        ? "Objetivo concluído. Continue mantendo a consistência."
                        : `Faltam ${Math.max(goal.target - current, 0).toFixed(goal.type === "distance" ? 1 : 0)} ${label.unit} para concluir.`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[470px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Criar nova meta</DialogTitle>
              <DialogDescription>Escolha o indicador, o período e o resultado que deseja alcançar.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-5">
              <div className="grid gap-2">
                <Label>Indicador</Label>
                <Select value={type} onValueChange={(value) => setType(value as Goal["type"])}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Tempo ativo (minutos)</SelectItem>
                    <SelectItem value="distance">Distância (km)</SelectItem>
                    <SelectItem value="steps">Passos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-target">Objetivo ({typeLabels[type].unit})</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="1"
                  step={type === "distance" ? "0.1" : "1"}
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder={type === "distance" ? "Ex.: 20" : "Ex.: 150"}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Período</Label>
                <Select value={period} onValueChange={(value) => setPeriod(value as Goal["period"])}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Criar meta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
