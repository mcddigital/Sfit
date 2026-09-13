# SmartFit · Activity Tracker

PWA responsivo para registrar atividades físicas, acompanhar metas, consultar histórico e explorar sugestões de treino. A interface foi redesenhada com foco em clareza, consistência visual e uso em desktop e mobile.

> Projeto independente para fins de estudo/portfólio. Não possui vínculo oficial com a rede de academias Smart Fit.

## Principais recursos

- Dashboard com resumo semanal, indicadores e gráfico de minutos ativos.
- Registro de atividades com estimativa de calorias por MET e peso do usuário.
- Metas diárias, semanais e mensais de tempo, distância e passos.
- Histórico com filtros e exportação em CSV.
- Biblioteca de sugestões de treino com filtros por categoria e nível.
- Autenticação e painel administrativo integrados ao Supabase.
- PWA instalável, service worker e suporte básico offline.
- Layout responsivo com sidebar no desktop e navegação compacta no mobile.

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Radix UI / shadcn-style components
- Recharts
- Supabase Auth + PostgreSQL + Edge Functions
- Lucide Icons

## Executar localmente

Requisito para desenvolvimento: Node.js 20+. O projeto já traz a configuração pública do Supabase original como fallback; `.env.local` é opcional e serve para apontar para outro projeto.

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd smartfit-activity-tracker
npm install
npm run dev
```

Abra `http://localhost:5173`. Se quiser trocar o backend, copie `.env.example` para `.env.local` e preencha as variáveis `VITE_*`.

## Banco de dados e backend

Os scripts SQL ficam em `supabase/`. Para uma configuração nova, comece por:

1. `supabase/database-setup.sql`
2. `supabase/fix-rls-policies.sql` se precisar revisar as políticas de acesso
3. publique a Edge Function em `supabase/functions/make-server-d1a79e63/`
4. configure no ambiente da função: `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`

As atividades e metas da interface atual são mantidas localmente por usuário para resposta rápida; autenticação, catálogo remoto e funções administrativas utilizam o Supabase.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run typecheck  # checagem TypeScript
npm run build      # build de produção
npm run preview    # prévia do build
```

## Estrutura principal

```text
src/
  app/
    components/       # telas e componentes de UI
    contexts/         # autenticação
    lib/              # configuração do app
    utils/            # cálculo de calorias e PWA
  styles/             # tema global e Tailwind
supabase/
  functions/make-server-d1a79e63/   # Edge Function
  *.sql               # setup e manutenção do banco
public/
  manifest.json
  service-worker.js
```

## Publicação no GitHub e site online

O repositório já inclui um deploy automático em `.github/workflows/pages.yml`. Depois de enviar o projeto para a branch `main`, abra **Settings > Pages** no GitHub e selecione **GitHub Actions** como fonte. O workflow fará `typecheck`, `build` e publicará a pasta `dist`.

```bash
git init
git add .
git commit -m "feat: SmartFit production ready"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

O endereço padrão será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`. Consulte `DEPLOY-GITHUB.md` para o passo a passo. O projeto também inclui `vercel.json` e `netlify.toml`.

A tela de autenticação possui **Acessar demonstração**, permitindo testar o app online mesmo se o backend estiver indisponível; nesse modo os dados ficam somente no navegador.

## Observações de segurança

A `VITE_SUPABASE_ANON_KEY` é uma chave pública do cliente e deve trabalhar em conjunto com políticas RLS corretas. A `SUPABASE_SERVICE_ROLE_KEY` nunca deve aparecer no frontend ou no repositório.
