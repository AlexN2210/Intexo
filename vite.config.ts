import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// En dev, /api est proxyfié vers la prod pour que la boutique charge les produits
const apiTarget = process.env.VITE_API_PROXY_TARGET ?? "https://www.impexo.fr";

// Au build sur Vercel, VERCEL_URL est défini (host complet ou sous-domaine).
// Ne pas ajouter .vercel.app si déjà présent (sinon double .vercel.app).
const vercelUrl = process.env.VERCEL_URL ?? "";
const vercelOrigin =
  !vercelUrl ? "" : vercelUrl.includes(".vercel.app") ? `https://${vercelUrl}` : `https://${vercelUrl}.vercel.app`;
const checkoutApiBase = process.env.VITE_CHECKOUT_API_BASE_URL || vercelOrigin;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_CHECKOUT_API_BASE_URL": JSON.stringify(checkoutApiBase),
  },
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
