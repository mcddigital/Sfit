-- ============================================
-- SMARTFIT - CRIAR USUÁRIO ADMINISTRADOR
-- ============================================

-- IMPORTANTE: Execute este SQL no Editor SQL do Supabase Dashboard
-- (Project -> SQL Editor -> New Query)

-- ==================== INSTRUÇÕES ====================

-- Este script cria um usuário administrador completo no sistema SmartFit.
-- O usuário será criado com:
--   Email: admin@smartfit.com
--   Senha: Admin@2026
--   Nome: Administrador Sistema
--   Privilégios: Administrador

-- ⚠️ ATENÇÃO: Altere o email e senha antes de executar em produção!

-- ==================== PASSO 1: CRIAR USUÁRIO NO AUTH ====================

-- OPÇÃO A: Criar usuário via SQL (Método Direto)
-- Substitua os valores abaixo conforme necessário

DO $$
DECLARE
  new_user_id UUID;
  user_email TEXT := 'admin@smartfit.com';
  user_password TEXT := 'Admin@2026';
  user_name TEXT := 'Administrador Sistema';
BEGIN
  -- Criar usuário no Supabase Auth (isso precisa ser feito via API)
  -- Como não podemos criar via SQL diretamente, vamos apenas criar na tabela usuarios
  -- Você precisará fazer o cadastro manual via interface primeiro
  
  RAISE NOTICE 'Para criar o usuário admin, siga os passos abaixo:';
  RAISE NOTICE '1. Acesse o app SmartFit';
  RAISE NOTICE '2. Vá na aba "Criar Conta"';
  RAISE NOTICE '3. Use os dados:';
  RAISE NOTICE '   Email: %', user_email;
  RAISE NOTICE '   Senha: %', user_password;
  RAISE NOTICE '   Nome: %', user_name;
  RAISE NOTICE '4. Após criar, volte aqui e execute o PASSO 2 deste script';
END $$;

-- ==================== PASSO 2: TORNAR O USUÁRIO ADMIN ====================

-- Execute este comando APÓS criar a conta via interface
-- Substitua o email se você usou um diferente

UPDATE usuarios 
SET is_admin = TRUE 
WHERE email = 'admin@smartfit.com';

-- Verificar se funcionou
SELECT 
  id,
  email, 
  nome, 
  is_admin,
  criado_em
FROM usuarios 
WHERE email = 'admin@smartfit.com';

-- Se você ver o usuário com is_admin = true, está tudo certo! ✅

-- ==================== COMANDOS ÚTEIS ====================

-- Ver todos os administradores do sistema
SELECT 
  id,
  email, 
  nome, 
  peso,
  idade,
  is_admin,
  criado_em
FROM usuarios 
WHERE is_admin = TRUE
ORDER BY criado_em DESC;

-- Ver todos os usuários (admin e normais)
SELECT 
  id,
  email, 
  nome, 
  is_admin,
  criado_em
FROM usuarios 
ORDER BY criado_em DESC;

-- Tornar outro usuário admin (substitua o email)
-- UPDATE usuarios SET is_admin = TRUE WHERE email = 'outro@email.com';

-- Remover privilégios de admin de um usuário (substitua o email)
-- UPDATE usuarios SET is_admin = FALSE WHERE email = 'usuario@email.com';

-- ==================== CREDENCIAIS PADRÃO ====================

-- 👤 USUÁRIO ADMINISTRADOR PADRÃO
-- Email: admin@smartfit.com
-- Senha: Admin@2026
-- Função: Administrador

-- ⚠️ IMPORTANTE PARA PRODUÇÃO:
-- 1. Altere a senha padrão imediatamente após o primeiro login
-- 2. Use um email real que você controla
-- 3. Considere usar autenticação de dois fatores

-- ==================== TROUBLESHOOTING ====================

-- Problema: Usuário não aparece na tabela usuarios
-- Solução: Você criou a conta via interface? O processo de cadastro
--          deve criar o usuário tanto no Auth quanto na tabela usuarios

-- Problema: "relation usuarios does not exist"
-- Solução: Execute o script database-setup.sql primeiro

-- Problema: Não consigo fazer login depois de tornar admin
-- Solução: Faça logout e login novamente. A flag de admin é carregada no login.
