import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WooProduct } from "@/types/woocommerce";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type Look = {
  key: string;
  label: string;
  product: WooProduct;
};

export function HeroShowcase({ products }: { products: WooProduct[] }) {
  const reduce = useReducedMotion();

  const looks: Look[] = useMemo(() => {
    const list = (products ?? []).filter(Boolean).slice(0, 4);
    return list.map((p, idx) => ({
      key: String(p.id),
      label:
        idx === 0
          ? "Noir"
          : idx === 1
            ? "Argent"
            : idx === 2
              ? "Gris"
              : "Édition",
      product: p,
    }));
  }, [products]);

  const [activeKey, setActiveKey] = useState<string>(looks[0]?.key ?? "");
  const active = looks.find((l) => l.key === activeKey) ?? looks[0];
  if (!active) return null;

  const img = "/background1.png";
  const subtitle =
    "Couleurs signature. Technologie magnétique compatible MagSafe. Une finition premium pensée pour l’iPhone 17 Series.";

  return (
    <section className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden">
      <div className="relative h-[100svh] min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] w-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeKey}
            src={img}
            alt={active.product.images?.[0]?.alt || active.product.name}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[50%_50%] sm:object-center scale-[1.12] sm:scale-100"
            initial={reduce ? false : { opacity: 0.0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>

        {/* overlays premium (zéro “card”, mais lisibilité) */}
        <div className="pointer-events-none absolute inset-0 bg-black/20 sm:bg-black/25" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.14),transparent_55%)] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.62))] sm:bg-[linear-gradient(90deg,rgba(0,0,0,0.55),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/78 via-black/24 to-black/0 sm:from-black/70" />

        {/* 4rem = header h-16, + safe-area iOS */}
        <div className="absolute inset-0 flex items-center pt-[calc(4rem+env(safe-area-inset-top))]">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-white text-center md:text-left">
              <div className="text-xs font-medium tracking-[0.32em] text-white/70">IMPEXO</div>
              <h1 className="mt-5 text-balance font-semibold leading-[1.04] tracking-tight text-[clamp(2.05rem,5vw,4.15rem)]">
                Coques premium compatibles iPhone.
                <span className="block text-white/70">Sobriété absolue. Finesse maîtrisée. Luxe discret.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-white/75 text-[clamp(1rem,2.2vw,1.125rem)]">
                {subtitle}
              </p>

              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
                <Button asChild className="h-12 w-full rounded-full px-6 sm:w-auto">
                  <Link to="/boutique">Découvrir la boutique</Link>
                </Button>
              </div>

              {/* Looks selector (sans animation agressive) */}
              <div className="mt-8 flex flex-wrap justify-center gap-2 md:justify-start sm:mt-10">
                {looks.map((l) => {
                  const isActive = l.key === activeKey;
                  return (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setActiveKey(l.key)}
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs backdrop-blur transition",
                        isActive
                          ? "border-white/35 bg-white/15 text-white"
                          : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                      aria-pressed={isActive}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* bottom cue */}
        <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 text-xs text-white/55">
          Faire défiler
        </div>
      </div>
    </section>
  );
}

