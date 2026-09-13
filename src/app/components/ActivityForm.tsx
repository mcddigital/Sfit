import { useState } from "react";
import { Flame, Info, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { calculateCalories, getActivityInfo } from "../utils/caloriesCalculator";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface Activity {
  id: string;
  type: string;
  duration: number;
  distance?: number;
  date: Date;
  notes?: string;
  calories: number;
}

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: Omit<Activity, "id">) => void;
}

const ACTIVITY_TYPES = [
  "Corrida", "Caminhada", "Ciclismo", "Natação", "Musculação", "Yoga", "Pilates",
  "Dança", "Futebol", "Basquete", "Vôlei", "Tênis", "Outros",
];

export function ActivityForm({ open, onOpenChange, onSave }: ActivityFormProps) {
  const { user } = useAuth();
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const weight = user?.weight || 70;
  const minutes = Number(duration) || 0;
  const estimatedCalories = type && minutes ? calculateCalories(type, minutes, weight) : 0;
  const activityInfo = type ? getActivityInfo(type) : null;

  const reset = () => {
    setType("");
    setDuration("");
    setDistance("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!type || minutes <= 0) {
      toast.error("Selecione a atividade e informe a duração.");
      return;
    }

    const calories = calculateCalories(type, minutes, weight);
    onSave({
      type,
      duration: minutes,
      distance: distance ? Number(distance) : undefined,
      date: new Date(`${date}T12:00:00`),
      notes: notes.trim() || undefined,
      calories,
    });
    reset();
    onOpenChange(false);
    toast.success(`Atividade registrada · ${calories} kcal estimadas`);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { onOpenChange(nextOpen); if (!nextOpen) reset(); }}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <TimerReset className="h-5 w-5" />
            </div>
            <DialogTitle>Registrar atividade</DialogTitle>
            <DialogDescription>Adicione os dados principais do treino. A estimativa calórica é calculada automaticamente.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            <div className="grid gap-2">
              <Label>Tipo de atividade</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Selecione uma atividade" /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((activityType) => <SelectItem key={activityType} value={activityType}>{activityType}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duração (min)</Label>
                <Input id="duration" type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Ex.: 45" className="h-11 rounded-xl" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="distance">Distância (km) <span className="font-normal text-muted-foreground">opcional</span></Label>
                <Input id="distance" type="number" step="0.1" min="0" value={distance} onChange={(event) => setDistance(event.target.value)} placeholder="Ex.: 5,2" className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activity-date">Data</Label>
              <Input id="activity-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} max={new Date().toISOString().split("T")[0]} className="h-11 rounded-xl" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações <span className="font-normal text-muted-foreground">opcional</span></Label>
              <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Como foi o treino? Algum detalhe importante?" rows={3} className="rounded-xl" />
            </div>

            {estimatedCalories > 0 && (
              <div className="rounded-2xl border border-primary/15 bg-accent/55 p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-chip bg-white"><Flame className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Estimativa de gasto</p>
                    <p className="mt-0.5 text-xl font-semibold tracking-tight">{estimatedCalories} kcal</p>
                  </div>
                  {activityInfo && <Badge variant="outline" className="border-primary/20 bg-white text-accent-foreground">{activityInfo.intensity}</Badge>}
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>Cálculo por MET usando {user?.weight ? `seu peso cadastrado (${user.weight} kg)` : "70 kg como referência"}. É uma estimativa, não uma medição clínica.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar atividade</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
