# 🚀 Configuração do Supabase para SmartFit

## 📋 Pré-requisitos

1. Conta no Supabase (gratuita): https://supabase.com
2. Projeto criado no Supabase

---

## 🔧 Passo a Passo

### 1️⃣ Criar as Tabelas no Banco de Dados

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Copie e cole **TODO** o conteúdo do arquivo `/supabase/database-setup.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a execução (deve aparecer "Success" em verde)

✅ **Resultado esperado:**
- 5 tabelas criadas: `usuarios`, `atividades`, `metas`, `notificacoes`, `sugestoes_treinos`
- 30 sugestões de treinos inseridas
- Políticas RLS configuradas
- Índices criados para performance

---

### 2️⃣ Configurar Autenticação

1. No Supabase Dashboard, vá em **Authentication** → **Providers**
2. Certifique-se de que **Email** está habilitado
3. Em **Email Templates**, você pode personalizar os emails (opcional)
4. Em **URL Configuration**, configure:
   - **Site URL**: URL do seu app (ex: `https://seu-app.com`)
   - **Redirect URLs**: adicione a mesma URL

---

### 3️⃣ Criar Primeiro Usuário Admin

#### Opção A: Via Interface (Recomendado)
1. Inicie o app SmartFit
2. Faça o cadastro normalmente com seu email
3. Volte ao Supabase Dashboard
4. Vá em **SQL Editor** → **New Query**
5. Execute:
```sql
UPDATE usuarios SET is_admin = TRUE WHERE email = 'seu@email.com';
```
6. Pronto! Agora você é admin 🎉

#### Opção B: Criar direto no Supabase
1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique em **Add user** → **Create new user**
3. Preencha email e senha
4. Confirme o email automaticamente
5. Copie o **User UID**
6. Vá em **Table Editor** → `usuarios`
7. Clique em **Insert** → **Insert row**
8. Preencha:
   - `id`: Cole o User UID
   - `email`: Mesmo email cadastrado
   - `nome`: Seu nome
   - `peso`: 70 (ou seu peso)
   - `is_admin`: `true` ✅
9. **Save**

---

### 4️⃣ Obter Credenciais do Supabase

No Supabase Dashboard:
1. Vá em **Settings** (ícone de engrenagem) → **API**
2. Copie:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (token longo)
   - **service_role** key (token longo) ⚠️ **MANTENHA SECRETO!**

---

### 5️⃣ Configurar Variáveis de Ambiente no Figma Make

As variáveis já estão configuradas automaticamente pelo Supabase Connect.
Você não precisa fazer nada aqui! 🎉

---

## 🎯 Verificar se Está Funcionando

### Teste 1: Health Check
```bash
curl https://SEU_PROJECT_ID.supabase.co/functions/v1/make-server-d1a79e63/health
```
**Esperado:** `{"status":"ok"}`

### Teste 2: Listar Sugestões de Treinos
```bash
curl https://SEU_PROJECT_ID.supabase.co/functions/v1/make-server-d1a79e63/workout-suggestions
```
**Esperado:** JSON com 30 sugestões de treinos

### Teste 3: Cadastro
Use o app SmartFit e tente criar uma conta. Deve funcionar sem erros!

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas

1. **RLS (Row Level Security)** habilitado em todas as tabelas
2. **Policies** garantem que usuários só veem seus próprios dados
3. **Admins** têm acesso especial apenas quando autenticados
4. **Service Role Key** usado apenas no backend (nunca no frontend)
5. **Anon Key** usado no frontend (seguro)
6. **Senhas** hasheadas automaticamente pelo Supabase Auth
7. **Cascade DELETE** remove dados relacionados quando usuário é deletado

### ⚠️ IMPORTANTE - Dados Sensíveis

Este app coleta informações pessoais:
- Email
- Nome
- Peso (opcional)
- Idade (opcional)
- Gênero (opcional)
- Dados de atividades físicas

**IMPORTANTE:** O Figma Make não deve ser usado para coletar informações pessoais sensíveis (PII) ou dados confidenciais. Use apenas para protótipos e aplicações de baixo risco.

Para uso em produção:
- Implemente política de privacidade
- Adicione termos de uso
- Configure backup regular
- Monitore logs de acesso
- Implemente LGPD/GDPR compliance

---

## 📊 Estrutura do Banco de Dados

### Tabela: `usuarios`
- `id` (UUID) - Referência ao auth.users
- `email` (VARCHAR)
- `nome` (VARCHAR)
- `peso` (DECIMAL)
- `idade` (INTEGER)
- `genero` (VARCHAR)
- `is_admin` (BOOLEAN) ⭐
- `criado_em` (TIMESTAMP)

