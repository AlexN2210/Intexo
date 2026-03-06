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
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [userPickedImage, setUserPickedImage] = useState(false);

  // ── données produit ──────────────────────────────────────────────────────

  const q = useProductBySlugQuery(slug);
  const rawProduct = q.data ?? null;
  const product = rawProduct && slug ? rawProduct : null;

  useEffect(() => {
    setModel("");
    setColor("");
    setUserPickedImage(false);
    setSelectedImage(undefined);
  }, [slug, product?.id]);

  const hasVariations = Boolean(
    product && product.type === "variable" && product.variations?.length,
  );

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

  // Map modèle → couleur(s) disponibles
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
    return map;
  }, [hasVariations, variations]);

  // Détecter si chaque modèle n'a qu'une seule couleur (nouvelle structure)
  const isOneColorPerModel = useMemo(() => {
    if (!hasVariations || colorsByModel.size === 0) return false;
    return Array.from(colorsByModel.values()).every((colors) => colors.length === 1);
  }, [hasVariations, colorsByModel]);

  const currentModel = model || models[0] || "";

  const allowedColors = useMemo(
    () => colorsByModel.get(norm(currentModel)) ?? [],
    [colorsByModel, currentModel],
  );

  // ── sélection courante ───────────────────────────────────────────────────

  const selected = useMemo(
    () => ({ model: currentModel, color: color || undefined }),
    [currentModel, color],
  );

  const preferredModel = searchParams.get("model") ?? "";
  const preferredColor = searchParams.get("color") ?? "";

  // Initialisation : modèle + couleur automatique
  useEffect(() => {
    if (!product) return;

    const initModel =
      (preferredModel && models.includes(preferredModel) ? preferredModel : "") ||
      model ||
      models[0] ||
      "";
    if (initModel && initModel !== model) setModel(initModel);

    const allowed = colorsByModel.get(norm(initModel)) ?? [];
    const preferred = preferredColor
      ? allowed.find((c) => norm(c) === norm(preferredColor))
      : undefined;
    const initColor = preferred || color || allowed[0] || "";
    if (initColor && initColor !== color) setColor(initColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, models.join("|"), preferredModel, preferredColor, colorsByModel]);

  // Quand le modèle change → auto-sélectionner la couleur du nouveau modèle
  useEffect(() => {
    if (!hasVariations || !currentModel) return;
    const allowed = colorsByModel.get(norm(currentModel)) ?? [];
    if (!allowed.length) return;
    if (!color || !allowed.some((c) => norm(c) === norm(color))) {
      setColor(allowed[0]);
    }
  }, [hasVariations, currentModel, colorsByModel, color]);

  // ── variation correspondante ─────────────────────────────────────────────

  const matchedVariation = useMemo(() => {
    if (!hasVariations || !selected.model) return undefined;
    // Si une couleur est sélectionnée, chercher modèle + couleur
    if (selected.color) {
      const exact = variations.find((v) => {
        const m = getAttr(v.attributes, "Modèle");
        const c = getAttr(v.attributes, "Couleur");
        return (
          m && norm(m) === norm(selected.model) &&
          c && norm(c) === norm(selected.color)
        );
      });
      if (exact) return exact;
    }
    // Fallback : première variation du modèle sélectionné
    return variations.find(
      (v) => norm(getAttr(v.attributes, "Modèle") ?? "") === norm(selected.model),
    );
  }, [hasVariations, variations, selected]);

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

    if (matchedVariation) {
      const m = fromAttrs(matchedVariation.attributes);
      if (m) return m;
    }
    if (fallbackVariation) {
      const m = fromAttrs(fallbackVariation.attributes);
      if (m) return m;
    }
    for (const v of variations) {
      const m = fromAttrs(v.attributes);
      if (m) return m;
    }
    return undefined;
  }, [matchedVariation, fallbackVariation, variations]);

  // ── image héro ───────────────────────────────────────────────────────────

  const heroImage = useMemo(() => {
    // Si l'utilisateur a cliqué sur la galerie, utiliser son choix
    if (userPickedImage && selectedImage) return selectedImage;
    // Sinon, utiliser l'image de la variation matchée (changement auto selon modèle)
    if (matchedVariation?.image?.src) return matchedVariation.image.src;
    // Fallback : image principale du produit
    return product?.images?.[0]?.src ?? undefined;
  }, [userPickedImage, selectedImage, matchedVariation, product?.images]);

  // ── galerie ──────────────────────────────────────────────────────────────

  const gallery = useMemo(() => {
    if (!product) return [];

    if (!hasVariations) {
      return (product.images ?? []).map((im, idx) => ({
        src: im.src,
        alt: im.alt || `${product.name} — ${idx + 1}`,
        variationId: 0,
        color: null as string | null,
        model: null as string | null,
        isActive: idx === 0,
      }));
    }

    // Nouvelle structure : une image par modèle (toutes les variations)
    if (isOneColorPerModel) {
      return variations
        .filter((v) => Boolean(v.image?.src))
        .map((v) => ({
          src: v.image!.src,
          alt: [product.name, getAttr(v.attributes, "Modèle")].filter(Boolean).join(" — "),
          variationId: v.id,
          color: getAttr(v.attributes, "Couleur"),
          model: getAttr(v.attributes, "Modèle"),
          isActive: matchedVariation?.id === v.id,
        }));
    }

    // Ancienne structure : filtrer par modèle sélectionné
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
        model: null as string | null,
        isActive: matchedVariation?.id === v.id,
      }));
  }, [product, hasVariations, isOneColorPerModel, variations, selected.model, matchedVariation]);

  // ── prix & panier ────────────────────────────────────────────────────────

  const price = parsePrice(
    matchedVariation?.price ??
    fallbackVariation?.price ??
    product?.price ??
    product?.regular_price,
  );

  const canAdd = Boolean(product) && qty > 0 && (!hasVariations || Boolean(matchedVariation));

  const mentionsMagSafe = useMemo(() => {
    const blob = `${product?.name ?? ""} ${product?.short_description ?? ""} ${product?.description ?? ""}`;
    return /magsafe/i.test(blob);
  }, [product?.name, product?.short_description, product?.description]);

  const onAdd = () => {
    if (!product) return;
    if (hasVariations && !matchedVariation) {
      toast({
        title: "Sélection incomplète",
        description: "Choisis un modèle iPhone.",
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
              Ce produit n'existe pas ou le lien est incorrect. Vérifie l'URL ou retourne à la boutique.
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
              <div className="overflow-hidden">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="group relative block w-full">
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.05),transparent_60%)] opacity-0 transition group-hover:opacity-100" />
                      {heroImage ? (
                        <img
                          key={heroImage}
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

              {/* Galerie */}
              {gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {gallery.map((g) => (
                    <button
                      key={g.variationId}
                      type="button"
                      onClick={() => {
                        // Si nouvelle structure : clic change le modèle
                        if (isOneColorPerModel && g.model) {
                          setModel(g.model);
                          const allowed = colorsByModel.get(norm(g.model)) ?? [];
                          setColor(allowed[0] ?? "");
                        } else {
                          if (g.color) setColor(g.color);
                        }
                        setSelectedImage(g.src);
                        setUserPickedImage(true);
                      }}
                      aria-label={isOneColorPerModel ? `Modèle ${g.model}` : `Couleur ${g.color}`}
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
                      {/* Nouvelle structure : afficher le modèle sous l'image */}
                      {isOneColorPerModel && g.model && (
                        <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground">
                          {g.model.replace("iPhone ", "")}
                        </span>
                      )}
                      {!isOneColorPerModel && g.color && (
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
                <div className="space-y-4">
                  {/* Sélecteur modèle — toujours affiché */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Modèle d'iPhone
                    </div>
                    <Select
                      value={model || models[0]}
                      onValueChange={(next) => {
                        setModel(next);
                        setUserPickedImage(false);
                        if (!hasVariations) return;
                        const allowed = colorsByModel.get(norm(next)) ?? [];
                        setColor(allowed[0] ?? "");
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

                  {/* Sélecteur couleur — uniquement si plusieurs couleurs par modèle */}
                  {!isOneColorPerModel && allowedColors.length > 1 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Couleur
                      </div>
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
                    </div>
                  )}
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

                  {/* Boutons modèles cliquables */}
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
                              setUserPickedImage(false);
                              if (hasVariations) {
                                const allowed = colorsByModel.get(norm(m)) ?? [];
                                setColor(allowed[0] ?? "");
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