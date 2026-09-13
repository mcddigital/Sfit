-- ============================================
-- SMARTFIT - CORREÇÃO DE POLÍTICAS RLS
-- Execute este script se estiver tendo problemas com cadastro
-- ============================================

-- IMPORTANTE: Execute este SQL no Editor SQL do Supabase Dashboard
-- (Project -> SQL Editor -> New Query)

-- ==================== LIMPAR POLÍTICAS EXISTENTES ====================

-- Remover todas as políticas antigas da tabela usuarios
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON usuarios;

-- ==================== RECRIAR POLÍTICAS CORRETAS ====================

-- Política para SELECT (visualizar)
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

-- Política para UPDATE (atualizar)
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Política para admins verem todos os usuários
CREATE POLICY "Admins podem ver todos os usuários"
  ON usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ⭐ NOVA POLÍTICA: Permitir inserção de novos usuários
-- Permite que o SERVICE ROLE KEY insira novos usuários
CREATE POLICY "Permitir inserção via service role"
  ON usuarios FOR INSERT
  WITH CHECK (true);

-- ==================== VERIFICAR RLS ====================

-- RLS deve estar habilitado na tabela usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- ==================== INFORMAÇÕES ====================

-- Para verificar se as políticas foram criadas corretamente, execute:
-- SELECT * FROM pg_policies WHERE tablename = 'usuarios';

-- Se ainda tiver problemas, desabilite temporariamente o RLS para a tabela usuarios:
-- ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
-- (Mas lembre-se de reabilitar depois para manter a segurança!)

-- Para reabilitar:
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
