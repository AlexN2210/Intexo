export const env = {
  wpBaseUrl: (import.meta.env.VITE_WP_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "",
  wcConsumerKey: (import.meta.env.VITE_WC_CONSUMER_KEY as string | undefined) ?? "",
  wcConsumerSecret: (import.meta.env.VITE_WC_CONSUMER_SECRET as string | undefined) ?? "",
  useMocks: (import.meta.env.VITE_IMPEXO_USE_MOCKS as string | undefined) === "true",
};

export function assertWpBaseUrl() {
  if (!env.wpBaseUrl) {
    throw new Error(
      "VITE_WP_BASE_URL est manquant. Ajoute-le dans un fichier .env (ex: https://ton-site.com).",
    );
  }
}

