import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const githubPagesBase = repositoryName ? `/${repositoryName}/` : '/';
const base = process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? githubPagesBase : '/');

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
    target: 'es2020',
  },
});
