export const env = {
  wpBaseUrl: (import.meta.env.VITE_WP_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "",
  wcConsumerKey: (import.meta.env.VITE_WC_CONSUMER_KEY as string | undefined) ?? "",
  wcConsumerSecret: (import.meta.env.VITE_WC_CONSUMER_SECRET as string | undefined) ?? "",
  useMocks: (import.meta.env.VITE_IMPEXO_USE_MOCKS as string | undefined) === "true",
  // Utilise le proxy backend si disponible (recommandé en production)
  useProxy: (import.meta.env.VITE_USE_WC_PROXY as string | undefined) !== "false",
  // URL du proxy API (par défaut: /api/woocommerce)
  proxyUrl: (import.meta.env.VITE_WC_PROXY_URL as string | undefined) ?? "/api/woocommerce",
};

export function assertWpBaseUrl() {
  if (!env.wpBaseUrl) {
    throw new Error(
      "VITE_WP_BASE_URL est manquant. Ajoute-le dans un fichier .env (ex: https://ton-site.com).",
    );
  }
}

