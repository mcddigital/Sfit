-- ============================================
-- SMARTFIT - LIMPAR USUÁRIOS ÓRFÃOS
-- ============================================

-- IMPORTANTE: Execute este SQL no Editor SQL do Supabase Dashboard
-- (Project -> SQL Editor -> New Query)

-- ==================== O QUE SÃO USUÁRIOS ÓRFÃOS? ====================

-- Usuários órfãos são aqueles que existem no Supabase Auth mas NÃO 
-- existem na tabela 'usuarios'. Isso acontece quando:
-- 1. O cadastro criou o usuário no Auth
-- 2. MAS falhou ao inserir na tabela usuarios (erro RLS, constraint, etc)
-- 3. O usuário fica "preso" no Auth e não consegue se cadastrar novamente

-- ==================== LISTAR USUÁRIOS ÓRFÃOS ====================

-- Ver usuários que estão no Auth mas não na tabela usuarios
SELECT 
  au.id,
  au.email,
  au.created_at as criado_no_auth,
  CASE 
    WHEN u.id IS NULL THEN '❌ ÓRFÃO (não está na tabela usuarios)'
    ELSE '✅ OK (está na tabela usuarios)'
  END as status
FROM auth.users au
LEFT JOIN usuarios u ON au.id = u.id
ORDER BY au.created_at DESC;

-- ==================== DELETAR USUÁRIOS ÓRFÃOS ====================

-- ⚠️ ATENÇÃO: Isso vai DELETAR permanentemente os usuários órfãos do Auth!
-- Execute apenas se tiver certeza.

-- OPÇÃO 1: Deletar um usuário específico por email
-- Descomente e execute (substitua o email):
/*
DELETE FROM auth.users 
WHERE email = 'admin@smartfit.com' 
  AND id NOT IN (SELECT id FROM usuarios);
*/

-- OPÇÃO 2: Deletar TODOS os usuários órfãos de uma vez
-- ⚠️ USE COM CUIDADO! Isso deleta todos os usuários que não estão na tabela usuarios
/*
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM usuarios);
*/

-- ==================== MÉTODO SEGURO: USAR SUPABASE ADMIN API ====================

-- Se os comandos acima não funcionarem (permissões), use o método via servidor:
-- Vá no Supabase Dashboard → Authentication → Users
-- Encontre o usuário órfão manualmente
-- Clique nos 3 pontinhos → Delete user

-- ==================== VERIFICAR DEPOIS DE LIMPAR ====================

-- Executar novamente para confirmar que limpou:
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
WHERE u.id IS NULL;

-- Se não retornar nenhuma linha, significa que não há mais órfãos! ✅

-- ==================== RECADASTRAR USUÁRIO ====================

-- Após limpar os usuários órfãos:
-- 1. Volte ao app SmartFit
-- 2. Tente cadastrar novamente com o mesmo email
-- 3. Agora deve funcionar! ✅

-- ==================== ESTATÍSTICAS DO BANCO ====================

-- Ver quantos usuários existem em cada lugar
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_no_auth,
  (SELECT COUNT(*) FROM usuarios) as total_na_tabela,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM usuarios)) as orfaos;

-- ==================== PREVENIR NO FUTURO ====================

-- Este problema já foi corrigido no código do servidor.
-- Agora, se falhar ao inserir na tabela usuarios, o servidor automaticamente
-- deleta o usuário do Auth (rollback).

-- Para garantir que está funcionando, veja o código em:
-- /supabase/functions/make-server-d1a79e63/index.tsx
-- Linha ~80: await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
