import { FadeIn } from "@/components/animations/FadeIn";
import { TrustBar } from "@/components/commerce/TrustBar";
import { HeroShowcase } from "@/components/home/HeroShowcase";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductImageFrame } from "@/components/products/ProductImageFrame";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { impexoCollections } from "@/content/collections";
import { useProductsQuery } from "@/hooks/useWooProducts";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [allowBestSellers, setAllowBestSellers] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAllowBestSellers(true), 2000);
    return () => clearTimeout(t);
  }, []);
  const hero = useProductsQuery({ orderby: "date", per_page: 5 });
  const best = useProductsQuery({ orderby: "popularity", per_page: 4 }, { enabled: allowBestSellers });

  return (
    <div>
      {/* HERO plein écran (la première chose vue) */}
      <HeroShowcase products={Array.isArray(hero.data) ? hero.data : []} />
      <TrustBar />

      {/* Manifesto / storytelling */}
      <section className="bg-background">
        <Container className="py-14 sm:py-16">
          <FadeIn>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">MANIFESTE</div>
                <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Le luxe n’est pas un logo.
                  <span className="block text-muted-foreground">C’est une sensation.</span>
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Impexo conçoit des coques comme des objets de design : proportions justes, détails fins, finitions
                  impeccables. Tout est pensé pour sublimer l’iPhone, sans le surcharger.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="h-12 rounded-full px-6">
                    <Link to="/boutique">
                      Voir les collections <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  {
                    title: "Finition studio",
                    desc: "Textures maîtrisées, reflets subtils, lignes nettes.",
                  },
                  {
                    title: "Protection précise",
                    desc: "Protection caméra & bords, sans épaisseur inutile.",
                  },
                  {
                    title: "Expérience fluide",
                    desc: "Navigation rapide. Choix clair. Achat sans friction.",
                  },
                ].map((b) => (
                  <div
                    key={b.title}
                    className="rounded-3xl border p-6 impexo-surface impexo-sheen transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_26px_70px_-50px_rgba(0,0,0,0.55)]"
                  >
                    <div className="text-sm font-medium tracking-tight">{b.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Collections */}
      <section className="bg-background">
        <Container className="py-14 sm:py-16">
          <FadeIn>
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">COLLECTIONS</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Choisis une signature.</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Transparence premium, compatibilité magnétique, métal, finition mate… une sélection pensée pour l’iPhone 17 Series.
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden rounded-full md:inline-flex">
                <Link to="/boutique">
                  Tout voir <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {impexoCollections.map((c) => (
              <FadeIn key={c.id} className="h-full">
                <Link
                  to={`/boutique/collection/${encodeURIComponent(c.query)}`}
                  className="group relative block h-full overflow-hidden rounded-3xl border impexo-surface impexo-sheen transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_80px_-55px_rgba(0,0,0,0.55)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(0,0,0,0.10),transparent_55%)] opacity-70" />
                  <ProductImageFrame className="relative aspect-[16/10]">
                    <img
                      src={c.imageSrc}
                      alt={`Collection ${c.title}`}
                      loading="lazy"
                      decoding="async"
                      className="impexo-product-shadow impexo-image-fade impexo-cutout h-full w-full object-contain p-6 transition duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </ProductImageFrame>
                  <div className="relative p-6">
                    <div className="text-sm font-medium tracking-tight">{c.title}</div>
                    <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</div>
                    <div className="mt-4 inline-flex items-center text-sm font-medium">
                      Explorer <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

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
                    <ProductImageFrame className="aspect-[4/3]">
                      <Skeleton className="h-full w-full" />
                    </ProductImageFrame>
                    <div className="space-y-3 p-5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : (Array.isArray(best.data) ? best.data : []).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Container>
      </section>

      {/* Section éditoriale visuelle */}
      <section className="bg-secondary/30">
        <Container className="py-14 sm:py-16">
          <FadeIn>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">SAVOIR‑FAIRE</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Une esthétique sobre,
                  <span className="block text-muted-foreground">des détails qui se sentent.</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Nous privilégions des matériaux fiables et une finition propre. Le résultat : une coque nette au regard,
                  confortable en main et élégante au quotidien.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {["TPU soft-touch", "Hybride PC+TPU", "Acrylique premium", "Cadre métal"].map((t) => (
                    <span key={t} className="rounded-full border bg-background px-3 py-1">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative overflow-hidden rounded-3xl border bg-background impexo-surface">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.08),transparent_55%)]" />
                  <img
                    src="/IMPEXO-IPHONE 17 SERIES12-31/JOJO1015-22.JPG"
                    alt="Impexo — finitions premium"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-contain p-6 sm:p-10"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Compatibilité & confiance */}
      <section className="bg-background">
        <Container className="py-14 sm:py-16">
          <FadeIn>
            <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
              <div>
                <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">COMPATIBILITÉ</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  iPhone 17 Series.
                  <span className="block text-muted-foreground">Choix clair, fit précis.</span>
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Filtre par modèle et couleur, sélection immédiate en fiche produit, variations cohérentes. Tu choisis,
                  c’est prêt.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "iPhone 17", desc: "L’essentiel, sans compromis." },
                  { title: "iPhone 17 Air", desc: "Léger, minimal, premium." },
                  { title: "iPhone 17 Pro", desc: "Finition studio & précision." },
                  { title: "iPhone 17 Pro Max", desc: "Présence luxueuse, grand format." },
                ].map((m) => (
                  <div
                    key={m.title}
                    className="rounded-3xl border p-6 impexo-surface impexo-sheen transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_26px_70px_-50px_rgba(0,0,0,0.55)]"
                  >
                    <div className="text-sm font-medium tracking-tight">{m.title}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
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

      {/* CTA final */}
      <section className="bg-background">
        <Container className="py-14 sm:py-16">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border p-10 text-center impexo-surface impexo-sheen">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,0,0,0.08),transparent_60%)]" />
              <div className="relative">
                <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">IMPEXO</div>
                <div className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Prêt à passer au premium ?
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Découvre la collection iPhone 17 Series et choisis la finition qui te ressemble.
                </div>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild className="h-12 rounded-full px-6">
                    <Link to="/boutique">
                      Accéder à la boutique <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="h-12 rounded-full px-6">
                    <Link to="/contact">Support & FAQ</Link>
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
};

export default Index;
