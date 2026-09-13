-- ============================================
-- SMARTFIT - DIAGNÓSTICO E CORREÇÃO COMPLETA
-- ============================================

-- IMPORTANTE: Execute este SQL no Editor SQL do Supabase Dashboard
-- (Project -> SQL Editor -> New Query)

-- ==================== DIAGNÓSTICO COMPLETO ====================

-- 1. Verificar se as tabelas existem
SELECT 
  'Tabela: ' || tablename as info,
  'Existe: ✅' as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'atividades', 'metas', 'sugestoes_treinos')
ORDER BY tablename;

-- 2. Verificar dados nas tabelas
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'atividades' as tabela, COUNT(*) as total FROM atividades
UNION ALL
SELECT 'metas' as tabela, COUNT(*) as total FROM metas
UNION ALL
SELECT 'sugestoes_treinos' as tabela, COUNT(*) as total FROM sugestoes_treinos;

-- 3. Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  cmd,
  CASE WHEN qual IS NULL THEN '(sem restrição)' ELSE qual END as restricao
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'atividades', 'metas', 'sugestoes_treinos')
ORDER BY tablename, policyname;

-- 4. Verificar RLS está ativo
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Ativo' ELSE '❌ RLS Desativado' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'atividades', 'metas', 'sugestoes_treinos')
ORDER BY tablename;

-- ==================== CORREÇÃO 1: POLÍTICAS RLS ====================

-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção via service role" ON usuarios;

-- Criar políticas corretas para usuarios
CREATE POLICY "Permitir inserção via service role"
  ON usuarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON usuarios FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON usuarios FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os usuários"
  ON usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Service role pode fazer tudo"
  ON usuarios FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ativar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- ==================== CORREÇÃO 2: SUGESTÕES DE TREINOS ====================

-- Criar política para permitir leitura pública de sugestões
DROP POLICY IF EXISTS "Todos podem ver sugestões" ON sugestoes_treinos;

CREATE POLICY "Todos podem ver sugestões"
  ON sugestoes_treinos FOR SELECT
  USING (ativo = true);

CREATE POLICY "Service role pode gerenciar sugestões"
  ON sugestoes_treinos FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ativar RLS
ALTER TABLE sugestoes_treinos ENABLE ROW LEVEL SECURITY;

-- ==================== VERIFICAR SE SUGESTÕES ESTÃO VAZIAS ====================

DO $$
DECLARE
  count_sugestoes INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_sugestoes FROM sugestoes_treinos;
  
  IF count_sugestoes = 0 THEN
    RAISE NOTICE '⚠️ A tabela sugestoes_treinos está VAZIA!';
    RAISE NOTICE '💡 Execute o script /supabase/insert-workout-suggestions.sql';
  ELSE
    RAISE NOTICE '✅ Encontradas % sugestões de treinos', count_sugestoes;
  END IF;
END $$;

-- ==================== VERIFICAR ESTRUTURA DAS TABELAS ====================

-- Ver colunas da tabela usuarios
SELECT 
  'usuarios' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- Ver colunas da tabela sugestoes_treinos
SELECT 
  'sugestoes_treinos' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sugestoes_treinos'
ORDER BY ordinal_position;

-- ==================== ESTATÍSTICAS FINAIS ====================

SELECT 
  '📊 RESUMO DO DIAGNÓSTICO' as info;

SELECT 
  'Total de usuários' as metrica,
  COUNT(*) as valor
FROM usuarios
UNION ALL
SELECT 
  'Usuários administradores' as metrica,
  COUNT(*) as valor
FROM usuarios
WHERE is_admin = TRUE
UNION ALL
SELECT 
  'Sugestões de treinos ativas' as metrica,
  COUNT(*) as valor
FROM sugestoes_treinos
WHERE ativo = TRUE
UNION ALL
SELECT 
  'Total de atividades registradas' as metrica,
  COUNT(*) as valor
FROM atividades
UNION ALL
SELECT 
  'Metas ativas' as metrica,
  COUNT(*) as valor
FROM metas
WHERE ativo = TRUE;

-- ==================== RESULTADO ESPERADO ====================

/*
Se tudo estiver correto, você deve ver:

✅ Todas as 4 tabelas existem
✅ Políticas RLS criadas corretamente
✅ RLS ativado em todas as tabelas
✅ Pelo menos 30 sugestões de treinos
✅ Pelo menos 1 usuário (você)

Se algo estiver errado, as mensagens de erro dirão o que precisa ser corrigido.
*/
