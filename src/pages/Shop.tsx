import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "@/hooks/useWooProducts";
import type { WooProduct } from "@/types/woocommerce";
import { collectOptions, findAttribute } from "@/utils/productAttributes";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

function hasOption(product: WooProduct, attrName: string, option: string) {
  const attr = product.attributes?.find((a) => a.name === attrName);
  if (!attr) return false;
  return (attr.options ?? []).some((o) => o.toLowerCase() === option.toLowerCase());
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const { query: queryFromPath } = useParams<{ query?: string }>();
  // Lecture depuis l'URL : ?q= (lien direct) ou /boutique/collection/xxx (clic sur une collection)
  const initialQ = searchParams.get("q") ?? queryFromPath ?? "";

  const [search, setSearch] = useState(initialQ);
  const [model, setModel] = useState<string>("all");
  const [color, setColor] = useState<string>("all");
  const [material, setMaterial] = useState<string>("all");

  useEffect(() => {
    // Synchroniser le champ recherche avec l'URL (ex: clic sur une collection → /boutique?q=xxx)
    setSearch(initialQ);
    setModel("all");
    setColor("all");
    setMaterial("all");
  }, [initialQ]);

  // Utiliser l'URL (?q=) comme source de vérité pour la requête : au clic sur une catégorie/collection
  // on arrive avec ?q=xxx et la requête doit utiliser xxx dès le premier rendu (pas seulement après useEffect).
  const searchForApi = initialQ || search;
  const q = useProductsQuery({ search: searchForApi || undefined, per_page: 48, orderby: "date" });
  const products = Array.isArray(q.data) ? q.data : [];
  const hasError = Boolean(q.isError || (q.data === undefined && !q.isLoading && q.isFetched));

  const inferredAttrNames = useMemo(() => {
    const sample = products[0];
    return {
      model: sample ? findAttribute(sample, "model")?.name : undefined,
      color: sample ? findAttribute(sample, "color")?.name : undefined,
      material: sample ? findAttribute(sample, "material")?.name : undefined,
    };
  }, [products]);

  const modelOptions = useMemo(() => collectOptions(products, "model"), [products]);
  const colorOptions = useMemo(() => collectOptions(products, "color"), [products]);
  const materialOptions = useMemo(() => collectOptions(products, "material"), [products]);

  const filtered = useMemo(() => {
    const mName = inferredAttrNames.model;
    const cName = inferredAttrNames.color;
    const tName = inferredAttrNames.material;
    return products.filter((p) => {
      const okModel = model === "all" || (mName ? hasOption(p, mName, model) : true);
      const okColor = color === "all" || (cName ? hasOption(p, cName, color) : true);
      const okMaterial = material === "all" || (tName ? hasOption(p, tName, material) : true);
      return okModel && okColor && okMaterial;
    });
  }, [products, model, color, material, inferredAttrNames]);

  return (
    <div className="bg-background min-h-[60vh]">
      <Container className="py-10 sm:py-12">
        <FadeIn>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">BOUTIQUE</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {searchForApi ? `Recherche : ${searchForApi}` : "Coques premium"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Grands espaces, détails fins, design minimaliste. Filtre par modèle, couleur et matériau.
              </p>
            </div>
            <div className="w-full max-w-xl">
              <Input
                value={search || initialQ}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une coque…"
                className="h-11 rounded-full bg-muted/40"
              />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-6 grid gap-3 sm:grid-cols-3">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-11 rounded-full bg-background">
              <SelectValue placeholder="Modèle d’iPhone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les modèles</SelectItem>
              {modelOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={color} onValueChange={setColor}>
            <SelectTrigger className="h-11 rounded-full bg-background">
              <SelectValue placeholder="Couleur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les couleurs</SelectItem>
              {colorOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger className="h-11 rounded-full bg-background">
              <SelectValue placeholder="Matériau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les matériaux</SelectItem>
              {materialOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FadeIn>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {q.isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border bg-card">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            : filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {!q.isLoading && filtered.length === 0 ? (
          <div className="mt-10 min-h-[280px] rounded-3xl border bg-card p-10 text-center flex flex-col items-center justify-center">
            {hasError ? (
              <>
                <div className="text-sm font-medium tracking-tight">Impossible de charger les produits.</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Vérifie ta connexion ou réessaie plus tard. En local, le proxy Vite envoie /api vers la prod.
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-medium tracking-tight">
                  {searchForApi ? "Aucun produit ne correspond à cette recherche." : "Aucun produit ne correspond."}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {searchForApi ? "Essaie un autre mot-clé ou affiche toute la boutique." : "Essaie d'élargir tes filtres."}
                </div>
                <div className="mt-6">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/boutique">Voir toute la boutique</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
