import type { WooAttribute, WooProduct, WooVariation } from "@/types/woocommerce";

type AttrKind = "model" | "color" | "material";

const kindMatchers: Record<AttrKind, RegExp> = {
  model: /(mod|mod[eè]le|iphone)/i,
  color: /(couleur|color)/i,
  material: /(mat[ée]riau|material)/i,
};

function normalizeValue(input?: string) {
  return (input ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // retire les accents
}

export function findAttribute(product: WooProduct | null | undefined, kind: AttrKind): WooAttribute | undefined {
  if (!product || typeof product !== "object") return undefined;
  const rx = kindMatchers[kind];
  return product.attributes?.find((a) => rx.test(a.name) && a.options?.length);
}

export function getAttributeOptions(product: WooProduct, kind: AttrKind): string[] {
  const attr = findAttribute(product, kind);
  return (attr?.options ?? []).filter(Boolean);
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function collectOptions(products: WooProduct[], kind: AttrKind): string[] {
  const list = Array.isArray(products) ? products.filter(Boolean) : [];
  return uniqueSorted(list.flatMap((p) => getAttributeOptions(p, kind)));
}

export function findMatchingVariation(
  variations: WooVariation[],
  selected: { model?: string; color?: string; reference?: string },
): WooVariation | undefined {
  if (!variations?.length) return undefined;
  const selModel = normalizeValue(selected.model);
  const selColor = normalizeValue(selected.color);
  const selReference = normalizeValue(selected.reference);
  
  // Filtrer les variations qui correspondent aux critères
  const matching = variations.filter((v) => {
    const attrs = v.attributes ?? [];
    const modelOk = selModel
      ? attrs.some((a) => kindMatchers.model.test(a.name) && normalizeValue(a.option) === selModel)
      : true;
    const colorOk = selColor
      ? attrs.some((a) => kindMatchers.color.test(a.name) && normalizeValue(a.option) === selColor)
      : true;
    const referenceOk = selReference
      ? attrs.some((a) => /r[eé]f[eé]rence|reference/i.test(a.name) && normalizeValue(a.option) === selReference)
      : true;
    return modelOk && colorOk && referenceOk;
  });
  
  // Si une référence est spécifiée, retourner la première correspondance
  if (selReference && matching.length > 0) {
    return matching[0];
  }
  
  // Sinon, retourner la première variation qui correspond au modèle et à la couleur
  // (même si plusieurs références existent pour cette combinaison)
  return matching[0];
}

