# 🚀 Primeiros Passos - SmartFit

## ⚠️ IMPORTANTE - Leia Antes de Usar!

Se você está vendo o erro **"Credenciais inválidas"**, é porque:

### ✅ **Você precisa CRIAR UMA CONTA primeiro!**

O SmartFit usa um banco de dados real (Supabase), então não há usuários pré-cadastrados.

---

## 📋 Como Começar

### Passo 1: Criar Sua Conta

1. **Acesse o app SmartFit**
2. Clique na aba **"Criar Conta"**
3. Preencha os campos:
   - ✅ Nome completo
   - ✅ Email (use um email real ou qualquer email válido)
   - ✅ Senha (mínimo 6 caracteres)
   - 📊 Peso (opcional - para cálculo de calorias)
   - 📊 Idade (opcional)
   - 📊 Gênero (opcional)
4. Clique em **"Criar Conta"**
5. ✅ **Pronto!** Você será automaticamente conectado

---

### Passo 2: Fazer Login (Próximas Vezes)

1. Acesse o app
2. Na aba **"Entrar"**:
   - Digite o **mesmo email** que você usou no cadastro
   - Digite a **mesma senha**
3. Clique em **"Entrar"**

---

## 🔐 Credenciais de Teste

Como o banco de dados está vazio inicialmente, você pode criar sua própria conta de teste:

```
Email: teste@smartfit.com
Senha: teste123
Nome: Usuário Teste
```

Ou use qualquer combinação que preferir!

---

## 👑 Como Ter Acesso de Administrador

Se você quiser acessar o **Painel Administrativo** para gerenciar usuários:

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com)
2. Entre no seu projeto
3. Vá em **SQL Editor**
4. Execute o comando:
   ```sql
   UPDATE usuarios SET is_admin = TRUE WHERE email = 'seu@email.com';
   ```
5. Substitua `seu@email.com` pelo email que você cadastrou
6. Faça logout e login novamente no SmartFit
7. ✅ Agora você é admin! Uma nova aba "Admin" aparecerá no menu

---

## ❓ Problemas Comuns

### ❌ "Credenciais inválidas"
**Causa:** Você ainda não criou uma conta
**Solução:** Vá na aba "Criar Conta" e cadastre-se primeiro

### ❌ "Email já cadastrado"
**Causa:** Esse email já foi usado
**Solução:** Use outro email ou faça login com o email existente

### ❌ "A user with this email address has already been registered"
**Causa:** Usuário órfão - existe no Auth mas não na tabela usuarios
**Solução:** 
1. Acesse Supabase Dashboard → Authentication → Users
2. Encontre o usuário com esse email
3. Delete o usuário (3 pontinhos → Delete user)
4. Tente cadastrar novamente
5. **OU** veja o guia completo em `/SOLUCAO-USUARIO-ORFAO.md`

### ❌ "Erro no cadastro: Erro ao criar perfil do usuário"
**Causa:** Problema com políticas RLS (Row Level Security) do Supabase
**Solução:** 
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute o script `/supabase/fix-rls-policies.sql`
4. **OU** veja o guia completo em `/SOLUCAO-ERRO-CADASTRO.md`

### ❌ "Erro ao fazer login. Verifique sua conexão."
**Causa:** Problema de rede ou servidor Supabase não configurado
**Solução:** 
1. Verifique sua internet
2. Verifique se configurou o Supabase corretamente (veja `SUPABASE-CONFIG.md`)
3. Execute o script SQL para criar as tabelas (`/supabase/database-setup.sql`)

### ❌ "relation usuarios does not exist"
**Causa:** As tabelas do banco de dados não foram criadas
**Solução:** 
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute todo o conteúdo do arquivo `/supabase/database-setup.sql`

---

## 🎯 Próximos Passos Após o Login

1. ✅ **Dashboard**: Veja suas estatísticas
2. ➕ **Nova Atividade**: Registre seus treinos
3. 🎯 **Metas**: Defina objetivos semanais
4. 📊 **Histórico**: Acompanhe sua evolução com gráficos
5. 💪 **Sugestões de Treinos**: Descubra 30 treinos pré-cadastrados
6. 👑 **Admin** (se você for admin): Gerencie usuários

---

## 📱 Recursos do SmartFit

- ✅ PWA (Instale como app no celular)
- ✅ Notificações motivacionais
- ✅ Funciona offline
- ✅ Cálculo automático de calorias (baseado em MET)
- ✅ Gráficos de evolução
- ✅ Exportação de dados
- ✅ Sistema multi-usuário com autenticação

---

## 💚 Aproveite o SmartFit!

Qualquer dúvida, consulte os arquivos:
- `LEIA-ME-PRIMEIRO.md` - Visão geral do projeto
- `SUPABASE-CONFIG.md` - Como configurar o banco de dados
- `PWA-GUIA.md` - Como instalar o app

**Bons treinos! 💪🏃‍♂️**