import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Clock3,
  Crown,
  Flame,
  Route,
  Shield,
  ShieldOff,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE } from "../lib/config";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface AdminUser {
  id: string;
  email: string;
  nome: string;
  peso: number;
  idade: number | null;
  genero: string | null;
  is_admin: boolean;
  criado_em: string;
}

interface UserStats {
  totalActivities: number;
  totalMinutes: number;
  totalCalories: number;
  totalDistance: number;
  totalGoals: number;
  activeGoals: number;
}

export function AdminPanel() {
  const { accessToken, isAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const loadUsers = async () => {
    if (!API_BASE || !accessToken) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders });
      if (!response.ok) throw new Error("Falha ao carregar usuários");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && accessToken) loadUsers();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, accessToken]);

  const loadUserStats = async (user: AdminUser) => {
    if (!API_BASE || !accessToken) return;
    setSelectedUser(user);
    setUserStats(null);
    try {
      setLoadingStats(true);
      const response = await fetch(`${API_BASE}/admin/users/${user.id}/stats`, { headers: authHeaders });
      if (!response.ok) throw new Error("Falha ao carregar estatísticas");
      const data = await response.json();
      setUserStats(data.stats);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar as estatísticas.");
    } finally {
      setLoadingStats(false);
    }
  };

  const updateRole = async (userId: string, action: "promote" | "demote") => {
    if (!API_BASE || !accessToken) return;
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
        method: "PUT",
        headers: authHeaders,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao atualizar permissões");
      }
      toast.success(action === "promote" ? "Usuário promovido a administrador." : "Privilégios administrativos removidos.");
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o usuário.");
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (!API_BASE || !accessToken) return;
    if (!window.confirm(`Excluir permanentemente o usuário “${user.nome}” e seus dados?`)) return;

    try {
      const response = await fetch(`${API_BASE}/admin/users/${user.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao excluir usuário");
      }
      toast.success("Usuário excluído.");
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o usuário.");
    }
  };

  if (!isAdmin) {
    return (
      <Card className="mx-auto max-w-lg border-dashed shadow-none">
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-xl font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Seu perfil não possui permissão para acessar as ferramentas administrativas.</p>
        </CardContent>
      </Card>
    );
  }

  const totalAdmins = users.filter((user) => user.is_admin).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Administração</p>
        <h1 className="page-title mt-2">Gestão de usuários</h1>
        <p className="page-subtitle">Acompanhe perfis, permissões e indicadores gerais da plataforma.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Usuários cadastrados</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{loading ? "—" : users.length}</p>
            </div>
            <div className="icon-chip"><Users className="h-4 w-4" /></div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{loading ? "—" : totalAdmins}</p>
            </div>
            <div className="icon-chip"><Shield className="h-4 w-4" /></div>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="icon-chip"><Crown className="h-4 w-4" /></div>
            <div>
              <h2 className="font-semibold">Usuários</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Gerencie funções e consulte estatísticas individuais.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <CardContent className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </CardContent>
        ) : users.length === 0 ? (
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Nenhum usuário encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Verifique a conexão com o backend e as permissões do administrador.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="hidden md:table-cell">Peso</TableHead>
                  <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.nome}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{user.peso ? `${user.peso} kg` : "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{new Date(user.criado_em).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="border-primary/20 bg-accent text-accent-foreground hover:bg-accent">Admin</Badge>
                      ) : (
                        <Badge variant="outline">Usuário</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => loadUserStats(user)} aria-label="Ver estatísticas">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[620px]">
                            <DialogHeader>
                              <DialogTitle>Estatísticas de {selectedUser?.nome || user.nome}</DialogTitle>
                              <DialogDescription>Resumo de atividades e metas registradas para este perfil.</DialogDescription>
                            </DialogHeader>
                            {loadingStats ? (
                              <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>
                            ) : userStats ? (
                              <div className="grid gap-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                  { label: "Atividades", value: userStats.totalActivities, icon: Activity },
                                  { label: "Minutos", value: userStats.totalMinutes, icon: Clock3 },
                                  { label: "Calorias", value: Math.round(userStats.totalCalories), icon: Flame },
                                  { label: "Distância", value: `${userStats.totalDistance.toFixed(1)} km`, icon: Route },
                                  { label: "Metas", value: userStats.totalGoals, icon: Target },
                                  { label: "Metas ativas", value: userStats.activeGoals, icon: Crown },
                                ].map(({ label, value, icon: Icon }) => (
                                  <div key={label} className="rounded-2xl border bg-muted/35 p-4">
                                    <Icon className="h-4 w-4 text-primary" />
                                    <p className="mt-3 text-xs text-muted-foreground">{label}</p>
                                    <p className="mt-1 text-xl font-semibold">{value}</p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => updateRole(user.id, user.is_admin ? "demote" : "promote")}
                          aria-label={user.is_admin ? "Remover permissão de administrador" : "Promover a administrador"}
                        >
                          {user.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => deleteUser(user)} aria-label="Excluir usuário">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
