# Publicar no GitHub e deixar o site online

O projeto já contém um workflow em `.github/workflows/pages.yml` que compila e publica o frontend automaticamente no **GitHub Pages**.

## 1. Criar o repositório

Crie um repositório vazio no GitHub, por exemplo `smartfit-app`.

No terminal, dentro desta pasta:

```bash
git init
git add .
git commit -m "feat: SmartFit production ready"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/smartfit-app.git
git push -u origin main
```

## 2. Ativar GitHub Pages

No repositório do GitHub:

1. Abra **Settings**.
2. Entre em **Pages**.
3. Em **Build and deployment > Source**, escolha **GitHub Actions**.
4. Abra a aba **Actions** e aguarde o workflow `Deploy GitHub Pages` concluir.

Ao concluir, o endereço terá este formato:

```text
https://SEU-USUARIO.github.io/smartfit-app/
```

## 3. Backend

O projeto mantém, por padrão, o `project ref`, a `anon key` pública e a Edge Function que já estavam no código original do Supabase.

Se quiser usar outro projeto Supabase, defina no ambiente de build:

```env
VITE_SUPABASE_PROJECT_ID=seu_project_id
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_SUPABASE_FUNCTION_NAME=nome_da_funcao
```

> Nunca coloque `service_role` no frontend ou no GitHub público.

## 4. Modo demonstração

A tela inicial possui **Acessar demonstração**. Esse modo não depende do Supabase e salva atividades/metas no navegador. Assim, a interface pode ser testada mesmo se o backend estiver temporariamente indisponível.

## Vercel ou Netlify

Também deixei `vercel.json` e `netlify.toml`. Basta importar o mesmo repositório nesses serviços; o build é `npm run build` e a saída é `dist`.
