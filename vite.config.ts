import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const apiTarget = process.env.VITE_API_PROXY_TARGET ?? "https://www.impexo.fr";

export default defineConfig(({ mode }) => ({
  define: {
    // Toujours chemin relatif → fonctionne sur www.impexo.fr comme sur n'importe quel domaine
    "import.meta.env.VITE_CHECKOUT_API_BASE_URL": JSON.stringify(""),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
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
