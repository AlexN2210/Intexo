import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// En dev, /api est proxyfié vers la prod pour que la boutique charge les produits
const apiTarget = process.env.VITE_API_PROXY_TARGET ?? "https://www.impexo.fr";

// Au build sur Vercel, VERCEL_URL est défini (ex: "impexo-xxx") → checkout appelle cette URL
// pour éviter 404 quand le visiteur passe par www.impexo.fr (domaine custom) et que
// les routes /api ne sont pas servies par le même hôte.
const checkoutApiBase =
  process.env.VITE_CHECKOUT_API_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}.vercel.app` : "");

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
