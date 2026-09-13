# 🔧 Solução para Erro de Cadastro

## ❌ Problema

Você está recebendo o erro:
```
Erro no cadastro: Erro ao criar perfil do usuário
```

## 🔍 Causa do Problema

O erro ocorre porque as **políticas RLS (Row Level Security)** do Supabase estão impedindo que o servidor insira novos usuários na tabela `usuarios`.

Quando você cria uma conta:
1. ✅ O usuário é criado com sucesso no **Supabase Auth**
2. ❌ MAS falha ao inserir os dados na tabela **`usuarios`** devido às políticas RLS

## ✅ Solução Rápida

Execute o script SQL de correção no Supabase:

### Passo 1: Acessar o Supabase Dashboard

1. Acesse [https://supabase.com](https://supabase.com)
2. Entre no seu projeto SmartFit
3. Vá em **SQL Editor** (no menu lateral esquerdo)

### Passo 2: Executar o Script de Correção

Copie e execute TODO o conteúdo do arquivo `/supabase/fix-rls-policies.sql`:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON usuarios;

-- Recriar políticas corretas
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

-- ⭐ NOVA POLÍTICA: Permitir inserção de novos usuários
CREATE POLICY "Permitir inserção via service role"
  ON usuarios FOR INSERT
  WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
```

### Passo 3: Testar o Cadastro

1. Volte ao SmartFit
2. Tente criar uma nova conta
3. ✅ Agora deve funcionar!

---

## 🛡️ Solução Alternativa (Temporária)

Se você quiser testar rapidamente e não se importa com segurança neste momento (apenas para desenvolvimento), pode **desabilitar temporariamente** o RLS na tabela `usuarios`:

```sql
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
```

⚠️ **IMPORTANTE:** Isso remove a proteção de segurança! Use apenas em desenvolvimento local.

Para reabilitar depois:

```sql
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
```

---

## 🔍 Como Verificar se Funcionou

### No Console do Navegador

Após executar o script, abra o console do navegador (F12) e tente criar uma conta. Você deve ver:

```
📝 Iniciando cadastro para: seu@email.com
✅ Usuário criado no Auth: [uuid]
✅ Perfil criado com sucesso no banco de dados
✅ Cadastro bem-sucedido! Fazendo login automático...
🔐 Tentando fazer login...
✅ Login bem-sucedido!
```

### No Supabase Dashboard

1. Vá em **Table Editor** → **usuarios**
2. Você deve ver o novo usuário criado
3. Verifique se os campos `email`, `nome`, `peso`, etc. estão preenchidos

---

## 📋 Checklist de Verificação

- [ ] Executou o script SQL no Supabase Dashboard
- [ ] Verificou que as 4 políticas foram criadas (veja abaixo como verificar)
- [ ] Tentou criar uma nova conta no SmartFit
- [ ] Verificou os logs no console do navegador (F12)
- [ ] Confirmou que o usuário aparece na tabela `usuarios`

### Como Verificar as Políticas Criadas

Execute no SQL Editor:

```sql
SELECT * FROM pg_policies WHERE tablename = 'usuarios';
```

Você deve ver 4 políticas:
1. `Usuários podem ver seu próprio perfil`
2. `Usuários podem atualizar seu próprio perfil`
3. `Admins podem ver todos os usuários`
4. `Permitir inserção via service role`

---

## ❓ Ainda Não Funcionou?

### 1. Verifique os Logs do Servidor

No Supabase Dashboard:
- Vá em **Logs** → **Edge Functions**
- Procure por mensagens de erro detalhadas
- Os logs devem mostrar exatamente qual é o problema

### 2. Verifique a Estrutura da Tabela

Execute no SQL Editor:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios';
```

Certifique-se que a tabela tem estas colunas:
- `id` (UUID)
- `email` (VARCHAR)
- `nome` (VARCHAR)
- `peso` (DECIMAL)
- `idade` (INTEGER)
- `genero` (VARCHAR)
- `is_admin` (BOOLEAN)
- `criado_em` (TIMESTAMP)

### 3. Recrie a Tabela (Última Opção)

Se nada funcionar, execute o script completo de criação:

```sql
-- Deletar e recriar a tabela
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  peso DECIMAL(5,2) DEFAULT 70.00,
  idade INTEGER,
  genero VARCHAR(20),
  is_admin BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Em seguida, execute novamente o script de políticas RLS.

---

## 💬 Suporte

Se o problema persistir:

1. **Verifique o Console do Navegador** (F12) para logs detalhados
2. **Verifique os Logs do Edge Functions** no Supabase Dashboard
3. **Compartilhe os erros específicos** que aparecem nos logs

---

## ✅ Resultado Esperado

Após aplicar a correção, você deve conseguir:
- ✅ Criar novas contas sem erros
- ✅ Ver o usuário criado na tabela `usuarios`
- ✅ Fazer login com a conta criada
- ✅ Acessar o Dashboard com todos os dados do usuário

**Bons treinos! 💪🏃‍♂️**
