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
import { Link, useParams, useSearchParams } from "react-router-dom";

// ─── helpers ─────────────────────────────────────────────────────────────────

const norm = (s?: string) =>
  (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Récupère l’option d’un attribut par son libellé ou slug.
 * WooCommerce peut renvoyer "Modèle"/"Couleur" ou "pa_modele"/"pa_couleur".
 */
const getAttr = (
  attrs: Array<{ name: string; option: string }> | undefined,
  name: string,
): string | null => {
  if (!attrs?.length) return null;
  const nameNorm = norm(name);
  const a = attrs.find((x) => {
    const key = norm(x.name).replace(/^attribute_/, "").replace(/^pa_/, "");
    return key === nameNorm || norm(x.name) === nameNorm;
  });
  return a?.option ?? null;
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
  const rawProduct = q.data ?? null;

  /**
   * N'utiliser le produit que si son slug correspond à l'URL (évite d'ajouter
   * un produit en cache d'un autre slug, qui causait "toujours le même produit").
   */
  const product =
    rawProduct && slug && norm(rawProduct.slug) === norm(slug)
      ? rawProduct
      : null;

  // Réinitialiser modèle/couleur quand on change de produit (slug ou product.id)
  useEffect(() => {
    setModel("");
    setColor("");
  }, [slug, product?.id]);

  const hasVariations = Boolean(
    product && product.type === "variable" && product.variations?.length,
  );

  // Décaller la requête variations pour ne pas burst avec product by slug (rate limit)
  const [allowVariations, setAllowVariations] = useState(false);
  useEffect(() => {
    if (!product?.id || !hasVariations) {
      setAllowVariations(false);
      return;
    }
    const t = setTimeout(() => setAllowVariations(true), 800);
    return () => clearTimeout(t);
  }, [product?.id, hasVariations]);

  const varsQ = useProductVariationsQuery(product?.id, hasVariations && allowVariations);

  /**
   * Variations filtrées (uniquement celles de ce produit) et triées
   * de façon stable par modèle puis couleur.
   */
  const variations = useMemo(() => {
    const raw = varsQ.data ?? [];
    if (!product?.id || !Array.isArray(raw)) return [];

    let filtered = raw;
    if (product.variations?.length) {
      const validIds = new Set(product.variations);
      filtered = raw.filter((v) => validIds.has(v.id));
    } else {
      filtered = raw.filter((v) => v.attributes?.length);
    }

    // Tri stable : modèle puis couleur → galerie et sélecteurs toujours dans le même ordre
    return [...filtered].sort((a, b) => {
      const modelA = getAttr(a.attributes, "Modèle") ?? "";
      const modelB = getAttr(b.attributes, "Modèle") ?? "";
      const colorA = getAttr(a.attributes, "Couleur") ?? "";
      const colorB = getAttr(b.attributes, "Couleur") ?? "";
      return modelA.localeCompare(modelB) || colorA.localeCompare(colorB);
    });
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

  /**
   * Map : modèle normalisé → couleurs réellement disponibles.
   * Construite depuis les variations réelles — garantit qu'on ne propose
   * jamais une combinaison modèle+couleur inexistante dans WooCommerce.
   */
  const colorsByModel = useMemo(() => {
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

    // Tri alphabétique stable pour chaque liste de couleurs
    map.forEach((list, k) =>
      map.set(k, [...list].sort((a, b) => a.localeCompare(b))),
    );

    return map;
  }, [hasVariations, variations]);

  const currentModel = model || models[0] || "";

  const allowedColors = useMemo(
    () =>
      hasVariations
        ? (colorsByModel.get(norm(currentModel)) ?? [])
        : colors,
    [hasVariations, colorsByModel, currentModel, colors],
  );

  // ── sélection courante ───────────────────────────────────────────────────

  const selected = useMemo(
    () => ({ model: currentModel, color: color || undefined }),
    [currentModel, color],
  );

  const preferredModel = searchParams.get("model") ?? "";
  const preferredColor = searchParams.get("color") ?? "";

  // Initialisation depuis les query params ou valeurs par défaut
  useEffect(() => {
    if (!product) return;

    const initModel =
      (preferredModel && models.includes(preferredModel) ? preferredModel : "") ||
      model ||
      models[0] ||
      "";
    if (initModel && initModel !== model) setModel(initModel);

    const allowed = hasVariations
      ? (colorsByModel.get(norm(initModel)) ?? [])
      : colors;
    const preferred = preferredColor
      ? allowed.find((c) => norm(c) === norm(preferredColor))
      : undefined;
    const initColor = preferred || color || allowed[0] || colors[0] || "";
    if (initColor && initColor !== color) setColor(initColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, models.join("|"), colors.join("|"), preferredModel, preferredColor]);

  // Quand le modèle change, reset la couleur si elle n'est plus disponible
  useEffect(() => {
    if (!hasVariations || !currentModel) return;
    const allowed = colorsByModel.get(norm(currentModel)) ?? [];
    if (!allowed.length) return;
    if (!color || !allowed.some((c) => norm(c) === norm(color))) {
      setColor(allowed[0]);
    }
  }, [hasVariations, currentModel, colorsByModel, color]);

  // ── variation correspondante ─────────────────────────────────────────────

  /**
   * Recherche exacte modèle + couleur après normalisation.
   * S'il y a plusieurs résultats (cas rare), on prend le premier.
   */
  const matchedVariation = useMemo(() => {
    if (!hasVariations || !selected.model || !selected.color) return undefined;
    return variations.find((v) => {
      const m = getAttr(v.attributes, "Modèle");
      const c = getAttr(v.attributes, "Couleur");
      return (
        m && norm(m) === norm(selected.model) &&
        c && norm(c) === norm(selected.color)
      );
    });
  }, [hasVariations, variations, selected]);

  // Fallback : première variation du même modèle (pour l'image héro si couleur pas encore choisie)
  const fallbackVariation = useMemo(() => {
    if (!hasVariations || !selected.model) return undefined;
    return variations.find(
      (v) => norm(getAttr(v.attributes, "Modèle") ?? "") === norm(selected.model),
    );
  }, [hasVariations, variations, selected.model]);

  // ── matériau ─────────────────────────────────────────────────────────────

  const selectedMaterial = useMemo((): string | undefined => {
    const fromAttrs = (attrs: Array<{ name: string; option: string }> | undefined) =>
      attrs?.find((a) => /mat[ée]riau|material/i.test(a.name))?.option ?? null;

    // 1. Attributs de la variation sélectionnée (importés via CSV)
    if (matchedVariation) {
      const m = fromAttrs(matchedVariation.attributes);
      if (m) return m;
      const meta = matchedVariation.meta_data?.find((m) =>
        /mat[ée]riau|material/i.test(m.key),
      );
      if (meta?.value) return String(meta.value);
    }
    // 2. Variation fallback (même modèle)
    if (fallbackVariation) {
      const m = fromAttrs(fallbackVariation.attributes);
      if (m) return m;
    }
    // 3. Première variation disponible
    for (const v of variations) {
      const m = fromAttrs(v.attributes);
      if (m) return m;
    }
    return undefined;
  }, [matchedVariation, fallbackVariation, variations]);

  // ── image héro ───────────────────────────────────────────────────────────

  const heroImage = useMemo(
    () =>
      matchedVariation?.image?.src ??
      fallbackVariation?.image?.src ??
      product?.images?.[0]?.src ??
      undefined,
    [matchedVariation, fallbackVariation, product?.images],
  );

  // ── galerie ──────────────────────────────────────────────────────────────

  /**
   * Galerie filtrée STRICTEMENT par modèle sélectionné.
   *
   * Chaque entrée correspond à une variation précise (modèle + couleur).
   * Le clic sur une miniature change uniquement la couleur — le modèle
   * reste celui du sélecteur du dessus.
   *
   * isActive est vrai pour la variation exactement sélectionnée (modèle + couleur).
   */
  const gallery = useMemo(() => {
    if (!product) return [];

    if (!hasVariations) {
      return (product.images ?? []).map((im, idx) => ({
        src: im.src,
        alt: im.alt || `${product.name} — ${idx + 1}`,
        variationId: 0,
        color: null as string | null,
        isActive: idx === 0,
      }));
    }

    // Filtre strict : on ne garde que les variations dont le Modèle
    // correspond EXACTEMENT au modèle actuellement sélectionné
    return variations
      .filter((v) => {
        const m = getAttr(v.attributes, "Modèle");
        return m && norm(m) === norm(selected.model) && Boolean(v.image?.src);
      })
      .map((v) => ({
        src: v.image!.src,
        alt: [product.name, selected.model, getAttr(v.attributes, "Couleur")]
          .filter(Boolean)
          .join(" — "),
        variationId: v.id,
        color: getAttr(v.attributes, "Couleur"),
        // isActive : cette miniature correspond-elle exactement à la sélection courante ?
        isActive: matchedVariation?.id === v.id,
      }));
  }, [product, hasVariations, variations, selected.model, matchedVariation]);

  // ── prix & panier ────────────────────────────────────────────────────────

  const price = parsePrice(
    matchedVariation?.price ??
      fallbackVariation?.price ??
      product?.price ??
      product?.regular_price,
  );

  const canAdd =
    Boolean(product) && qty > 0 && (!hasVariations || Boolean(matchedVariation));

  const mentionsMagSafe = useMemo(() => {
    const blob = `${product?.name ?? ""} ${product?.short_description ?? ""} ${product?.description ?? ""}`;
    return /magsafe/i.test(blob);
  }, [product?.name, product?.short_description, product?.description]);

  const onAdd = () => {
    if (!product) return;
    if (hasVariations && !matchedVariation) {
      toast({
        title: "Sélection incomplète",
        description: "Choisis un modèle et une couleur disponibles.",
      });
      return;
    }
    addItem({
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
              Ce produit n’existe pas ou le lien est incorrect. Vérifie l’URL ou retourne à la boutique.
            </div>
            <div className="mt-6">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/boutique">Voir la boutique</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">

            {/* ── Colonne gauche : image principale + galerie ── */}
            <FadeIn>
              {/* Image héro */}
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

              {/*
                Galerie des couleurs — filtrée par modèle sélectionné.
                Chaque miniature = une couleur disponible pour ce modèle.
                Clic → change la couleur (le modèle reste fixe).
              */}
              {gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {gallery.map((g) => (
                    <button
                      key={g.variationId}
                      type="button"
                      onClick={() => {
                        if (g.color) setColor(g.color);
                      }}
                      aria-label={g.color ? `Couleur ${g.color}` : g.alt}
                      aria-pressed={g.isActive}
                      className={[
                        "group flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-all duration-200",
                        g.isActive
                          ? "border-foreground/60 bg-muted/50 shadow-sm"
                          : "border-border opacity-55 hover:opacity-100 hover:border-foreground/25 hover:bg-muted/20",
                      ].join(" ")}
                    >
                      <img
                        src={g.src}
                        alt={g.alt}
                        loading="lazy"
                        decoding="async"
                        className="impexo-cutout aspect-square w-full object-contain transition duration-300 ease-out group-hover:scale-[1.05]"
                      />
                      {g.color && (
                        <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground">
                          {g.color}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Cliquer pour agrandir</span>
                <span className="tabular-nums">{formatEUR(price)}</span>
              </div>
            </FadeIn>

            {/* ── Colonne droite : infos produit + sélecteurs ── */}
            <FadeIn delay={0.05}>
              <div className="space-y-6">
                {/* En-tête */}
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

                {/* Sélecteurs */}
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Sélecteur modèle */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Modèle d'iPhone
                    </div>
                    <Select
                      value={model || models[0]}
                      onValueChange={(next) => {
                        setModel(next);
                        if (!hasVariations) return;
                        const allowed = colorsByModel.get(norm(next)) ?? [];
                        // Conserver la couleur actuelle si elle existe pour ce modèle
                        const kept = allowed.find((c) => norm(c) === norm(color));
                        setColor(kept ?? allowed[0] ?? "");
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

                  {/* Sélecteur couleur — uniquement les couleurs du modèle sélectionné */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Couleur
                    </div>
                    {allowedColors.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Couleurs non renseignées
                      </span>
                    ) : (
                      <Select value={color} onValueChange={setColor}>
                        <SelectTrigger className="h-11 rounded-full">
                          <SelectValue placeholder="Choisir une couleur" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedColors.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Quantité + bouton panier */}
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

                {/* Points forts */}
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

                {/* Fiche technique */}
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

                  {/* Boutons modèles cliquables (changent le modèle sélectionné) */}
                  {models.length > 0 && (
                    <div className="mt-5">
                      <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground">
                        COMPATIBILITÉS
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {models.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setModel(m);
                              if (hasVariations) {
                                const allowed = colorsByModel.get(norm(m)) ?? [];
                                const kept = allowed.find((c) => norm(c) === norm(color));
                                setColor(kept ?? allowed[0] ?? "");
                              }
                            }}
                            className={[
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                              norm(m) === norm(selected.model)
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background/40 text-foreground/80 hover:border-foreground/40",
                            ].join(" ")}
                          >
                            {m}
                          </button>
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

                  {/* Mentions légales */}
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <div>
                      Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max.
                    </div>
                    <div>
                      La marque Apple® est mentionnée uniquement à titre de compatibilité.
                      IMPEXO est une marque indépendante.
                    </div>
                    {mentionsMagSafe && (
                      <div>
                        MagSafe est une marque d'Apple Inc. La mention « compatible MagSafe »
                        décrit une compatibilité avec des accessoires MagSafe, sans affiliation
                        ni approbation.
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
