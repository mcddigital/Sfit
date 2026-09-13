#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

branch="$(git branch --show-current)"
if [ -z "$branch" ]; then
  git branch -M main
  branch="main"
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "feat: SmartFit production ready"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Código preparado localmente. Agora configure o repositório remoto:"
  echo "  git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git"
  echo "  git push -u origin $branch"
  exit 0
fi

git push -u origin "$branch"
echo
echo "Push concluído. No GitHub, abra Settings > Pages e selecione GitHub Actions."
