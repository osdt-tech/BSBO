import { defineConfig, loadEnv, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default (env: ConfigEnv) => {
  const { mode } = env
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    base: `/ccm/${process.env.VITE_KEY}/`,
    plugins: [vue()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,     // 🧹 löscht alte Dateien vor dem Build
      sourcemap: false,
    },
  })
}
