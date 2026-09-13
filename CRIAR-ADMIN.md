# 👑 Como Criar o Usuário Administrador

## 📋 Resumo Rápido

Você precisa criar um usuário administrador para gerenciar o sistema SmartFit. Este guia mostra como fazer isso em **2 passos simples**.

---

## ✅ Passo 1: Criar a Conta no SmartFit

### 1.1. Acesse o App SmartFit

Abra o aplicativo SmartFit no seu navegador.

### 1.2. Vá em "Criar Conta"

Clique na aba **"Criar Conta"** na tela de login.

### 1.3. Preencha os Dados do Admin

Use estas credenciais (ou personalize):

```
📧 Email: admin@smartfit.com
🔐 Senha: Admin@2026
👤 Nome: Administrador Sistema
⚖️ Peso: 70 (opcional)
🎂 Idade: 30 (opcional)
⚧ Gênero: Masculino (opcional)
```

⚠️ **IMPORTANTE:** Anote essas credenciais! Você vai precisar delas depois.

### 1.4. Criar a Conta

Clique no botão **"Criar Conta"**.

✅ **Resultado:** Você será automaticamente conectado como usuário normal.

---

## 👑 Passo 2: Tornar o Usuário Admin

Agora você precisa dar privilégios de administrador para esse usuário.

### 2.1. Acessar o Supabase Dashboard

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto **SmartFit**

### 2.2. Abrir o SQL Editor

No menu lateral esquerdo, clique em:
- **SQL Editor**

### 2.3. Criar Nova Query

Clique em **"New Query"** (ou "+ New query")

### 2.4. Executar o Comando SQL

Cole e execute este comando:

```sql
UPDATE usuarios 
SET is_admin = TRUE 
WHERE email = 'admin@smartfit.com';
```

⚠️ Se você usou um email diferente no Passo 1, substitua aqui também!

### 2.5. Verificar se Funcionou

Execute este comando para confirmar:

```sql
SELECT 
  email, 
  nome, 
  is_admin,
  criado_em
FROM usuarios 
WHERE email = 'admin@smartfit.com';
```

✅ **Resultado esperado:** Você deve ver o usuário com `is_admin = true`

---

## 🎉 Passo 3: Testar o Acesso Admin

### 3.1. Fazer Logout no SmartFit

Volte ao app SmartFit e faça **logout**.

### 3.2. Fazer Login Novamente

Faça login com as credenciais do admin:
- Email: `admin@smartfit.com`
- Senha: `Admin@2026`

### 3.3. Verificar Aba Admin

Após o login, você deve ver uma nova aba **"Admin"** no menu de navegação! 🎉

---

## 📊 O que o Admin Pode Fazer?

Como administrador, você terá acesso ao **Painel Administrativo** com:

✅ **Visualizar todos os usuários** do sistema
✅ **Promover outros usuários** a administrador
✅ **Remover privilégios** de admin de usuários
✅ **Deletar usuários** do sistema
✅ **Ver estatísticas** de cada usuário:
   - Total de atividades
   - Calorias queimadas
   - Minutos de exercício
   - Distância percorrida
   - Metas ativas

---

## 🔒 Segurança - IMPORTANTE!

### Para Ambiente de Produção:

1. **❌ NÃO use** `admin@smartfit.com` e `Admin@2026` em produção
2. **✅ Use** um email real que você controla
3. **✅ Use** uma senha forte e única
4. **✅ Considere** habilitar autenticação de dois fatores no Supabase

### Exemplo de Credenciais Seguras:

```
Email: seu.email.real@dominio.com
Senha: Use um gerenciador de senhas para criar uma senha forte
```

---

## 🛠️ Comandos SQL Úteis

### Ver Todos os Administradores

```sql
SELECT 
  id,
  email, 
  nome, 
  is_admin,
  criado_em
FROM usuarios 
WHERE is_admin = TRUE
ORDER BY criado_em DESC;
```

### Ver Todos os Usuários

```sql
SELECT 
  id,
  email, 
  nome, 
  is_admin,
  criado_em
FROM usuarios 
ORDER BY criado_em DESC;
```

### Tornar Outro Usuário Admin

```sql
UPDATE usuarios 
SET is_admin = TRUE 
WHERE email = 'email_do_usuario@exemplo.com';
```

### Remover Privilégios de Admin

```sql
UPDATE usuarios 
SET is_admin = FALSE 
WHERE email = 'email_do_usuario@exemplo.com';
```

---

## ❓ Problemas Comuns

### ❌ "Usuário não aparece na consulta SQL"

**Causa:** A conta não foi criada via interface ainda

**Solução:** 
1. Volte ao Passo 1
2. Crie a conta através do app SmartFit primeiro
3. Depois execute o comando SQL para tornar admin

---

### ❌ "A aba Admin não aparece depois do login"

**Causa:** O cache do navegador ou você não fez logout/login

**Solução:**
1. Faça **logout** completamente do SmartFit
2. Limpe o cache do navegador (Ctrl + Shift + Delete)
3. Faça **login** novamente
4. A aba Admin deve aparecer

---

### ❌ "relation 'usuarios' does not exist"

**Causa:** As tabelas do banco de dados não foram criadas

**Solução:**
1. Execute primeiro o script `/supabase/database-setup.sql`
2. Depois volte e execute o comando para tornar admin

---

### ❌ "Erro ao atualizar usuário"

**Causa:** Problema com políticas RLS

**Solução:**
1. Execute o script `/supabase/fix-rls-policies.sql`
2. Tente novamente o comando UPDATE

---

## 📝 Checklist de Verificação

Antes de considerar concluído, verifique:

- [ ] Criei a conta via interface do SmartFit
- [ ] Executei o comando SQL para tornar admin
- [ ] Verifiquei que `is_admin = true` na consulta
- [ ] Fiz logout e login novamente
- [ ] A aba "Admin" aparece no menu
- [ ] Consigo acessar o painel administrativo
- [ ] Alterei as credenciais padrão (se em produção)

---

## 🎯 Próximos Passos

Agora que você é administrador, você pode:

1. ✅ **Criar usuários de teste** via interface
2. ✅ **Promover outros admins** se necessário
3. ✅ **Gerenciar usuários** através do painel admin
4. ✅ **Monitorar atividades** de todos os usuários
5. ✅ **Configurar o sistema** conforme necessário

---

## 💚 Pronto para Administrar!

Agora você tem acesso total ao sistema SmartFit como administrador! 

Use seus poderes com sabedoria! 💪👑

---

**Documentos Relacionados:**
- `PRIMEIROS-PASSOS.md` - Guia básico do sistema
- `SUPABASE-CONFIG.md` - Configuração do banco de dados
- `SOLUCAO-ERRO-CADASTRO.md` - Resolver problemas de cadastro
