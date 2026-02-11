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
import { findMatchingVariation, getAttributeOptions } from "@/utils/productAttributes";
import { Minus, Plus, Shield, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function Product() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [qty, setQty] = useState(1);
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");

  const q = useProductBySlugQuery(slug);
  const product = q.data ?? null;

  const hasVariations = Boolean(product && product.type === "variable" && product.variations?.length);
  const varsQ = useProductVariationsQuery(product?.id, hasVariations);
  const variations = varsQ.data ?? [];

  const models = useMemo(() => (product ? getAttributeOptions(product, "model") : []), [product]);
  const colors = useMemo(() => (product ? getAttributeOptions(product, "color") : []), [product]);
  const materials = useMemo(() => (product ? getAttributeOptions(product, "material") : []), [product]);

  const availableColorsByModel = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!hasVariations) return map;
    variations.forEach((v) => {
      const m = v.attributes?.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
      const c = v.attributes?.find((a) => /couleur|color/i.test(a.name))?.option;
      if (!m || !c) return;
      const list = map.get(m) ?? [];
      if (!list.includes(c)) list.push(c);
      map.set(m, list);
    });
    // tri pour un affichage stable
    Array.from(map.entries()).forEach(([k, list]) => {
      map.set(k, [...list].sort((a, b) => a.localeCompare(b)));
    });
    return map;
  }, [hasVariations, variations]);

  const allowedColorsForSelectedModel = useMemo(() => {
    if (!hasVariations) return colors;
    const m = model || models[0];
    return (m ? availableColorsByModel.get(m) : undefined) ?? [];
  }, [hasVariations, colors, availableColorsByModel, model, models]);

  const findModelForColor = (wantedColor: string): string | undefined => {
    for (const [m, list] of availableColorsByModel.entries()) {
      if (list.includes(wantedColor)) return m;
    }
    return undefined;
  };

  const preferredModel = searchParams.get("model") ?? "";
  const preferredColor = searchParams.get("color") ?? "";

  // Sélection initiale : prend en compte ?model= & ?color= si possible.
  useEffect(() => {
    if (!product) return;
    const initialModel =
      (preferredModel && models.includes(preferredModel) ? preferredModel : "") || model || models[0] || "";
    if (initialModel && initialModel !== model) setModel(initialModel);

    const allowedForModel = hasVariations ? availableColorsByModel.get(initialModel) ?? [] : colors;
    const initialColor =
      (preferredColor && allowedForModel.includes(preferredColor) ? preferredColor : "") || color || allowedForModel[0] || colors[0] || "";
    if (initialColor && initialColor !== color) setColor(initialColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, models.join("|"), colors.join("|"), preferredModel, preferredColor]);

  // Si l’utilisateur change de modèle, on force une couleur valide pour ce modèle.
  useEffect(() => {
    if (!hasVariations) return;
    const m = model || models[0];
    if (!m) return;
    const allowed = availableColorsByModel.get(m) ?? [];
    if (!allowed.length) return;
    if (!color || !allowed.includes(color)) {
      setColor(allowed[0]);
    }
  }, [hasVariations, model, models, availableColorsByModel, color]);

  const selected = useMemo(() => {
    return { model: model || models[0], color: color || colors[0] };
  }, [model, color, models, colors]);

  const matchedVariation = useMemo(() => {
    if (!hasVariations) return undefined;
    return findMatchingVariation(variations, selected);
  }, [hasVariations, variations, selected]);

  const heroImage = matchedVariation?.image?.src ?? product?.images?.[0]?.src;
  const price = parsePrice(matchedVariation?.price ?? product?.price ?? product?.regular_price);

  const selectedMaterial = useMemo(() => {
    const fromVariation = matchedVariation?.attributes?.find((a) => /mat[ée]riau|material/i.test(a.name))?.option;
    return fromVariation ?? materials[0];
  }, [matchedVariation, materials]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (hasVariations) {
      const uniq = new Map<string, { src: string; alt: string; model?: string; color?: string; isActive: boolean }>();
      variations.forEach((v) => {
        const src = v.image?.src;
        if (!src) return;
        const m = v.attributes?.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
        const c = v.attributes?.find((a) => /couleur|color/i.test(a.name))?.option;
        const key = `${src}|${m ?? ""}|${c ?? ""}`;
        if (!uniq.has(key)) {
          uniq.set(key, {
            src,
            alt: `${product.name}${m ? ` — ${m}` : ""}${c ? ` — ${c}` : ""}`,
            model: m,
            color: c,
            isActive: Boolean(matchedVariation && v.id === matchedVariation.id),
          });
        }
      });
      return Array.from(uniq.values());
    }
    // simple product
    return (product.images ?? []).map((im, idx) => ({
      src: im.src,
      alt: im.alt || `${product.name} — ${idx + 1}`,
      isActive: idx === 0,
    }));
  }, [product, hasVariations, variations, matchedVariation]);

  const canAdd = Boolean(product) && qty > 0;

  const onAdd = () => {
    if (!product) return;
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
            <div className="mt-2 text-sm text-muted-foreground">Vérifie le lien ou retourne à la boutique.</div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <FadeIn>
              <div className="overflow-hidden rounded-3xl border bg-muted/30">
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
                          className="aspect-square w-full object-contain p-6 transition duration-700 ease-out group-hover:scale-[1.01] sm:p-8"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-muted" />
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0">
                    {heroImage ? (
                      <div className="bg-black">
                        <img src={heroImage} alt={product.name} className="h-[80vh] w-full object-contain" />
                      </div>
                    ) : null}
                  </DialogContent>
                </Dialog>
              </div>

              {gallery.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {gallery.slice(0, 12).map((g) => (
                    <button
                      key={`${g.src}-${g.model ?? ""}-${g.color ?? ""}`}
                      type="button"
                      onClick={() => {
                        if (g.model) setModel(g.model);
                        if (g.color) setColor(g.color);
                      }}
                      className={[
                        "group overflow-hidden rounded-2xl border bg-muted/30 transition",
                        g.isActive ? "border-foreground/40" : "hover:border-foreground/25",
                      ].join(" ")}
                      aria-label={`Voir ${g.alt}`}
                    >
                      <img
                        src={g.src}
                        alt={g.alt}
                        loading="lazy"
                        decoding="async"
                        className="aspect-square w-full object-contain p-2 transition duration-300 ease-out group-hover:scale-[1.02]"
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Zoom élégant (cliquer)</span>
                <span className="tabular-nums">{formatEUR(price)}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">IMPEXO</div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
                  <div className="mt-3 text-lg font-medium tabular-nums">{formatEUR(price)}</div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Modèle d’iPhone</div>
                    <Select value={model} onValueChange={setModel}>
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

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Couleur</div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => {
                        const active = color === c;
                        const isAvailable = !hasVariations || allowedColorsForSelectedModel.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              if (isAvailable) {
                                setColor(c);
                                return;
                              }
                              // UX: si la couleur n’existe pas pour ce modèle, on bascule vers un modèle qui l’a.
                              const nextModel = findModelForColor(c);
                              if (nextModel) {
                                setModel(nextModel);
                                setColor(c);
                              }
                            }}
                            className={[
                              "rounded-full border px-3 py-2 text-xs transition",
                              active ? "bg-foreground text-background" : "bg-background hover:bg-muted/60",
                              isAvailable ? "" : "opacity-40",
                            ].join(" ")}
                            aria-disabled={!isAvailable}
                          >
                            {c}
                          </button>
                        );
                      })}
                      {colors.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Couleurs non renseignées</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {hasVariations ? (
                  <div className="rounded-3xl border bg-card p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-muted-foreground">Variation</div>
                      <div className="font-medium">
                        {matchedVariation
                          ? [selected.model, selected.color, selectedMaterial].filter(Boolean).join(" • ")
                          : "Sélectionner modèle/couleur"}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-3xl border bg-card p-5">
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
                      <div className="w-10 text-center text-sm font-medium tabular-nums">{qty}</div>
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-3xl border bg-card p-4">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium tracking-tight">Protection fine</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Ajustement précis. Confort au quotidien.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-3xl border bg-card p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium tracking-tight">Finitions premium</div>
                      <div className="mt-1 text-sm text-muted-foreground">Reflets, textures, minimalisme.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border bg-card p-6">
                  <div className="text-sm font-medium tracking-tight">Détails</div>
                  <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {materials.length ? <div>Matériau&nbsp;: {materials[0]}</div> : null}
                  </div>
                  {product.short_description ? (
                    <div
                      className="prose prose-sm mt-4 max-w-none text-muted-foreground prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.short_description }}
                    />
                  ) : null}
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </Container>
    </div>
  );
}

