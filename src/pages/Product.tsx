import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProductBySlugQuery, useProductVariationsQuery } from "@/hooks/useWooProducts";
import { useCartStore } from "@/store/cartStore";
import { formatEUR, parsePrice } from "@/utils/money";
import { getAttributeOptions } from "@/utils/productAttributes";
import { Minus, Plus, Shield, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Normalise une chaîne pour les comparaisons insensibles à la casse / aux accents */
const norm = (s?: string) =>
  (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Récupère la valeur d'un attribut par nom (insensible à la casse) */
const getAttr = (
  attrs: Array<{ name: string; option: string }> | undefined,
  name: string,
): string | null => {
  const attr = attrs?.find((a) => norm(a.name) === norm(name));
  return attr?.option ?? null;
};

// ─── composant ───────────────────────────────────────────────────────────────

export default function Product() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [qty, setQty] = useState(1);
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");

  // ── données produit ──────────────────────────────────────────────────────

  const q = useProductBySlugQuery(slug);
  const product = q.data ?? null;

  const hasVariations = Boolean(
    product && product.type === "variable" && product.variations?.length,
  );

  const varsQ = useProductVariationsQuery(product?.id, hasVariations);

  /** Variations filtrées : uniquement celles qui appartiennent à ce produit */
  const variations = useMemo(() => {
    const raw = varsQ.data ?? [];
    if (!product?.id || !Array.isArray(raw)) return [];

    // Si le produit expose sa liste d'IDs de variations, on s'en sert directement
    if (product.variations?.length) {
      const validIds = new Set(product.variations);
      return raw.filter((v) => validIds.has(v.id));
    }

    // Sinon, fallback : garder les variations qui ont au moins un attribut
    return raw.filter((v) => v.attributes && v.attributes.length > 0);
  }, [varsQ.data, product?.id, product?.variations]);

  // ── options de sélection ─────────────────────────────────────────────────

  const models = useMemo(
    () => (product ? getAttributeOptions(product, "model") : []),
    [product],
  );
  const colors = useMemo(
    () => (product ? getAttributeOptions(product, "color") : []),
    [product],
  );

  /** Map modèle normalisé → couleurs disponibles (depuis les variations réelles) */
  const availableColorsByModel = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!hasVariations) return map;

    variations.forEach((v) => {
      const m = getAttr(v.attributes, "Modèle");
      const c = getAttr(v.attributes, "Couleur");
      if (!m || !c) return;

      const k = norm(m);
      const list = map.get(k) ?? [];
      if (!list.some((x) => norm(x) === norm(c))) list.push(c);
      map.set(k, list);
    });

    // Tri stable
    map.forEach((list, k) => map.set(k, [...list].sort((a, b) => a.localeCompare(b))));

    return map;
  }, [hasVariations, variations]);

  const allowedColors = useMemo(() => {
    if (!hasVariations) return colors;
    const m = model || models[0];
    return (m ? availableColorsByModel.get(norm(m)) : undefined) ?? [];
  }, [hasVariations, colors, availableColorsByModel, model, models]);

  // ── sélection courante ───────────────────────────────────────────────────

  const selected = useMemo(
    () => ({ model: model || models[0], color: color || undefined }),
    [model, color, models],
  );

  // Initialisation depuis les query params (?model=&color=)
  const preferredModel = searchParams.get("model") ?? "";
  const preferredColor = searchParams.get("color") ?? "";

  useEffect(() => {
    if (!product) return;

    const initialModel =
      (preferredModel && models.includes(preferredModel) ? preferredModel : "") ||
      model ||
      models[0] ||
      "";
    if (initialModel && initialModel !== model) setModel(initialModel);

    const allowed = hasVariations
      ? (availableColorsByModel.get(norm(initialModel)) ?? [])
      : colors;
    const preferred = preferredColor
      ? allowed.find((c) => norm(c) === norm(preferredColor))
      : "";
    const initialColor = preferred || color || allowed[0] || colors[0] || "";
    if (initialColor && initialColor !== color) setColor(initialColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, models.join("|"), colors.join("|"), preferredModel, preferredColor]);

  // Si la couleur courante n'est plus disponible pour le modèle sélectionné → reset
  useEffect(() => {
    if (!hasVariations) return;
    const m = model || models[0];
    if (!m) return;
    const allowed = availableColorsByModel.get(norm(m)) ?? [];
    if (!allowed.length) return;
    if (!color || !allowed.some((c) => norm(c) === norm(color))) {
      setColor(allowed[0]);
    }
  }, [hasVariations, model, models, availableColorsByModel, color]);

  // ── variation correspondante ─────────────────────────────────────────────

  const matchedVariation = useMemo(() => {
    if (!hasVariations || !selected.model || !selected.color) return undefined;

    const matches = variations.filter((v) => {
      const m = getAttr(v.attributes, "Modèle");
      const c = getAttr(v.attributes, "Couleur");
      return (
        m && norm(m) === norm(selected.model) &&
        c && norm(c) === norm(selected.color)
      );
    });

    if (matches.length > 1) {
      // Plusieurs variations pour ce modèle+couleur (ex: deux designs différents)
      // On prend la première — un sélecteur de "série" pourrait être ajouté ici si nécessaire
      console.warn(
        `[Product ${product?.id}] ${matches.length} variations pour ${selected.model} + ${selected.color} → première sélectionnée`,
      );
    }

    return matches[0];
  }, [hasVariations, variations, selected, product?.id]);

  const fallbackVariationForModel = useMemo(() => {
    if (!hasVariations) return undefined;
    const mk = norm(selected.model);
    return variations.find((v) =>
      v.attributes?.some(
        (a) => /mod|mod[eè]le|iphone/i.test(a.name) && norm(a.option) === mk,
      ),
    );
  }, [hasVariations, variations, selected.model]);

  // ── matériau ─────────────────────────────────────────────────────────────

  /**
   * Cherche le matériau dans les attributs d'une variation.
   * Avec le CSV importé, WooCommerce expose Attribut 3 "Matériau" directement
   * dans v.attributes — c'est la source principale.
   */
  const selectedMaterial = useMemo((): string | undefined => {
    const findInAttrs = (
      attrs: Array<{ name: string; option: string }> | undefined,
    ): string | null => {
      if (!attrs) return null;
      const attr = attrs.find((a) => /mat[ée]riau|material/i.test(a.name));
      return attr?.option ?? null;
    };

    // 1. Variation sélectionnée (source principale après import CSV)
    if (matchedVariation) {
      const m = findInAttrs(matchedVariation.attributes);
      if (m) return m;

      // 2. Meta fields (au cas où WooCommerce stocke le matériau en meta)
      const meta = matchedVariation.meta_data?.find((m) =>
        /mat[ée]riau|material/i.test(m.key),
      );
      if (meta?.value) return String(meta.value);
    }

    // 3. Variation fallback (même modèle, couleur différente)
    if (fallbackVariationForModel) {
      const m = findInAttrs(fallbackVariationForModel.attributes);
      if (m) return m;
    }

    // 4. Première variation disponible (dernier recours)
    for (const v of variations) {
      const m = findInAttrs(v.attributes);
      if (m) return m;
    }

    return undefined;
  }, [matchedVariation, fallbackVariationForModel, variations]);

  // ── image héro ───────────────────────────────────────────────────────────

  const heroImage = useMemo(() => {
    // Image de la variation sélectionnée (priorité absolue)
    if (matchedVariation?.image?.src) return matchedVariation.image.src;
    // Fallback : image d'une variation du même modèle
    if (fallbackVariationForModel?.image?.src) return fallbackVariationForModel.image.src;
    // Fallback : première image du produit parent
    return product?.images?.[0]?.src ?? undefined;
  }, [matchedVariation, fallbackVariationForModel, product?.images]);

  // ── galerie ──────────────────────────────────────────────────────────────

  const gallery = useMemo(() => {
    if (!product) return [];

    if (hasVariations) {
      // Une entrée par variation (une image par variation = comportement attendu)
      const seen = new Set<number>();
      return variations
        .filter((v) => {
          if (!v.image?.src || seen.has(v.id)) return false;
          seen.add(v.id);
          return true;
        })
        .map((v) => {
          const m = getAttr(v.attributes, "Modèle");
          const c = getAttr(v.attributes, "Couleur");
          return {
            src: v.image!.src,
            alt: [product.name, m, c].filter(Boolean).join(" — "),
            variationId: v.id,
            isActive: matchedVariation?.id === v.id,
          };
        });
    }

    // Produit simple
    return (product.images ?? []).map((im, idx) => ({
      src: im.src,
      alt: im.alt || `${product.name} — ${idx + 1}`,
      variationId: 0,
      isActive: idx === 0,
    }));
  }, [product, hasVariations, variations, matchedVariation]);

  // ── prix & panier ────────────────────────────────────────────────────────

  const price = parsePrice(
    matchedVariation?.price ??
      fallbackVariationForModel?.price ??
      product?.price ??
      product?.regular_price,
  );

  const canAdd =
    Boolean(product) && qty > 0 && (!hasVariations || Boolean(matchedVariation));

  const mentionsMagSafe = useMemo(() => {
    const blob = `${product?.name ?? ""} ${product?.short_description ?? ""} ${product?.description ?? ""}`;
    return /magsafe/i.test(blob);
  }, [product?.name, product?.short_description, product?.description]);

  const onAdd = async () => {
    if (!product) return;
    if (hasVariations && !matchedVariation) {
      toast({
        title: "Sélection incomplète",
        description: "Choisis un modèle et une couleur disponibles.",
      });
      return;
    }
    try {
      await addItem({
        productId: product.id,
        variationId: matchedVariation?.id,
        name: product.name,
        slug: product.slug,
        imageSrc: matchedVariation?.image?.src ?? heroImage,
        price: matchedVariation?.price ?? product.price ?? product.regular_price,
        options: {
          model: selected.model,
          color: selected.color,
          material: selectedMaterial,
        },
        quantity: qty,
      });
      toast({
        title: "Ajouté au panier",
        description: `${product.name}${selected.model ? ` — ${selected.model}` : ""}${selected.color ? ` — ${selected.color}` : ""}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Impossible d'ajouter au panier",
        variant: "destructive",
      });
    }
  };

  // ── rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-background">
      <Container className="py-10 sm:py-12">
        {q.isLoading ? (
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        ) : !product ? (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <div className="text-sm font-medium tracking-tight">Produit introuvable.</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Vérifie le lien ou retourne à la boutique.
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            {/* ── Image + galerie ── */}
            <FadeIn>
              <div className="overflow-hidden">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="group relative block w-full">
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.05),transparent_60%)] opacity-0 transition group-hover:opacity-100" />
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt={product.images?.[0]?.alt || product.name}
                          loading="eager"
                          decoding="async"
                          className="impexo-product-shadow impexo-image-fade impexo-cutout aspect-square w-full object-contain p-6 transition duration-700 ease-out group-hover:scale-[1.01] sm:p-8"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-muted" />
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0">
                    {heroImage && (
                      <div className="bg-black">
                        <img
                          src={heroImage}
                          alt={product.name}
                          className="h-[80vh] w-full object-contain"
                        />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {gallery.slice(0, 12).map((g) => {
                    const variation = variations.find((v) => v.id === g.variationId);
                    return (
                      <button
                        key={`${g.src}-${g.variationId}`}
                        type="button"
                        onClick={() => {
                          if (!variation) return;
                          const m = getAttr(variation.attributes, "Modèle");
                          const c = getAttr(variation.attributes, "Couleur");
                          if (m) setModel(m);
                          if (c) setColor(c);
                        }}
                        className={[
                          "group overflow-hidden transition",
                          g.isActive
                            ? "opacity-100 ring-2 ring-foreground/40"
                            : "opacity-70 hover:opacity-100",
                        ].join(" ")}
                        aria-label={`Voir ${g.alt}`}
                      >
                        <img
                          src={g.src}
                          alt={g.alt}
                          loading="lazy"
                          decoding="async"
                          className="impexo-cutout aspect-square w-full object-contain p-2 transition duration-300 ease-out group-hover:scale-[1.02]"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Zoom élégant (cliquer)</span>
                <span className="tabular-nums">{formatEUR(price)}</span>
              </div>
            </FadeIn>

            {/* ── Infos + sélecteurs ── */}
            <FadeIn delay={0.05}>
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">
                    IMPEXO
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {product.name}
                  </h1>
                  <div className="mt-3 text-lg font-medium tabular-nums">
                    {formatEUR(price)}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sélecteur modèle */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Modèle d'iPhone
                    </div>
                    <Select
                      value={model}
                      onValueChange={(next) => {
                        setModel(next);
                        if (!hasVariations) return;
                        const allowed = availableColorsByModel.get(norm(next)) ?? [];
                        if (color) {
                          const kept = allowed.find((c) => norm(c) === norm(color));
                          if (kept) {
                            if (kept !== color) setColor(kept);
                            return;
                          }
                        }
                        if (allowed.length) setColor(allowed[0]);
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-full">
                        <SelectValue placeholder="Choisir un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sélecteur couleur */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Couleur</div>
                    <div className="flex flex-wrap gap-2">
                      {allowedColors.map((c) => {
                        const active = color === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={[
                              "rounded-full border px-3 py-2 text-xs transition",
                              active
                                ? "bg-foreground text-background"
                                : "bg-background hover:bg-muted/60",
                            ].join(" ")}
                            disabled={allowedColors.length <= 1}
                          >
                            {c}
                          </button>
                        );
                      })}
                      {allowedColors.length === 1 && (
                        <span className="text-xs text-muted-foreground">
                          1 couleur disponible pour ce modèle
                        </span>
                      )}
                      {allowedColors.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Couleurs non renseignées
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantité + panier */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-muted-foreground">Quantité</div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-10 text-center text-sm font-medium tabular-nums">
                        {qty}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setQty((q) => q + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="mt-4 h-12 w-full rounded-full text-sm"
                    disabled={!canAdd}
                    onClick={onAdd}
                  >
                    Ajouter au panier
                  </Button>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Paiement & livraison à brancher côté WooCommerce / checkout.
                  </div>
                </div>

                {/* Badges */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 p-4">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium tracking-tight">Protection fine</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Ajustement précis. Confort au quotidien.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium tracking-tight">Finitions premium</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Reflets, textures, minimalisme.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fiche produit */}
                <div className="p-6">
                  <div className="text-xs font-medium tracking-[0.22em] text-muted-foreground">
                    DÉTAILS
                  </div>
                  <div className="mt-2 text-sm font-medium tracking-tight">Fiche produit</div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="p-4">
                      <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">
                        MODÈLE
                      </div>
                      <div className="mt-2 text-sm font-medium tracking-tight">
                        {selected.model || "—"}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">
                        COULEUR
                      </div>
                      <div className="mt-2 text-sm font-medium tracking-tight">
                        {selected.color || "—"}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">
                        MATÉRIAU
                      </div>
                      <div className="mt-2 text-sm font-medium tracking-tight">
                        {selectedMaterial || "—"}
                      </div>
                    </div>
                  </div>

                  {models.length > 0 && (
                    <div className="mt-5">
                      <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground">
                        COMPATIBILITÉS DISPONIBLES
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {models.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center rounded-full border bg-background/40 px-3 py-1 text-xs font-medium text-foreground/90"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.short_description && (
                    <div
                      className="prose prose-sm mt-4 max-w-none text-muted-foreground prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.short_description }}
                    />
                  )}
                  {product.description && (
                    <div
                      className="prose prose-sm mt-4 max-w-none text-muted-foreground prose-p:leading-relaxed prose-ul:my-3 prose-li:my-1"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  )}

                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <div>
                      Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max.
                    </div>
                    <div>
                      La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO
                      est une marque indépendante.
                    </div>
                    {mentionsMagSafe && (
                      <div>
                        MagSafe est une marque d'Apple Inc. La mention « compatible MagSafe »
                        décrit une compatibilité avec des accessoires MagSafe, sans affiliation ni
                        approbation.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </Container>
    </div>
  );
}