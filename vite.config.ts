import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// En dev, /api est proxyfié vers la prod pour que la boutique charge les produits
const apiTarget = process.env.VITE_API_PROXY_TARGET ?? "https://www.impexo.fr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
