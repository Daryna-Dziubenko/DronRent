import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' - щоб зібраний сайт відкривався з будь-якої папки
export default defineConfig({
  plugins: [react()],
  base: './',
});
