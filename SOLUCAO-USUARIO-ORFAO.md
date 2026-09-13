# 🔧 Solução: Email Já Registrado (Usuários Órfãos)

## ❌ Problema

Você está recebendo o erro:
```
❌ Erro no cadastro: A user with this email address has already been registered
```

## 🔍 O Que Aconteceu?

Este erro ocorre quando existe um **usuário órfão** no sistema:

1. ✅ Você tentou criar uma conta
2. ✅ O usuário foi criado com sucesso no **Supabase Auth**
3. ❌ MAS falhou ao criar o perfil na tabela **`usuarios`** (devido a erro RLS)
4. ⚠️ O usuário ficou "preso" no Auth, mas não está completo no sistema
5. ❌ Agora não consegue se cadastrar novamente porque o email já existe no Auth

---

## ✅ Soluções

### 🎯 Solução 1: Limpar Usuário Órfão pelo Supabase Dashboard (Mais Fácil)

#### Passo 1: Acessar o Supabase Dashboard

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto **SmartFit**

#### Passo 2: Ir em Authentication

1. No menu lateral esquerdo, clique em **Authentication**
2. Clique em **Users**

#### Passo 3: Encontrar e Deletar o Usuário

1. Procure pelo email que você tentou cadastrar (ex: `admin@smartfit.com`)
2. Clique nos **3 pontinhos** (⋮) ao lado do usuário
3. Clique em **Delete user**
4. Confirme a exclusão

#### Passo 4: Tentar Cadastrar Novamente

1. Volte ao app SmartFit
2. Tente criar a conta novamente com o mesmo email
3. ✅ Agora deve funcionar!

---

### 🎯 Solução 2: Limpar Via SQL (Método Avançado)

#### Passo 1: Acessar o SQL Editor

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**

#### Passo 2: Listar Usuários Órfãos

Execute este comando para ver quais usuários estão órfãos:

```sql
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE 
    WHEN u.id IS NULL THEN '❌ ÓRFÃO'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN usuarios u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;
```

#### Passo 3: Deletar Usuário Específico

Substitua `admin@smartfit.com` pelo email que você quer limpar:

```sql
DELETE FROM auth.users 
WHERE email = 'admin@smartfit.com' 
  AND id NOT IN (SELECT id FROM usuarios);
```

#### Passo 4: Verificar

Execute novamente o comando do Passo 2 para confirmar que não há mais órfãos.

#### Passo 5: Tentar Cadastrar Novamente

Volte ao app e tente criar a conta novamente.

---

### 🎯 Solução 3: Limpar TODOS os Usuários Órfãos (Use com Cuidado)

⚠️ **ATENÇÃO:** Isso vai deletar TODOS os usuários que estão no Auth mas não na tabela usuarios!

```sql
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM usuarios);
```

Depois verifique:

```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_no_auth,
  (SELECT COUNT(*) FROM usuarios) as total_na_tabela,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM usuarios)) as orfaos;
```

Se `orfaos = 0`, está tudo limpo! ✅

---

## 🛡️ Por Que Isso Acontece?

O problema era causado pelas **políticas RLS (Row Level Security)** que impediam a inserção de novos usuários na tabela `usuarios`.

### ✅ JÁ FOI CORRIGIDO!

O código do servidor já foi atualizado para:
1. Tentar criar o usuário no Auth
2. Tentar inserir na tabela usuarios
3. ❗ **SE FALHAR:** Deletar automaticamente o usuário do Auth (rollback)

Isso evita que novos usuários órfãos sejam criados no futuro.

---

## 📋 Checklist de Resolução

- [ ] Executei a correção de políticas RLS (`/supabase/fix-rls-policies.sql`)
- [ ] Limpei os usuários órfãos (via Dashboard ou SQL)
- [ ] Tentei cadastrar novamente no app
- [ ] O cadastro funcionou com sucesso
- [ ] Consigo fazer login normalmente

---

## 🔍 Como Prevenir no Futuro

### 1. Garanta que as Políticas RLS Estão Corretas

Execute o script de correção:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON usuarios;

-- Criar política correta para INSERT
CREATE POLICY "Permitir inserção via service role"
  ON usuarios FOR INSERT
  WITH CHECK (true);

-- Outras políticas
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON usuarios FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON usuarios FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os usuários"
  ON usuarios FOR SELECT
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND is_admin = TRUE));

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
```

### 2. Verifique os Logs do Console

Quando tentar cadastrar, abra o Console do navegador (F12) e veja:

```
📝 Iniciando cadastro: { email: '...', name: '...' }
✅ Usuário criado no Auth: [uuid]
✅ Perfil criado com sucesso no banco de dados
✅ Cadastro bem-sucedido! Fazendo login automático...
```

Se algo falhar, os logs dirão exatamente onde está o problema.

---

## 🆘 Script Completo de Diagnóstico

Execute este script no SQL Editor para obter um diagnóstico completo:

```sql
-- ==================== DIAGNÓSTICO COMPLETO ====================

-- 1. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 2. Verificar usuários órfãos
SELECT 
  au.id,
  au.email,
  au.created_at as criado_no_auth,
  CASE 
    WHEN u.id IS NULL THEN '❌ ÓRFÃO (deletar este)'
    ELSE '✅ OK'
  END as status
FROM auth.users au
LEFT JOIN usuarios u ON au.id = u.id
ORDER BY au.created_at DESC;

-- 3. Estatísticas gerais
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_no_auth,
  (SELECT COUNT(*) FROM usuarios) as total_na_tabela_usuarios,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM usuarios)) as usuarios_orfaos;

-- 4. Verificar estrutura da tabela usuarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
```

---

## 💡 Dicas Úteis

### Para Desenvolvimento/Testes

Se você está testando e criando muitos usuários, pode ser útil limpar tudo:

```sql
-- ⚠️ APENAS PARA DESENVOLVIMENTO! Isso deleta TODOS os usuários!

-- Deletar todos os usuários da tabela
DELETE FROM usuarios;

-- Deletar todos os usuários do Auth
-- (faça manualmente no Dashboard em Authentication → Users)
```

### Verificar Logs do Servidor

1. Vá em **Logs** → **Edge Functions** no Supabase Dashboard
2. Procure por mensagens com ❌ ou erros
3. Veja exatamente o que está falhando

---

## 📞 Ainda Não Funcionou?

Se após seguir todos os passos ainda não funcionar:

1. **Console do Navegador (F12):**
   - Abra o console
   - Tente cadastrar
   - Copie TODAS as mensagens de erro

2. **Logs do Supabase:**
   - Acesse Edge Functions logs
   - Copie os erros relacionados ao seu cadastro

3. **Verificar Credenciais:**
   - No frontend, confira `VITE_SUPABASE_PROJECT_ID` e `VITE_SUPABASE_ANON_KEY` em `.env.local`. Na Edge Function, confira `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nos secrets do Supabase; nunca coloque a service role key no frontend.

---

## ✅ Resultado Esperado

Após aplicar a correção:

1. ✅ Não há mais usuários órfãos
2. ✅ Consegue criar novas contas sem erros
3. ✅ O usuário aparece tanto no Auth quanto na tabela `usuarios`
4. ✅ Consegue fazer login normalmente
5. ✅ Todos os dados do perfil estão salvos corretamente

---

**Arquivos Relacionados:**
- `/supabase/cleanup-orphan-users.sql` - Script completo de limpeza
- `/supabase/fix-rls-policies.sql` - Correção de políticas RLS
- `/SOLUCAO-ERRO-CADASTRO.md` - Outros erros de cadastro

**Bons treinos! 💪🚀**