### Tabela: `atividades`
- `id` (BIGSERIAL)
- `usuario_id` (UUID FK)
- `tipo` (VARCHAR) - Ex: "Corrida", "Musculação"
- `duracao_min` (INTEGER)
- `distancia_km` (DECIMAL)
- `data_atividade` (DATE)
- `observacao` (TEXT)
- `calorias` (DECIMAL)
- `criado_em` (TIMESTAMP)

### Tabela: `metas`
- `id` (BIGSERIAL)
- `usuario_id` (UUID FK)
- `tipo` (VARCHAR) - Ex: "minutes_week", "calories_week"
- `valor_objetivo` (DECIMAL)
- `ativo` (BOOLEAN)
- `criado_em` (TIMESTAMP)

### Tabela: `notificacoes`
- `id` (BIGSERIAL)
- `usuario_id` (UUID FK)
- `tipo` (VARCHAR)
- `mensagem` (VARCHAR)
- `data_agendada` (TIMESTAMP)
- `enviada` (BOOLEAN)
- `criado_em` (TIMESTAMP)

### Tabela: `sugestoes_treinos`
- `id` (BIGSERIAL)
- `categoria` (VARCHAR) - "Cardio", "Força", "Funcional", etc.
- `titulo` (VARCHAR)
- `descricao` (TEXT)
- `duracao_sugerida` (INTEGER)
- `nivel` (VARCHAR) - "Iniciante", "Intermediário", "Avançado"
- `calorias_estimadas` (DECIMAL)
- `ativo` (BOOLEAN)
- `criado_em` (TIMESTAMP)

---

## 🎨 Categorias de Sugestões de Treinos

1. **Cardio** (6 sugestões)
   - Caminhada, Corrida, Ciclismo, etc.

2. **Força** (6 sugestões)
   - Peito/Tríceps, Costas/Bíceps, Pernas, etc.

3. **Funcional** (5 sugestões)
   - HIIT, CrossFit, Peso Corporal, etc.

4. **Flexibilidade** (5 sugestões)
   - Yoga, Alongamento, Pilates, etc.

5. **Esportes** (5 sugestões)
   - Futebol, Basquete, Natação, etc.

6. **Recuperação** (5 sugestões)
   - Alongamento, Foam Rolling, Meditação, etc.

---

## 🛠️ API Endpoints Disponíveis

Base URL: `https://SEU_PROJECT_ID.supabase.co/functions/v1/make-server-d1a79e63`

### Autenticação
- `POST /auth/signup` - Cadastrar novo usuário
- `POST /auth/login` - Fazer login
- `GET /auth/session` - Verificar sessão (requer token)

### Atividades
- `GET /activities` - Listar atividades (requer token)
- `POST /activities` - Criar atividade (requer token)
- `DELETE /activities/:id` - Deletar atividade (requer token)

### Metas
- `GET /goals` - Listar metas (requer token)
- `POST /goals` - Criar meta (requer token)
- `PUT /goals/:id` - Atualizar meta (requer token)

### Sugestões
- `GET /workout-suggestions` - Listar sugestões (público)

### Admin (requer token + is_admin = true)
- `GET /admin/users` - Listar todos os usuários
- `PUT /admin/users/:id/promote` - Tornar usuário admin
- `PUT /admin/users/:id/demote` - Remover admin
- `DELETE /admin/users/:id` - Deletar usuário
- `GET /admin/users/:id/stats` - Ver estatísticas do usuário

---

## 🐛 Troubleshooting

### Erro: "relation usuarios does not exist"
**Solução:** Execute o SQL de criação das tabelas (`database-setup.sql`)

### Erro: "new row violates row-level security policy"
**Solução:** Verifique se as políticas RLS estão criadas corretamente

### Erro: "JWT expired" ou "invalid token"
**Solução:** Faça login novamente. Tokens expiram após 1 hora.

### Erro: "Email already registered"
**Solução:** Use outro email ou recupere a senha do email existente

### Usuário criado mas não aparece na tabela usuarios
**Solução:** Verifique os logs do servidor. Pode ser erro de permissão RLS.

### Admin não consegue ver outros usuários
**Solução:** 
```sql
UPDATE usuarios SET is_admin = TRUE WHERE email = 'admin@email.com';
```

---

## 📝 Próximos Passos

Após configurar tudo:
1. ✅ Banco de dados criado
2. ✅ Primeiro admin configurado
3. 🔄 Migrar frontend para usar Supabase
4. 🔄 Criar painel administrativo
5. 🔄 Implementar lista de sugestões de treinos

---

## 💡 Dicas

- Use **Table Editor** no Supabase para visualizar dados em tempo real
- Use **Logs** para debugar erros
- Use **Database → Roles** para gerenciar permissões avançadas
- Habilite **Database Webhooks** para integrar com outros serviços
- Configure **Backups automáticos** em produção

---

## 🆘 Suporte

- Documentação Supabase: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security

---

**Feito com 💚 para o SmartFit**
