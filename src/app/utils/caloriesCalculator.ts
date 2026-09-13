// Valores de MET (Metabolic Equivalent of Task) por tipo de atividade
// MET é uma medida da intensidade do exercício
// 1 MET = consumo de energia em repouso (~1 kcal/kg/hora)

export const ACTIVITY_METS: { [key: string]: number } = {
  "Corrida": 9.8,
  "Caminhada": 3.5,
  "Ciclismo": 7.5,
  "Natação": 8.0,
  "Musculação": 6.0,
  "Yoga": 2.5,
  "Pilates": 3.0,
  "Dança": 5.0,
  "Futebol": 10.0,
  "Basquete": 8.0,
  "Vôlei": 4.0,
  "Tênis": 7.3,
  "Outros": 5.0
};

// Peso médio padrão (70kg) - pode ser personalizado futuramente
const DEFAULT_WEIGHT_KG = 70;

/**
 * Calcula as calorias queimadas durante uma atividade
 * Fórmula: Calorias = MET × peso (kg) × tempo (horas)
 * 
 * @param activityType - Tipo de atividade física
 * @param durationMinutes - Duração em minutos
 * @param weightKg - Peso em kg (opcional, usa 70kg como padrão)
 * @returns Calorias queimadas (arredondado)
 */
export function calculateCalories(
  activityType: string,
  durationMinutes: number,
  weightKg: number = DEFAULT_WEIGHT_KG
): number {
  const met = ACTIVITY_METS[activityType] || ACTIVITY_METS["Outros"];
  const durationHours = durationMinutes / 60;
  const calories = met * weightKg * durationHours;
  
  return Math.round(calories);
}

/**
 * Retorna a intensidade da atividade baseada no MET
 */
export function getActivityIntensity(activityType: string): "Leve" | "Moderada" | "Intensa" {
  const met = ACTIVITY_METS[activityType] || ACTIVITY_METS["Outros"];
  
  if (met < 4) return "Leve";
  if (met < 7) return "Moderada";
  return "Intensa";
}

/**
 * Retorna uma descrição do gasto calórico
 */
export function getCalorieDescription(calories: number): string {
  if (calories < 100) return "Atividade leve";
  if (calories < 300) return "Bom treino";
  if (calories < 500) return "Treino intenso";
  return "Treino pesado! 🔥";
}

/**
 * Retorna informação sobre o MET da atividade
 */
export function getActivityInfo(activityType: string): {
  met: number;
  intensity: string;
  caloriesPerHour: number;
} {
  const met = ACTIVITY_METS[activityType] || ACTIVITY_METS["Outros"];
  const intensity = getActivityIntensity(activityType);
  const caloriesPerHour = Math.round(met * DEFAULT_WEIGHT_KG);
  
  return {
    met,
    intensity,
    caloriesPerHour
  };
}
