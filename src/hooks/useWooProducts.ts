import { useQuery } from "@tanstack/react-query";
import { getProductBySlug, getProducts, getProductVariations } from "@/services/woocommerce";

export function useProductsQuery(
  params?: { search?: string; featured?: boolean; orderby?: string; per_page?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["woo", "products", params ?? {}],
    queryFn: async () => {
      const result = await getProducts({ ...params, per_page: params?.per_page ?? 24, orderby: params?.orderby ?? "date" });
      return Array.isArray(result) ? result : [];
    },
    retry: 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: options?.enabled !== false,
  });
}

export function useProductBySlugQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["woo", "product", "slug", slug],
    enabled: Boolean(slug),
    queryFn: () => getProductBySlug(slug!),
    retry: 0,
    staleTime: 1000 * 60 * 10, // 10 min
    gcTime: 1000 * 60 * 30, // 30 min
  });
}

export function useProductVariationsQuery(productId: number | undefined, enabled?: boolean) {
  return useQuery({
    queryKey: ["woo", "product", productId, "variations"],
    enabled: Boolean(productId) && (enabled ?? true),
    queryFn: async () => {
      const result = await getProductVariations(productId!);
      return Array.isArray(result) ? result : [];
    },
    retry: 0,
    staleTime: 1000 * 60 * 15, // 15 min
    gcTime: 1000 * 60 * 45, // 45 min
  });
}

