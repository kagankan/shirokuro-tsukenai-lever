import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { sndSprite } from './vite/sndSprite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sndSprite()],
  base: '/shirokuro-tsukenai-lever/',
});
