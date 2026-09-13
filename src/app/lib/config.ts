// As chaves abaixo são públicas (project ref + anon key) e já existiam no projeto original.
// Variáveis VITE_* continuam tendo prioridade, permitindo trocar de projeto sem alterar o código.
const DEFAULT_PROJECT_ID = "itkdwtrfwaywisrtaxuu";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a2R3dHJmd2F5d2lzcnRheHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NTQ0OTgsImV4cCI6MjA4NjEzMDQ5OH0.8Z_6tQu_NI_0dIvDFBcavOI94JSz0SL1QE1WdaXCPvY";
const DEFAULT_FUNCTION_NAME = "make-server-d1a79e63";

export const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_ANON_KEY;
export const SUPABASE_FUNCTION_NAME = import.meta.env.VITE_SUPABASE_FUNCTION_NAME?.trim() || DEFAULT_FUNCTION_NAME;

export const hasSupabaseConfig = Boolean(SUPABASE_PROJECT_ID && SUPABASE_ANON_KEY);

export const API_BASE = hasSupabaseConfig
  ? `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/${SUPABASE_FUNCTION_NAME}`
  : "";
