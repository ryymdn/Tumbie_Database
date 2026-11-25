import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Port tetap & berbeda dengan aplikasi lain agar ortu dan kader bisa jalan bersamaan.
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
});
