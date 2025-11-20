import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Поддержка поддиректорий через переменную окружения VITE_BASE_URL
  // По умолчанию используем относительные пути для работы с file://
  // Для поддиректории установите: VITE_BASE_URL=/app/ npm run build
  const base = process.env.VITE_BASE_URL || './';
  
  return {
    plugins: [vue()],
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };
});
