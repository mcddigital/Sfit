# 🔧 Solução de Erros Comuns - SmartFit

## 📋 Índice Rápido

1. [❌ Erro no login: Credenciais inválidas](#erro-credenciais-invalidas)
2. [❌ Erro ao carregar sugestões](#erro-carregar-sugestoes)
3. [❌ Email já registrado](#erro-email-ja-registrado)
4. [❌ Erro ao criar perfil do usuário](#erro-criar-perfil)
5. [❌ Tabelas não existem](#erro-tabelas-nao-existem)

---

## ❌ Erro: Credenciais Inválidas {#erro-credenciais-invalidas}

### Mensagem de Erro
```
❌ Erro no login: Credenciais inválidas
```

### 🔍 Causas Possíveis

1. **Email ou senha incorretos**
2. **Você ainda não criou uma conta**
3. **Usuário órfão** (existe no Auth mas não na tabela usuarios)
4. **Senha muito curta** (mínimo 6 caracteres)

### ✅ Soluções

#### Solução 1: Verifique se Você Tem uma Conta

1. Se é sua primeira vez, **crie uma conta** primeiro:
   - Vá na aba "Criar Conta"
   - Preencha todos os campos
   - Clique em "Criar Conta"

2. Se já criou a conta, verifique:
   - Email está correto (sem espaços extras)
   - Senha está correta
   - Senha tem pelo menos 6 caracteres

#### Solução 2: Verificar no Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com)
2. Vá em **Authentication** → **Users**
3. Procure seu email na lista
4. Se encontrar:
   - Tente recuperar a senha
   - Ou delete o usuário e crie novamente

5. Se NÃO encontrar:
   - Você precisa criar uma conta nova

#### Solução 3: Verificar Logs do Console

1. Abra o Console do navegador (F12)
2. Vá na aba "Console"
3. Tente fazer login novamente
4. Veja as mensagens de log:

```
🔐 Tentativa de login para: seu@email.com
❌ Erro no login para seu@email.com: [mensagem do erro]
```

5. O erro específico dirá exatamente o que está errado

---

## ❌ Erro ao Carregar Sugestões {#erro-carregar-sugestoes}

### Mensagem de Erro
```
Erro ao carregar sugestões
```

### 🔍 Causas Possíveis

1. **Tabela `sugestoes_treinos` está vazia** (não tem dados)
2. **Políticas RLS bloqueando o acesso**
3. **Servidor Supabase não está respondendo**
4. **Problemas de conexão**

### ✅ Soluções

#### Solução 1: Inserir Sugestões no Banco (Mais Comum)

A tabela de sugestões provavelmente está vazia!

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. **Cole TODO** o conteúdo do arquivo `/supabase/insert-workout-suggestions.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a execução (pode demorar alguns segundos)
7. ✅ Deve inserir 30 sugestões de treinos

#### Solução 2: Corrigir Políticas RLS

Se as sugestões existem mas não carregam, pode ser problema de RLS.

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute este comando:

```sql
-- Verificar se tem sugestões
SELECT COUNT(*) FROM sugestoes_treinos;

-- Se retornar 0, execute o script insert-workout-suggestions.sql
-- Se retornar > 0, o problema é RLS

-- Corrigir RLS
DROP POLICY IF EXISTS "Todos podem ver sugestões" ON sugestoes_treinos;

CREATE POLICY "Todos podem ver sugestões"
  ON sugestoes_treinos FOR SELECT
  USING (ativo = true);

CREATE POLICY "Service role pode gerenciar sugestões"
  ON sugestoes_treinos FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE sugestoes_treinos ENABLE ROW LEVEL SECURITY;
```

#### Solução 3: Diagnóstico Completo

Execute o script de diagnóstico completo:

1. Vá no **SQL Editor**
2. Execute TODO o conteúdo de `/supabase/diagnostic-and-fix.sql`
3. Veja as mensagens de diagnóstico
4. Siga as correções sugeridas

#### Solução 4: Verificar Logs do Console

1. Abra o Console (F12)
2. Vá na aba "Treinos"
3. Veja os logs:

```
🏋️ Carregando sugestões de treinos...
📥 Resposta do servidor: { status: 200, ok: true }
✅ Sugestões carregadas: 30 treinos
```

Se ver erros, eles dirão exatamente o que fazer.

---

## ❌ Erro: Email Já Registrado {#erro-email-ja-registrado}

### Mensagem de Erro
```
A user with this email address has already been registered
```

### 🔍 Causa

Usuário órfão no Supabase Auth (existe no Auth mas não na tabela usuarios)

### ✅ Solução Completa

Veja o guia detalhado em **`/SOLUCAO-USUARIO-ORFAO.md`**

**Solução Rápida:**

1. Acesse Supabase Dashboard → **Authentication** → **Users**
2. Encontre o usuário com esse email
3. Clique nos 3 pontinhos (⋮) → **Delete user**
4. Tente cadastrar novamente

---

## ❌ Erro ao Criar Perfil do Usuário {#erro-criar-perfil}

### Mensagem de Erro
```
Erro ao criar perfil do usuário
```

### 🔍 Causa

Políticas RLS bloqueando a inserção na tabela `usuarios`

### ✅ Solução Completa

Veja o guia detalhado em **`/SOLUCAO-ERRO-CADASTRO.md`**

**Solução Rápida:**

```sql
-- No Supabase SQL Editor
DROP POLICY IF EXISTS "Permitir inserção via service role" ON usuarios;

CREATE POLICY "Permitir inserção via service role"
  ON usuarios FOR INSERT
  WITH CHECK (true);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
```

---

## ❌ Erro: Tabelas Não Existem {#erro-tabelas-nao-existem}

### Mensagem de Erro
```
relation "usuarios" does not exist
relation "sugestoes_treinos" does not exist
```

### 🔍 Causa

O banco de dados não foi configurado ainda

### ✅ Solução

Execute o script de criação das tabelas:

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. **Cole TODO** o conteúdo do arquivo `/supabase/database-setup.sql`
5. Clique em **Run**
6. ✅ Todas as tabelas serão criadas

---

## 🔧 Script de Diagnóstico Completo

### Para diagnosticar qualquer problema, execute:

```sql
-- ==================== DIAGNÓSTICO COMPLETO ====================

-- 1. Verificar tabelas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'atividades', 'metas', 'sugestoes_treinos');

-- 2. Verificar dados
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'sugestoes_treinos' as tabela, COUNT(*) as total FROM sugestoes_treinos;

-- 3. Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. Verificar RLS ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Resultados Esperados:

✅ **4 tabelas** devem aparecer
✅ **Pelo menos 1 usuário** na tabela usuarios
✅ **30 sugestões** na tabela sugestoes_treinos
✅ **Políticas RLS** criadas para cada tabela
✅ **RLS ativado** em todas as tabelas

---

## 📞 Ainda com Problemas?

### Checklist de Verificação

Antes de pedir ajuda, verifique:

- [ ] Executei o script `/supabase/database-setup.sql`
- [ ] Executei o script `/supabase/insert-workout-suggestions.sql`
- [ ] Executei o script `/supabase/fix-rls-policies.sql`
- [ ] Verifiquei os logs do Console (F12)
- [ ] Verifiquei os logs do Supabase (Edge Functions logs)
- [ ] Minha internet está funcionando
- [ ] As variáveis `VITE_SUPABASE_PROJECT_ID` e `VITE_SUPABASE_ANON_KEY` estão corretas no arquivo `.env.local`

### Obter Logs Detalhados

#### No Frontend (Console do Navegador):

1. Abra o Console (F12)
2. Tente reproduzir o erro
3. Copie TODAS as mensagens de log
4. Procure por mensagens com:
   - 🔐 (login)
   - 📝 (cadastro)
   - 🏋️ (sugestões)
   - ❌ (erros)

#### No Backend (Supabase):

1. Vá em **Logs** → **Edge Functions**
2. Filtre por "make-server"
3. Veja os erros mais recentes
4. Copie a mensagem de erro completa

---

## 📚 Guias Relacionados

| Guia | Quando Usar |
|------|-------------|
| [`/PRIMEIROS-PASSOS.md`](/PRIMEIROS-PASSOS.md) | Primeira vez usando o SmartFit |
| [`/SUPABASE-CONFIG.md`](/SUPABASE-CONFIG.md) | Configurar o banco de dados |
| [`/CRIAR-ADMIN.md`](/CRIAR-ADMIN.md) | Criar usuário administrador |
| [`/SOLUCAO-USUARIO-ORFAO.md`](/SOLUCAO-USUARIO-ORFAO.md) | Erro "email já registrado" |
| [`/SOLUCAO-ERRO-CADASTRO.md`](/SOLUCAO-ERRO-CADASTRO.md) | Erro ao criar perfil |

---

## ✅ Resolução Passo-a-Passo

### Se NADA Estiver Funcionando

Execute esta sequência na ordem:

#### 1. Criar Tabelas
```bash
Execute: /supabase/database-setup.sql
```

#### 2. Inserir Sugestões
```bash
Execute: /supabase/insert-workout-suggestions.sql
```

#### 3. Corrigir Políticas RLS
```bash
Execute: /supabase/fix-rls-policies.sql
```

#### 4. Limpar Usuários Órfãos
```bash
Execute: /supabase/cleanup-orphan-users.sql
```

#### 5. Diagnóstico Final
```bash
Execute: /supabase/diagnostic-and-fix.sql
```

#### 6. Criar Sua Conta
```
1. Vá no app SmartFit
2. Crie uma conta nova
3. Faça login
4. Vá na aba Treinos
5. ✅ Deve funcionar!
```

---

**Bons treinos! 💪🚀**
