import { HeroShowcase } from "@/components/home/HeroShowcase";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductsQuery } from "@/hooks/useWooProducts";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const best = useProductsQuery({ orderby: "popularity", per_page: 4 });
  const hero = useProductsQuery({ orderby: "date", per_page: 5 });

  return (
    <div>
      {/* HERO plein écran (la première chose vue) */}
      <HeroShowcase products={hero.data ?? []} />

      <section className="bg-background">
        <Container className="py-14 sm:py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">SÉLECTION</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Best‑sellers</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Les coques préférées de nos clients, pensées pour sublimer l’iPhone sans le dénaturer.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden rounded-full md:inline-flex">
              <Link to="/boutique">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {best.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-3xl border bg-card">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="space-y-3 p-5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : (best.data ?? []).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Container>
      </section>

      <section className="bg-secondary/40">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">POURQUOI IMPEXO ?</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Le luxe, c’est la précision.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Chez Impexo, chaque coque est pensée comme un objet de design&nbsp;: lignes pures, textures maîtrisées,
                ajustement impeccable. Le résultat&nbsp;: une protection fine, élégante, qui respecte l’iPhone.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {["Bords affleurants", "Toucher soft premium", "Reflets satinés", "Minimalisme absolu"].map((t) => (
                  <span key={t} className="rounded-full border bg-background px-3 py-1">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border p-8 impexo-surface impexo-sheen">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.10),transparent_60%)]" />
              <div className="relative">
                <div className="text-sm font-medium tracking-tight">Signature</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  “L’essentiel, en version premium.”
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Une esthétique sobre, un confort quotidien, une signature luxueuse.
                </p>
                <div className="mt-6">
                  <Button asChild className="rounded-full px-6">
                    <Link to="/boutique">
                      Explorer les coques <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Index;
