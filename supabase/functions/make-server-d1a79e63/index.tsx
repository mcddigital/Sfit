import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Inicializar Supabase Client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d1a79e63/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTENTICAÇÃO ====================

// Cadastro de usuário
app.post("/make-server-d1a79e63/auth/signup", async (c) => {
  try {
    const { email, password, name, weight, age, gender } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, senha e nome são obrigatórios' }, 400);
    }

    console.log(`📝 Iniciando cadastro para: ${email}`);

    // Criar usuário com Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirma email (servidor de email não configurado)
      user_metadata: {
        name,
        weight: weight || 70,
        age: age || null,
        gender: gender || null,
        is_admin: false
      }
    });

    if (authError) {
      console.log(`❌ Erro ao criar usuário via Auth: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    console.log(`✅ Usuário criado no Auth: ${authData.user.id}`);

    // Inserir dados adicionais na tabela de usuários
    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: email,
        nome: name,
        peso: weight || 70,
        idade: age || null,
        genero: gender || null,
        is_admin: false
      });

    if (dbError) {
      console.log(`❌ Erro ao inserir usuário no banco:`, dbError);
      console.log(`Detalhes do erro:`, JSON.stringify(dbError, null, 2));
      
      // Se falhar ao inserir na tabela, deletar o usuário do Auth para evitar inconsistências
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return c.json({ 
        error: `Erro ao criar perfil do usuário: ${dbError.message || 'Erro desconhecido'}`,
        details: dbError.hint || dbError.details 
      }, 500);
    }

    console.log(`✅ Perfil criado com sucesso no banco de dados`);

    return c.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name
      }
    });

  } catch (error) {
    console.log(`❌ Erro no signup:`, error);
    return c.json({ error: `Erro interno no servidor: ${error instanceof Error ? error.message : String(error)}` }, 500);
  }
});

// Login de usuário
app.post("/make-server-d1a79e63/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email e senha são obrigatórios' }, 400);
    }

    console.log(`🔐 Tentativa de login para: ${email}`);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log(`❌ Erro no login para ${email}: ${error.message}`);
      console.log(`Detalhes do erro:`, JSON.stringify(error, null, 2));
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }

    console.log(`✅ Login bem-sucedido no Auth para: ${email}`);

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.log(`⚠️ Erro ao buscar dados do usuário ${email}: ${userError.message}`);
      console.log(`Detalhes:`, JSON.stringify(userError, null, 2));
    } else {
      console.log(`✅ Dados do usuário carregados: ${userData.nome}, admin: ${userData.is_admin}`);
    }

    return c.json({
      success: true,
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userData?.nome || data.user.user_metadata?.name,
        weight: userData?.peso || 70,
        age: userData?.idade,
        gender: userData?.genero,
        is_admin: userData?.is_admin || false
      }
    });

  } catch (error) {
    console.log(`❌ Erro crítico no login:`, error);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Verificar sessão
app.get("/make-server-d1a79e63/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Sessão inválida' }, 401);
    }

    // Buscar dados do usuário
    const { data: userData } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: userData?.nome || user.user_metadata?.name,
        weight: userData?.peso || 70,
        age: userData?.idade,
        gender: userData?.genero,
        is_admin: userData?.is_admin || false
      }
    });

  } catch (error) {
    console.log(`Erro ao verificar sessão: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// ==================== ATIVIDADES ====================

// Listar atividades do usuário
app.get("/make-server-d1a79e63/activities", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('atividades')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_atividade', { ascending: false });

    if (dbError) {
      console.log(`Erro ao buscar atividades: ${dbError.message}`);
      return c.json({ error: 'Erro ao buscar atividades' }, 500);
    }

    return c.json({ success: true, activities: data || [] });

  } catch (error) {
    console.log(`Erro ao listar atividades: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Criar nova atividade
app.post("/make-server-d1a79e63/activities", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { type, duration, distance, date, notes, calories } = await c.req.json();

    if (!type || !duration || !date) {
      return c.json({ error: 'Tipo, duração e data são obrigatórios' }, 400);
    }

    const { data: newActivity, error: dbError } = await supabaseAdmin
      .from('atividades')
      .insert({
        usuario_id: user.id,
        tipo: type,
        duracao_min: duration,
        distancia_km: distance || null,
        data_atividade: date,
        observacao: notes || null,
        calorias: calories || 0
      })
      .select()
      .single();

    if (dbError) {
      console.log(`Erro ao criar atividade: ${dbError.message}`);
      return c.json({ error: 'Erro ao criar atividade' }, 500);
    }

    return c.json({ success: true, activity: newActivity });

  } catch (error) {
    console.log(`Erro ao criar atividade: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Deletar atividade
app.delete("/make-server-d1a79e63/activities/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const activityId = c.req.param('id');

    const { error: dbError } = await supabaseAdmin
      .from('atividades')
      .delete()
      .eq('id', activityId)
      .eq('usuario_id', user.id);

    if (dbError) {
      console.log(`Erro ao deletar atividade: ${dbError.message}`);
      return c.json({ error: 'Erro ao deletar atividade' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.log(`Erro ao deletar atividade: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// ==================== METAS ====================

// Listar metas do usuário
app.get("/make-server-d1a79e63/goals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('metas')
      .select('*')
      .eq('usuario_id', user.id)
      .order('criado_em', { ascending: false });

    if (dbError) {
      console.log(`Erro ao buscar metas: ${dbError.message}`);
      return c.json({ error: 'Erro ao buscar metas' }, 500);
    }

    return c.json({ success: true, goals: data || [] });

  } catch (error) {
    console.log(`Erro ao listar metas: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Criar nova meta
app.post("/make-server-d1a79e63/goals", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { type, target } = await c.req.json();

    if (!type || !target) {
      return c.json({ error: 'Tipo e meta são obrigatórios' }, 400);
    }

    const { data: newGoal, error: dbError } = await supabaseAdmin
      .from('metas')
      .insert({
        usuario_id: user.id,
        tipo: type,
        valor_objetivo: target,
        ativo: true
      })
      .select()
      .single();

    if (dbError) {
      console.log(`Erro ao criar meta: ${dbError.message}`);
      return c.json({ error: 'Erro ao criar meta' }, 500);
    }

    return c.json({ success: true, goal: newGoal });

  } catch (error) {
    console.log(`Erro ao criar meta: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Atualizar meta
app.put("/make-server-d1a79e63/goals/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const goalId = c.req.param('id');
    const { target } = await c.req.json();

    const { data: updatedGoal, error: dbError } = await supabaseAdmin
      .from('metas')
      .update({ valor_objetivo: target })
      .eq('id', goalId)
      .eq('usuario_id', user.id)
      .select()
      .single();

    if (dbError) {
      console.log(`Erro ao atualizar meta: ${dbError.message}`);
      return c.json({ error: 'Erro ao atualizar meta' }, 500);
    }

    return c.json({ success: true, goal: updatedGoal });

  } catch (error) {
    console.log(`Erro ao atualizar meta: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// ==================== SUGESTÕES DE TREINOS ====================

// Listar sugestões de treinos
app.get("/make-server-d1a79e63/workout-suggestions", async (c) => {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('sugestoes_treinos')
      .select('*')
      .eq('ativo', true)
      .order('categoria', { ascending: true });

    if (dbError) {
      console.log(`Erro ao buscar sugestões: ${dbError.message}`);
      return c.json({ error: 'Erro ao buscar sugestões' }, 500);
    }

    return c.json({ success: true, suggestions: data || [] });

  } catch (error) {
    console.log(`Erro ao listar sugestões: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// ==================== ADMIN - GESTÃO DE USUÁRIOS ====================

// Listar todos os usuários (apenas admin)
app.get("/make-server-d1a79e63/admin/users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se é admin
    const { data: userData } = await supabaseAdmin
      .from('usuarios')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return c.json({ error: 'Acesso negado. Apenas administradores.' }, 403);
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nome, peso, idade, genero, is_admin, criado_em')
      .order('criado_em', { ascending: false });

    if (dbError) {
      console.log(`Erro ao buscar usuários: ${dbError.message}`);
      return c.json({ error: 'Erro ao buscar usuários' }, 500);
    }

    return c.json({ success: true, users: data || [] });

  } catch (error) {
    console.log(`Erro ao listar usuários: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Tornar usuário admin (apenas admin)
app.put("/make-server-d1a79e63/admin/users/:id/promote", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se é admin
    const { data: userData } = await supabaseAdmin
      .from('usuarios')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return c.json({ error: 'Acesso negado. Apenas administradores.' }, 403);
    }

    const targetUserId = c.req.param('id');

    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .update({ is_admin: true })
      .eq('id', targetUserId);

    if (dbError) {
      console.log(`Erro ao promover usuário: ${dbError.message}`);
      return c.json({ error: 'Erro ao promover usuário' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.log(`Erro ao promover usuário: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Remover admin de usuário (apenas admin)
app.put("/make-server-d1a79e63/admin/users/:id/demote", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se é admin
    const { data: userData } = await supabaseAdmin
      .from('usuarios')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return c.json({ error: 'Acesso negado. Apenas administradores.' }, 403);
    }

    const targetUserId = c.req.param('id');

    // Não permitir que o admin remova seu próprio admin
    if (targetUserId === user.id) {
      return c.json({ error: 'Você não pode remover seu próprio privilégio de admin' }, 400);
    }

    const { error: dbError } = await supabaseAdmin
      .from('usuarios')
      .update({ is_admin: false })
      .eq('id', targetUserId);

    if (dbError) {
      console.log(`Erro ao remover admin: ${dbError.message}`);
      return c.json({ error: 'Erro ao remover admin' }, 500);
    }

    return c.json({ success: true });

  } catch (error) {
    console.log(`Erro ao remover admin: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Deletar usuário (apenas admin)
app.delete("/make-server-d1a79e63/admin/users/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se é admin
    const { data: userData } = await supabaseAdmin
      .from('usuarios')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return c.json({ error: 'Acesso negado. Apenas administradores.' }, 403);
    }

    const targetUserId = c.req.param('id');

    // Não permitir que o admin delete a si mesmo
    if (targetUserId === user.id) {
      return c.json({ error: 'Você não pode deletar sua própria conta' }, 400);
    }

    // Deletar usuário do Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (authError) {
      console.log(`Erro ao deletar usuário do Auth: ${authError.message}`);
      return c.json({ error: 'Erro ao deletar usuário' }, 500);
    }

    // Os dados do banco serão deletados em cascata
    return c.json({ success: true });

  } catch (error) {
    console.log(`Erro ao deletar usuário: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

// Estatísticas de usuário (admin)
app.get("/make-server-d1a79e63/admin/users/:id/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se é admin
    const { data: userData } = await supabaseAdmin
      .from('usuarios')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return c.json({ error: 'Acesso negado. Apenas administradores.' }, 403);
    }

    const targetUserId = c.req.param('id');

    // Buscar estatísticas do usuário
    const { data: activities } = await supabaseAdmin
      .from('atividades')
      .select('*')
      .eq('usuario_id', targetUserId);

    const { data: goals } = await supabaseAdmin
      .from('metas')
      .select('*')
      .eq('usuario_id', targetUserId);

    const totalActivities = activities?.length || 0;
    const totalMinutes = activities?.reduce((sum, act) => sum + (act.duracao_min || 0), 0) || 0;
    const totalCalories = activities?.reduce((sum, act) => sum + (act.calorias || 0), 0) || 0;
    const totalDistance = activities?.reduce((sum, act) => sum + (act.distancia_km || 0), 0) || 0;

    return c.json({
      success: true,
      stats: {
        totalActivities,
        totalMinutes,
        totalCalories,
        totalDistance,
        totalGoals: goals?.length || 0,
        activeGoals: goals?.filter(g => g.ativo).length || 0
      }
    });

  } catch (error) {
    console.log(`Erro ao buscar estatísticas: ${error}`);
    return c.json({ error: 'Erro interno no servidor' }, 500);
  }
});

Deno.serve(app.fetch);