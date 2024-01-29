import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  root: 'src/app',
  plugins: [react(), tsconfigPaths()],
})
