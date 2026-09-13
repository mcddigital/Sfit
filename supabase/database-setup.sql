-- ============================================
-- SMARTFIT - ESTRUTURA DE BANCO DE DADOS
-- Supabase PostgreSQL
-- ============================================

-- IMPORTANTE: Execute este SQL no Editor SQL do Supabase Dashboard
-- (Project -> SQL Editor -> New Query)

-- ==================== TABELAS ====================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  peso DECIMAL(5,2) DEFAULT 70.00,
  idade INTEGER,
  genero VARCHAR(20),
  is_admin BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Atividades
CREATE TABLE IF NOT EXISTS atividades (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  duracao_min INTEGER NOT NULL,
  distancia_km DECIMAL(6,2),
  data_atividade DATE NOT NULL,
  observacao TEXT,
  calorias DECIMAL(8,2) DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Metas
CREATE TABLE IF NOT EXISTS metas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL,
  valor_objetivo DECIMAL(8,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL,
  mensagem VARCHAR(255) NOT NULL,
  data_agendada TIMESTAMP WITH TIME ZONE NOT NULL,
  enviada BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Sugestões de Treinos
CREATE TABLE IF NOT EXISTS sugestoes_treinos (
  id BIGSERIAL PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  duracao_sugerida INTEGER, -- em minutos
  nivel VARCHAR(20) DEFAULT 'Intermediário', -- Iniciante, Intermediário, Avançado
  calorias_estimadas DECIMAL(6,2),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ÍNDICES ====================

CREATE INDEX IF NOT EXISTS idx_atividades_usuario ON atividades(usuario_id);
CREATE INDEX IF NOT EXISTS idx_atividades_data ON atividades(data_atividade);
CREATE INDEX IF NOT EXISTS idx_metas_usuario ON metas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sugestoes_categoria ON sugestoes_treinos(categoria);

-- ==================== RLS (Row Level Security) ====================

-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugestoes_treinos ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
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

-- Políticas para ATIVIDADES
CREATE POLICY "Usuários podem ver suas próprias atividades"
  ON atividades FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias atividades"
  ON atividades FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias atividades"
  ON atividades FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias atividades"
  ON atividades FOR DELETE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Admins podem ver todas as atividades"
  ON atividades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Políticas para METAS
CREATE POLICY "Usuários podem ver suas próprias metas"
  ON metas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias metas"
  ON metas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas"
  ON metas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias metas"
  ON metas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para NOTIFICAÇÕES
CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON notificacoes FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias notificações"
  ON notificacoes FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Políticas para SUGESTÕES DE TREINOS (público para leitura)
CREATE POLICY "Todos podem ver sugestões ativas"
  ON sugestoes_treinos FOR SELECT
  USING (ativo = TRUE);

CREATE POLICY "Apenas admins podem gerenciar sugestões"
  ON sugestoes_treinos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ==================== DADOS INICIAIS ====================

-- Inserir sugestões de treinos padrão
INSERT INTO sugestoes_treinos (categoria, titulo, descricao, duracao_sugerida, nivel, calorias_estimadas) VALUES
-- CARDIO
('Cardio', 'Caminhada Leve', 'Caminhada em ritmo moderado para iniciantes. Ideal para aquecimento ou recuperação ativa.', 30, 'Iniciante', 150),
('Cardio', 'Corrida Intervalada', 'Alterna entre corrida intensa e caminhada. Ótimo para queimar calorias e melhorar condicionamento.', 25, 'Intermediário', 300),
('Cardio', 'Corrida Contínua', 'Corrida em ritmo constante. Desenvolve resistência cardiovascular.', 40, 'Avançado', 450),
('Cardio', 'Ciclismo Indoor', 'Pedalada em bicicleta ergométrica com variação de intensidade.', 35, 'Intermediário', 320),
('Cardio', 'Jump Rope (Pular Corda)', 'Exercício de alta intensidade que trabalha coordenação e resistência.', 15, 'Intermediário', 200),
('Cardio', 'Elíptico', 'Baixo impacto, ideal para quem tem problemas nas articulações.', 30, 'Iniciante', 250),

-- FORÇA
('Força', 'Treino de Peito e Tríceps', 'Supino, flexões, tríceps na polia. Foco no peitoral maior e tríceps.', 50, 'Intermediário', 280),
('Força', 'Treino de Costas e Bíceps', 'Remadas, puxadas, rosca direta. Desenvolve músculos das costas e braços.', 50, 'Intermediário', 270),
('Força', 'Treino de Pernas Completo', 'Agachamento, leg press, cadeira extensora. Trabalha quadríceps, posterior e glúteos.', 60, 'Avançado', 350),
('Força', 'Treino de Ombros', 'Desenvolvimento, elevação lateral, crucifixo invertido. Foco nos deltoides.', 40, 'Intermediário', 240),
('Força', 'Treino Full Body', 'Exercícios compostos para corpo todo. Ideal para iniciantes ou treinos rápidos.', 45, 'Iniciante', 300),
('Força', 'Core e Abdômen', 'Prancha, abdominal, russian twist. Fortalece o core e estabilidade.', 20, 'Iniciante', 120),

-- FUNCIONAL
('Funcional', 'HIIT Básico', 'Treino intervalado de alta intensidade com exercícios funcionais. Burpees, mountain climbers, jumping jacks.', 20, 'Intermediário', 280),
('Funcional', 'CrossFit WOD Iniciante', 'Workout of the Day adaptado para iniciantes. Combina cardio e força.', 30, 'Iniciante', 250),
('Funcional', 'Treino com Peso Corporal', 'Flexões, agachamentos, lunges sem equipamento. Pode ser feito em casa.', 25, 'Iniciante', 180),
('Funcional', 'Kettlebell Circuit', 'Circuito com kettlebell: swing, goblet squat, turkish get-up.', 30, 'Intermediário', 320),
('Funcional', 'Battle Rope Training', 'Treino de ondulação com cordas. Excelente para cardio e força de braços.', 15, 'Avançado', 220),

-- FLEXIBILIDADE
('Flexibilidade', 'Yoga para Iniciantes', 'Posturas básicas de yoga. Melhora flexibilidade, equilíbrio e relaxamento.', 40, 'Iniciante', 120),
('Flexibilidade', 'Alongamento Dinâmico', 'Alongamentos com movimento para aquecer antes do treino.', 15, 'Iniciante', 60),
('Flexibilidade', 'Pilates Mat', 'Exercícios de pilates no solo. Fortalece core e melhora postura.', 45, 'Intermediário', 180),
('Flexibilidade', 'Mobilidade Articular', 'Exercícios para melhorar amplitude de movimento das articulações.', 20, 'Iniciante', 80),
('Flexibilidade', 'Yoga Flow Avançado', 'Sequências de yoga mais desafiadoras. Vinyasa e power yoga.', 60, 'Avançado', 200),

-- ESPORTES
('Esportes', 'Futebol Recreativo', 'Partida casual de futebol. Trabalha cardio, agilidade e coordenação.', 60, 'Intermediário', 450),
('Esportes', 'Basquete', 'Jogo de basquete. Excelente para cardio e explosão muscular.', 60, 'Intermediário', 400),
('Esportes', 'Natação Livre', 'Nado livre em ritmo moderado. Baixo impacto, trabalha corpo inteiro.', 30, 'Intermediário', 300),
('Esportes', 'Tênis', 'Partida de tênis. Desenvolve agilidade, coordenação e resistência.', 60, 'Intermediário', 380),
('Esportes', 'Vôlei', 'Jogo de vôlei. Trabalha saltos, agilidade e trabalho em equipe.', 60, 'Intermediário', 350),

-- RECUPERAÇÃO
('Recuperação', 'Caminhada de Recuperação', 'Caminhada leve para recuperação ativa após treinos intensos.', 20, 'Iniciante', 80),
('Recuperação', 'Alongamento Estático', 'Alongamentos mantidos por 30 segundos. Ideal pós-treino.', 15, 'Iniciante', 40),
('Recuperação', 'Foam Rolling', 'Auto-massagem com rolo de espuma para liberar tensão muscular.', 15, 'Iniciante', 30),
('Recuperação', 'Yoga Restaurativo', 'Yoga focado em relaxamento profundo e recuperação.', 45, 'Iniciante', 100),
('Recuperação', 'Meditação e Respiração', 'Técnicas de respiração e meditação para reduzir estresse.', 20, 'Iniciante', 20);

-- ==================== CRIAR PRIMEIRO USUÁRIO ADMIN ====================
-- IMPORTANTE: Você precisará executar este código APÓS criar o primeiro usuário via interface
-- Substitua 'EMAIL_DO_ADMIN' pelo email do usuário que deseja tornar admin

-- UPDATE usuarios SET is_admin = TRUE WHERE email = 'EMAIL_DO_ADMIN';

-- ==================== FUNÇÕES ÚTEIS ====================

-- Função para calcular total de atividades por usuário
CREATE OR REPLACE FUNCTION get_user_activity_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM atividades WHERE usuario_id = user_id);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular total de calorias por usuário
CREATE OR REPLACE FUNCTION get_user_total_calories(user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(calorias), 0) FROM atividades WHERE usuario_id = user_id);
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

-- Trigger para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== VIEWS ÚTEIS ====================

-- View de estatísticas gerais
CREATE OR REPLACE VIEW estatisticas_gerais AS
SELECT 
  COUNT(DISTINCT u.id) as total_usuarios,
  COUNT(DISTINCT a.id) as total_atividades,
  COALESCE(SUM(a.calorias), 0) as total_calorias,
  COALESCE(SUM(a.duracao_min), 0) as total_minutos,
  COALESCE(SUM(a.distancia_km), 0) as total_distancia,
  COUNT(DISTINCT m.id) as total_metas
FROM usuarios u
LEFT JOIN atividades a ON u.id = a.usuario_id
LEFT JOIN metas m ON u.id = m.usuario_id;

-- View de top usuários mais ativos
CREATE OR REPLACE VIEW top_usuarios_ativos AS
SELECT 
  u.id,
  u.nome,
  u.email,
  COUNT(a.id) as total_atividades,
  COALESCE(SUM(a.calorias), 0) as total_calorias,
  COALESCE(SUM(a.duracao_min), 0) as total_minutos
FROM usuarios u
LEFT JOIN atividades a ON u.id = a.usuario_id
GROUP BY u.id, u.nome, u.email
ORDER BY total_atividades DESC
LIMIT 10;

-- ==================== COMENTÁRIOS ====================

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema SmartFit';
COMMENT ON TABLE atividades IS 'Registro de atividades físicas dos usuários';
COMMENT ON TABLE metas IS 'Metas definidas pelos usuários';
COMMENT ON TABLE notificacoes IS 'Notificações e lembretes para usuários';
COMMENT ON TABLE sugestoes_treinos IS 'Catálogo de sugestões de treinos';

-- ==================== FINALIZADO ====================
-- Estrutura do banco de dados criada com sucesso!
-- Próximos passos:
-- 1. Criar o primeiro usuário via interface de cadastro
-- 2. Tornar esse usuário admin executando: UPDATE usuarios SET is_admin = TRUE WHERE email = 'seu@email.com';
-- 3. O admin poderá então gerenciar outros usuários
