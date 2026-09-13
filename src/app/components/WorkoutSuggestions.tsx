import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Dumbbell,
  Filter,
  Flame,
  HeartPulse,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE, SUPABASE_ANON_KEY } from "../lib/config";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface WorkoutSuggestion {
  id: number;
  categoria: string;
  titulo: string;
  descricao: string;
  duracao_sugerida: number;
  nivel: string;
  calorias_estimadas: number;
  ativo: boolean;
}

const fallbackSuggestions: WorkoutSuggestion[] = [
  { id: 101, categoria: "Cardio", titulo: "Caminhada acelerada", descricao: "Ritmo contínuo e confortável para elevar a frequência cardíaca sem sobrecarregar.", duracao_sugerida: 30, nivel: "Iniciante", calorias_estimadas: 165, ativo: true },
  { id: 102, categoria: "Cardio", titulo: "Intervalado de corrida", descricao: "Blocos de corrida moderada alternados com recuperação ativa para ganhar condicionamento.", duracao_sugerida: 28, nivel: "Intermediário", calorias_estimadas: 290, ativo: true },
  { id: 103, categoria: "Força", titulo: "Full body essencial", descricao: "Agachamento, empurrada, remada e core em circuito com foco em técnica e controle.", duracao_sugerida: 40, nivel: "Iniciante", calorias_estimadas: 240, ativo: true },
  { id: 104, categoria: "Força", titulo: "Força e potência", descricao: "Sessão de corpo inteiro com exercícios compostos e intervalos planejados.", duracao_sugerida: 50, nivel: "Avançado", calorias_estimadas: 410, ativo: true },
  { id: 105, categoria: "Funcional", titulo: "Circuito 5 movimentos", descricao: "Cinco exercícios simples em sequência para trabalhar mobilidade, força e cardio.", duracao_sugerida: 25, nivel: "Intermediário", calorias_estimadas: 260, ativo: true },
  { id: 106, categoria: "Flexibilidade", titulo: "Mobilidade de quadril e coluna", descricao: "Rotina leve para melhorar amplitude de movimento e preparar o corpo para treinos.", duracao_sugerida: 18, nivel: "Iniciante", calorias_estimadas: 70, ativo: true },
  { id: 107, categoria: "Recuperação", titulo: "Recuperação ativa", descricao: "Movimentos leves, respiração e alongamentos para reduzir tensão após dias intensos.", duracao_sugerida: 20, nivel: "Iniciante", calorias_estimadas: 80, ativo: true },
  { id: 108, categoria: "Esportes", titulo: "Agilidade e coordenação", descricao: "Deslocamentos, mudanças de direção e estímulos curtos para esportes de quadra e campo.", duracao_sugerida: 35, nivel: "Intermediário", calorias_estimadas: 320, ativo: true },
];

const categoryIcons: Record<string, typeof Dumbbell> = {
  Cardio: HeartPulse,
  "Força": Dumbbell,
  Funcional: Zap,
  Flexibilidade: Sparkles,
  Esportes: Target,
  "Recuperação": Activity,
};

const levelClass: Record<string, string> = {
  Iniciante: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Intermediário": "border-amber-200 bg-amber-50 text-amber-700",
  Avançado: "border-rose-200 bg-rose-50 text-rose-700",
};

export function WorkoutSuggestions() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>(fallbackSuggestions);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!API_BASE || !SUPABASE_ANON_KEY) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/workout-suggestions`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        });
        if (!response.ok) throw new Error("Falha ao carregar sugestões");
        const data = await response.json();
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.warn("Usando catálogo local de treinos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  const categories = useMemo(() => Array.from(new Set(suggestions.map((item) => item.categoria))), [suggestions]);
  const levels = useMemo(() => Array.from(new Set(suggestions.map((item) => item.nivel))), [suggestions]);

  const filtered = useMemo(
    () => suggestions.filter((item) =>
      (selectedCategory === "all" || item.categoria === selectedCategory) &&
      (selectedLevel === "all" || item.nivel === selectedLevel)
    ),
    [suggestions, selectedCategory, selectedLevel],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Biblioteca</p>
        <h1 className="page-title mt-2">Sugestões de treino</h1>
        <p className="page-subtitle">Encontre uma sessão compatível com seu nível, tempo disponível e objetivo do dia.</p>
      </header>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4 text-primary" /> Filtrar treinos
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Nível" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {levels.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {loading ? "Atualizando catálogo..." : `${filtered.length} ${filtered.length === 1 ? "treino disponível" : "treinos disponíveis"}`}
          </p>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="icon-chip h-14 w-14"><Dumbbell className="h-6 w-6" /></div>
            <h2 className="mt-5 text-lg font-semibold">Nenhum treino encontrado</h2>
            <p className="mt-2 text-sm text-muted-foreground">Limpe os filtros para visualizar outras opções.</p>
            <Button variant="outline" className="mt-5" onClick={() => { setSelectedCategory("all"); setSelectedLevel("all"); }}>
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const Icon = categoryIcons[item.categoria] || Dumbbell;
            return (
              <Card key={item.id} className="group transition-transform duration-200 hover:-translate-y-0.5">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="icon-chip"><Icon className="h-4 w-4" /></div>
                    <Badge variant="outline" className={levelClass[item.nivel] || ""}>{item.nivel}</Badge>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.13em] text-primary">{item.categoria}</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">{item.titulo}</h2>
                  <p className="mt-2 min-h-[66px] text-sm leading-6 text-muted-foreground">{item.descricao}</p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-muted/60 p-3">
                      <Clock3 className="h-4 w-4 text-primary" />
                      <p className="mt-2 text-xs text-muted-foreground">Duração</p>
                      <p className="mt-0.5 text-sm font-semibold">{item.duracao_sugerida} min</p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-3">
                      <Flame className="h-4 w-4 text-primary" />
                      <p className="mt-2 text-xs text-muted-foreground">Estimativa</p>
                      <p className="mt-0.5 text-sm font-semibold">~{Math.round(item.calorias_estimadas)} kcal</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-5 w-full border-primary/20 text-primary hover:bg-accent hover:text-accent-foreground"
                    onClick={() => toast.success(`Treino selecionado: ${item.titulo}`)}
                  >
                    <Dumbbell className="h-4 w-4" /> Selecionar treino
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-primary/15 bg-accent/55 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Treine com progressão</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Comece por um nível confortável, priorize técnica e recuperação e aumente volume ou intensidade de forma gradual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
