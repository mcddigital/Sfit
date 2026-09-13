# Revisão técnica

Este documento resume os principais pontos encontrados na modernização do projeto.

## O que foi corrigido nesta versão

- Interface visual consolidada em uma única linguagem de design verde/grafite.
- Navegação reestruturada com sidebar no desktop e menu responsivo no mobile.
- Dashboard redesenhado com hierarquia visual, métricas, gráfico e registros recentes.
- Login/cadastro redesenhados para uma experiência mais limpa e profissional.
- Histórico com filtro e exportação CSV.
- Cálculo calórico passa a considerar o peso cadastrado quando disponível.
- Catálogo de treinos possui fallback local quando a API estiver indisponível.
- Credenciais públicas do Supabase migradas do código para variáveis `VITE_*`.
- Chave real removida dos arquivos versionáveis.
- Service Worker corrigido para ser registrado por URL same-origin (`/service-worker.js`).
- Manifesto PWA estático passou a ser a única fonte de configuração do PWA.
- Ícones PWA 192px e 512px adicionados.
- Metadados de produção do `index.html` corrigidos (`pt-BR`, robots, manifest, theme-color).
- `package.json` renomeado e simplificado; React passou a ser dependência normal do app.
- TypeScript, `.env.example`, `.gitignore` e workflow de CI adicionados.
- Painel administrativo alinhado ao novo design.

## Pontos da arquitetura original

### 1. Duas fontes de persistência

O backend já oferece rotas para atividades e metas, mas o frontend original salva esses registros em `localStorage`. Isso cria duas arquiteturas paralelas.

**Estado atual:** preservamos o fluxo local para evitar quebra de dados e de schema.

**Próximo passo recomendado:** criar uma camada `repository`/`service` para sincronizar local e Supabase e definir claramente qual fonte é autoritativa.

### 2. Schema de metas não representa toda a UI

A UI trabalha com período diário/semanal/mensal, enquanto o endpoint atual de metas trabalha essencialmente com tipo, alvo e `ativo`.

**Próximo passo recomendado:** adicionar um campo `periodo` no banco e atualizar as rotas antes de migrar as metas locais.

### 3. PWA anterior tinha comportamento inconsistente

O código anterior registrava um Service Worker criado via `blob:` e ainda mantinha outro arquivo em `public/service-worker.js`. Além disso, o cache de instalação referenciava arquivos de `/src`, inexistentes no build final.

**Estado atual:** há apenas um fluxo de Service Worker, baseado no arquivo público e no app shell de produção.

### 4. Notificações

`setTimeout` no frontend não é um agendador persistente: ele deixa de funcionar quando a página é encerrada. Por isso, o fluxo de “lembretes diários agendados” foi removido da UI.

**Próximo passo recomendado:** usar Web Push com backend/cron ou uma estratégia nativa de plataforma caso lembretes persistentes sejam requisito.

## Segurança

- A `SUPABASE_SERVICE_ROLE_KEY` permanece exclusivamente no ambiente da Edge Function.
- Rotas administrativas validam o token e conferem `is_admin` antes de executar ações.
- A anon key do frontend é pública por natureza, mas RLS deve continuar sendo tratada como barreira de segurança principal.
- Antes de produção, restrinja CORS às origens realmente utilizadas em vez de `*`.

## Próximas melhorias recomendadas

1. Sincronização de atividades e metas com Supabase.
2. Recuperação de senha e verificação de e-mail conforme ambiente de produção.
3. Testes unitários para cálculo de calorias e progresso de metas.
4. Testes E2E para autenticação, cadastro de atividade e permissões admin.
5. Error Boundary e estados de erro centralizados.
6. Tema escuro opcional usando as variáveis já preparadas no tema.
7. Paginação no painel administrativo para bases maiores.
