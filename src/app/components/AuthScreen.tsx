import { useState } from "react";
import { Activity, ArrowRight, BarChart3, Check, Dumbbell, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { hasSupabaseConfig } from "../lib/config";
import { BrandMark } from "./BrandMark";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function AuthScreen() {
  const { login, register, enterDemo } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerWeight, setRegisterWeight] = useState("");
  const [registerAge, setRegisterAge] = useState("");
  const [registerGender, setRegisterGender] = useState<"male" | "female" | "other">("male");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(loginEmail, loginPassword);
      if (!success) toast.error("Não foi possível entrar. Confira seu e-mail e sua senha.");
    } catch {
      toast.error("Falha de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const success = await register(registerName, registerEmail, registerPassword, {
        weight: registerWeight ? Number(registerWeight) : undefined,
        age: registerAge ? Number(registerAge) : undefined,
        gender: registerGender,
      });
      if (!success) toast.error("Não foi possível criar sua conta. Verifique os dados e tente novamente.");
    } catch {
      toast.error("Falha de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(520px,0.92fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#101a16] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="soft-grid absolute inset-0 opacity-[0.12]" />
        <div className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-[#25c77f]/15 blur-3xl" />
        <div className="absolute -right-16 top-8 h-72 w-72 rounded-full bg-[#58df9e]/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <BrandMark className="bg-white/10 shadow-none" />
          <div>
            <p className="text-lg font-semibold tracking-tight">SmartFit</p>
            <p className="text-xs text-white/45">Activity tracker</p>
          </div>
        </div>

        <div className="relative my-auto max-w-2xl py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-[#7ee2b5]">
            <Activity className="h-3.5 w-3.5" /> Progresso simples, rotina consistente
          </span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.06] tracking-[-0.055em] xl:text-6xl">
            Seu treino fica melhor quando o progresso fica claro.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/55 xl:text-lg">
            Registre atividades, acompanhe metas e visualize sua evolução em uma experiência limpa, rápida e feita para o dia a dia.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              { icon: BarChart3, label: "Evolução visual" },
              { icon: Dumbbell, label: "Treinos sugeridos" },
              { icon: ShieldCheck, label: "Dados por usuário" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <Icon className="h-5 w-5 text-[#58df9e]" />
                <p className="mt-4 text-sm font-medium text-white/82">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/35">PWA responsivo · React + TypeScript · Supabase</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <div>
              <p className="text-lg font-semibold tracking-tight">SmartFit</p>
              <p className="text-xs text-muted-foreground">Seu progresso em movimento</p>
            </div>
          </div>

          <div className="mb-7">
            <p className="eyebrow">Bem-vindo</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Acesse sua conta</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Entre para continuar ou crie seu perfil em poucos passos.
            </p>
          </div>

          <div className="rounded-[26px] border bg-white p-5 shadow-[0_22px_60px_rgba(15,23,20,0.08)] sm:p-7">
            {!hasSupabaseConfig && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                Backend não configurado. Você ainda pode abrir a demonstração local abaixo.
              </div>
            )}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-muted/80 p-1">
                <TabsTrigger value="login" className="rounded-lg">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@exemplo.com"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                      className="h-11 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      required
                      className="h-11 rounded-xl bg-white"
                    />
                  </div>
                  <Button type="submit" className="mt-2 h-11 w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome completo</Label>
                    <Input
                      id="register-name"
                      value={registerName}
                      onChange={(event) => setRegisterName(event.target.value)}
                      placeholder="Seu nome"
                      required
                      className="h-11 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={registerEmail}
                      onChange={(event) => setRegisterEmail(event.target.value)}
                      placeholder="voce@exemplo.com"
                      required
                      className="h-11 rounded-xl bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      value={registerPassword}
                      onChange={(event) => setRegisterPassword(event.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      minLength={6}
                      required
                      className="h-11 rounded-xl bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="register-weight">Peso <span className="font-normal text-muted-foreground">(kg)</span></Label>
                      <Input
                        id="register-weight"
                        type="number"
                        min="20"
                        max="300"
                        step="0.1"
                        value={registerWeight}
                        onChange={(event) => setRegisterWeight(event.target.value)}
                        placeholder="70"
                        className="h-11 rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-age">Idade</Label>
                      <Input
                        id="register-age"
                        type="number"
                        min="10"
                        max="120"
                        value={registerAge}
                        onChange={(event) => setRegisterAge(event.target.value)}
                        placeholder="25"
                        className="h-11 rounded-xl bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gênero <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                    <Select value={registerGender} onValueChange={(value) => setRegisterGender(value as typeof registerGender)}>
                      <SelectTrigger className="h-11 rounded-xl bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro / prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="mt-2 h-11 w-full" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar conta"}
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 border-t pt-5">
              <Button type="button" variant="outline" className="h-11 w-full" onClick={enterDemo}>
                Acessar demonstração
              </Button>
              <p className="mt-2 text-center text-[11px] leading-5 text-muted-foreground">
                A demonstração salva atividades e metas somente neste navegador.
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/65 p-3 text-xs leading-5 text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              Contas normais usam o backend Supabase configurado no projeto; a demonstração permite testar o app mesmo sem conexão com o backend.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
