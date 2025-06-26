import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'src/app',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    tsconfigPaths({
      // デフォルトではルートの src/app の tsconfig.json から依存関係を解決しつつ他プロジェクトの tsconfig を読みに行く挙動になっている
      // しかし他プロジェクトの tsconfig を読みにくと無言で落ちてしまうので回避策としてルートのみに制限する
      projects: ['tsconfig.json'],
    }),
  ],
})
