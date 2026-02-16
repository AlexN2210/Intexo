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

export function findAttribute(product: WooProduct, kind: AttrKind): WooAttribute | undefined {
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
  return uniqueSorted(products.flatMap((p) => getAttributeOptions(p, kind)));
}

export function findMatchingVariation(
  variations: WooVariation[],
  selected: { model?: string; color?: string },
): WooVariation | undefined {
  if (!variations?.length) return undefined;
  const selModel = normalizeValue(selected.model);
  const selColor = normalizeValue(selected.color);
  return variations.find((v) => {
    const attrs = v.attributes ?? [];
    const modelOk = selModel
      ? attrs.some((a) => kindMatchers.model.test(a.name) && normalizeValue(a.option) === selModel)
      : true;
    const colorOk = selColor
      ? attrs.some((a) => kindMatchers.color.test(a.name) && normalizeValue(a.option) === selColor)
      : true;
    return modelOk && colorOk;
  });
}

