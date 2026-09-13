# 🏃‍♂️ SmartFit - Guia de Uso Completo

## 🎉 Bem-vindo ao SmartFit com Supabase!

Seu aplicativo de atividades físicas agora está conectado a um banco de dados real na nuvem com sistema de administração!

---

## 📋 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Para Usuários](#para-usuários)
3. [Para Administradores](#para-administradores)
4. [Sugestões de Treinos](#sugestões-de-treinos)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Solução de Problemas](#solução-de-problemas)

---

## 🚀 Primeiros Passos

### 1. Configurar o Supabase

**ANTES DE USAR O APP, VOCÊ PRECISA CONFIGURAR O BANCO DE DADOS!**

1. Leia o arquivo `/SUPABASE-CONFIG.md`
2. Execute o SQL em `/supabase/database-setup.sql` no Supabase
3. Aguarde confirmação de sucesso

### 2. Criar Primeira Conta

1. Abra o SmartFit
2. Clique em "Criar Conta"
3. Preencha:
   - **Nome**: Seu nome completo
   - **Email**: seu@email.com
   - **Senha**: Mínimo 6 caracteres
   - **Peso** (opcional): Para cálculo preciso de calorias
   - **Idade** (opcional): Para estatísticas
   - **Gênero** (opcional): Para personalização

4. Clique em "Criar Conta"
5. ✅ Login automático após cadastro

### 3. Tornar-se Administrador

**Após criar sua conta, torne-se admin:**

1. Vá para o Supabase Dashboard
2. Abra **SQL Editor**
3. Execute:
```sql
UPDATE usuarios SET is_admin = TRUE WHERE email = 'seu@email.com';
```
4. Faça logout e login novamente
5. 👑 Você verá a aba "Admin" no menu!

---

## 👤 Para Usuários

### 📊 Dashboard

**Visualize suas estatísticas:**
- Meta Semanal (progresso em porcentagem)
- Calorias Totais Queimadas
- Total de Atividades
- Minutos Totais de Exercício
- Distância Total Percorrida

**Gráfico de Evolução:**
- Últimos 7 dias de atividades
- Calorias queimadas por dia
- Visualização interativa

### ➕ Adicionar Atividade

1. Clique em **"Nova Atividade"** (botão verde no header)
2. Preencha:
   - **Tipo**: Corrida, Caminhada, Musculação, etc.
   - **Duração**: Em minutos
   - **Distância** (opcional): Em quilômetros
   - **Data**: Quando você fez a atividade
   - **Observações** (opcional): Notas pessoais

3. Calorias são calculadas automaticamente! 🔥
4. Clique em **"Salvar"**

### 🎯 Metas

**Criar Nova Meta:**
1. Vá para aba **"Metas"**
2. Clique em **"Adicionar Meta"**
3. Escolha:
   - **Minutos por Semana**: Ex: 150 min/semana
   - **Calorias por Semana**: Ex: 2000 kcal/semana
   - **Distância por Semana**: Ex: 20 km/semana

**Acompanhar Progresso:**
- Verde: Meta atingida! 🎉
- Amarelo: Progredindo...
- Vermelho: Precisa de mais esforço!

### 📅 Histórico

**Visualizar Atividades:**
- Lista completa de todas as atividades
- Filtrar por período
- Gráficos de evolução
- Exportar dados (CSV)

**Deletar Atividade:**
- Clique no ícone de lixeira
- Confirme a exclusão

### 💪 Sugestões de Treinos

**Explore treinos pré-cadastrados:**
- 30+ sugestões de treinos
- 6 categorias: Cardio, Força, Funcional, Flexibilidade, Esportes, Recuperação
- Filtros por categoria e nível
- Informações de duração e calorias

**Como usar:**
1. Vá para aba **"Treinos"**
2. Use os filtros:
   - **Categoria**: Escolha o tipo de treino
   - **Nível**: Iniciante, Intermediário, Avançado
3. Navegue pelos cards coloridos
4. Clique em **"Começar Treino"** para favoritar

---

## 👑 Para Administradores

### Acessar Painel Admin

1. Faça login como usuário admin
2. Vá para aba **"Admin"** (ícone de coroa)
3. Visualize todos os usuários do sistema

### Gerenciar Usuários

**Visualizar Informações:**
- Nome, email, peso
- Data de cadastro
- Função (Admin ou Usuário)

**Promover Usuário a Admin:**
1. Encontre o usuário na lista
2. Clique no ícone de **escudo** (🛡️)
3. Usuário receberá privilégios de admin

**Remover Admin:**
1. Encontre o admin na lista
2. Clique no ícone de **escudo cortado** (🛡️❌)
3. Usuário volta a ser usuário comum
4. ⚠️ Você não pode remover seu próprio admin

**Deletar Usuário:**
1. Clique no ícone de **lixeira** (🗑️)
2. Confirme a exclusão
3. ⚠️ **ATENÇÃO**: Todos os dados do usuário serão deletados permanentemente!
4. Você não pode deletar a si mesmo

**Ver Estatísticas do Usuário:**
1. Clique no ícone de **gráfico** (📊)
2. Veja:
   - Total de atividades
   - Calorias queimadas
   - Minutos de exercício
   - Distância percorrida
   - Metas criadas/ativas

### Estatísticas Gerais

No topo do painel:
- **Total de Usuários**: Número de contas registradas
- **Administradores**: Quantos admins existem

---

## 💡 Sugestões de Treinos

### Categorias Disponíveis

#### 🏃 Cardio (6 treinos)
- Caminhada Leve
- Corrida Intervalada
- Corrida Contínua
- Ciclismo Indoor
- Jump Rope (Pular Corda)
- Elíptico

#### 💪 Força (6 treinos)
- Treino de Peito e Tríceps
- Treino de Costas e Bíceps
- Treino de Pernas Completo
- Treino de Ombros
- Treino Full Body
- Core e Abdômen

#### ⚡ Funcional (5 treinos)
- HIIT Básico
- CrossFit WOD Iniciante
- Treino com Peso Corporal
- Kettlebell Circuit
- Battle Rope Training

#### 🧘 Flexibilidade (5 treinos)
- Yoga para Iniciantes
- Alongamento Dinâmico
- Pilates Mat
- Mobilidade Articular
- Yoga Flow Avançado

#### ⚽ Esportes (5 treinos)
- Futebol Recreativo
- Basquete
- Natação Livre
- Tênis
- Vôlei

#### 🌿 Recuperação (5 treinos)
- Caminhada de Recuperação
- Alongamento Estático
- Foam Rolling
- Yoga Restaurativo
- Meditação e Respiração

---

## 🔧 Configuração do Banco de Dados

### Estrutura de Tabelas

**Tabela: `usuarios`**
- Armazena dados dos usuários
- Conectada ao Supabase Auth
- Campo `is_admin` para controle de acesso

**Tabela: `atividades`**
- Registros de exercícios
- Relacionada a `usuarios` via `usuario_id`
- Delete em cascata (se usuário for deletado, atividades também)

**Tabela: `metas`**
- Objetivos definidos pelos usuários
- Pode ter múltiplas metas ativas

**Tabela: `notificacoes`**
- Sistema de lembretes (futuro)

**Tabela: `sugestoes_treinos`**
- 30 treinos pré-cadastrados
- Públicos para todos os usuários

### Políticas de Segurança (RLS)

✅ **Implementadas:**
- Usuários só veem seus próprios dados
- Admins têm acesso completo
- Sugestões de treinos são públicas
- Senhas nunca são expostas

---

## 🐛 Solução de Problemas

### "Erro ao fazer login"
**Solução:**
1. Verifique email e senha
2. Certifique-se que criou a conta
3. Aguarde 5 segundos e tente novamente

### "Erro ao carregar sugestões"
**Solução:**
1. Verifique se executou o SQL do banco
2. Confirme se as 30 sugestões foram inseridas
3. Verifique conexão com internet

### "Aba Admin não aparece"
**Solução:**
1. Verifique se executou o UPDATE para tornar-se admin
2. Faça logout e login novamente
3. Verifique no Supabase se `is_admin = true`

### "Não consigo deletar usuário"
**Solução:**
- Você não pode deletar a si mesmo
- Você não pode deletar sua própria conta de admin
- Crie outro admin primeiro se precisar se remover

### "Dados não estão salvando"
**Solução:**
1. Verifique conexão com internet
2. Verifique se fez login corretamente
3. Abra o Console do navegador (F12) e veja erros
4. Verifique se o token não expirou (faça login novamente)

### "Token expirou"
**Solução:**
- Tokens expiram após 1 hora
- Faça logout e login novamente
- Seus dados não serão perdidos

---

## 🎯 Boas Práticas

### Para Usuários

1. ✅ **Registre atividades logo após concluí-las**
2. ✅ **Defina metas realistas e progressivas**
3. ✅ **Use as sugestões de treinos para variar**
4. ✅ **Acompanhe seu progresso semanalmente**
5. ✅ **Mantenha-se hidratado!** 💧

### Para Administradores

1. ✅ **Revise usuários periodicamente**
2. ✅ **Não delete usuários sem necessidade**
3. ✅ **Promova admins com cuidado**
4. ✅ **Monitore estatísticas para engajamento**
5. ✅ **Mantenha pelo menos 2 admins ativos**

---

## 📱 Recursos PWA

### Instalar no Dispositivo

**Desktop:**
1. Clique no ícone de download na barra de endereço
2. Ou use o botão "Instalar App" no canto inferior direito

**Mobile:**
1. Abra o menu do navegador
2. Selecione "Adicionar à tela inicial"
3. O SmartFit aparecerá como um app nativo!

### Notificações

**Ativar:**
1. Clique no ícone de sino (🔔)
2. Permita notificações
3. Receba lembretes motivacionais!

**Desativar:**
1. Clique no ícone de sino novamente
2. Selecione "Não mostrar mais"

---

## 🔐 Segurança e Privacidade

### O que é armazenado:
- ✅ Nome, email (criptografado)
- ✅ Atividades físicas
- ✅ Metas pessoais
- ✅ Peso, idade, gênero (opcional)

### O que NÃO é armazenado:
- ❌ Dados de saúde sensíveis
- ❌ Localização GPS
- ❌ Contatos ou fotos

### Importante:
⚠️ **O Figma Make não deve ser usado para dados sensíveis em produção.**
Este é um protótipo. Para uso real, consulte a documentação do Supabase sobre compliance LGPD/GDPR.

---

## 📞 Suporte

### Precisa de ajuda?

1. **Verifique este guia primeiro**
2. **Leia `/SUPABASE-CONFIG.md`** para configuração
3. **Consulte os logs do navegador** (F12 → Console)
4. **Verifique o Supabase Dashboard** para erros

### Arquivos Importantes:

- `/COMO-USAR.md` - Este guia
- `/SUPABASE-CONFIG.md` - Configuração do Supabase
- `/supabase/database-setup.sql` - SQL das tabelas
- `/PWA-GUIA.md` - Guia de PWA

---

## 🎉 Aproveite o SmartFit!

Agora você tem um sistema completo de acompanhamento de atividades físicas com:

- ✅ Autenticação segura
- ✅ Banco de dados na nuvem
- ✅ Sistema administrativo
- ✅ 30+ sugestões de treinos
- ✅ Gráficos e estatísticas
- ✅ PWA instalável
- ✅ Notificações push

**Bons treinos! 💪🏃‍♂️🏋️‍♀️**

---

*SmartFit - Transformando vidas através do movimento*
