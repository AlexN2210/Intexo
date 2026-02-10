import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { WooProduct } from "@/types/woocommerce";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function HeroCarousel({
  products,
  className,
}: {
  products: WooProduct[];
  className?: string;
}) {
  const items = useMemo(() => (products ?? []).filter(Boolean).slice(0, 6), [products]);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setActive(api.selectedScrollSnap());
    const onSelect = () => setActive(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      api.scrollNext();
    }, 4500);
    return () => window.clearInterval(id);
  }, [api]);

  if (!items.length) return null;

  const activeProduct = items[active] ?? items[0];

  return (
    <div
      className={cn(
        "relative w-screen max-w-none overflow-hidden",
        "mx-[calc(50%-50vw)]",
        className,
      )}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <Carousel setApi={setApi} opts={{ loop: true, align: "start" }} className="relative">
        <CarouselContent>
          {items.map((p) => {
            const img = p.images?.[0]?.src || "/placeholder.svg";

            return (
              <CarouselItem key={p.id} className="p-0">
                <div className="relative h-[100svh] min-h-[640px] w-full">
                  <img
                    src={img}
                    alt={p.images?.[0]?.alt || p.name}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* overlays premium (vignette + lisibilité + reflets) */}
                  <div className="pointer-events-none absolute inset-0 bg-black/25" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_55%)] mix-blend-overlay" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,0,0,0.35),transparent_58%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Indicateurs minimalistes */}
        <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Aller au slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-10 bg-white/85" : "w-5 bg-white/25 hover:bg-white/45",
              )}
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>
      </Carousel>

      {/* Overlay HERO (premium, pas une card) */}
      <div className="pointer-events-none absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="pointer-events-auto max-w-3xl text-white">
            <div className="text-xs font-medium tracking-[0.32em] text-white/70">IMPEXO</div>
            <div className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Coques d’iPhone haut de gamme.
              <span className="block text-white/70">Ultra‑minimalistes. Élégantes. Premium.</span>
            </div>
            <div className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
              {activeProduct?.short_description
                ? stripHtml(activeProduct.short_description)
                : "Une esthétique sobre, des finitions impeccables, et une expérience fluide."}
            </div>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild className="h-12 rounded-full px-6">
                <Link to="/boutique">Découvrir la boutique</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-white/0 px-6 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to={activeProduct ? `/produit/${activeProduct.slug}` : "/boutique"}>Voir un modèle</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

