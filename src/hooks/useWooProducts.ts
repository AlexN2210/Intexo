import { useQuery } from "@tanstack/react-query";
import { getProductBySlug, getProducts, getProductVariations } from "@/services/woocommerce";

export function useProductsQuery(params?: { search?: string; featured?: boolean; orderby?: string; per_page?: number }) {
  return useQuery({
    queryKey: ["woo", "products", params ?? {}],
    queryFn: async () => {
      const result = await getProducts({ ...params, per_page: params?.per_page ?? 24, orderby: params?.orderby ?? "date" });
      // Garantir qu'on retourne toujours un tableau
      return Array.isArray(result) ? result : [];
    },
    retry: 1, // Réessayer une fois en cas d'erreur
  });
}

export function useProductBySlugQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["woo", "product", "slug", slug],
    enabled: Boolean(slug),
    queryFn: () => getProductBySlug(slug!),
  });
}

export function useProductVariationsQuery(productId: number | undefined, enabled?: boolean) {
  return useQuery({
    queryKey: ["woo", "product", productId, "variations"],
    enabled: Boolean(productId) && (enabled ?? true),
    queryFn: async () => {
      const result = await getProductVariations(productId!);
      // Garantir qu'on retourne toujours un tableau
      return Array.isArray(result) ? result : [];
    },
    retry: 1,
  });
}

