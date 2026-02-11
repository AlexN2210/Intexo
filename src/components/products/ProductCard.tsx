import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatEUR, parsePrice } from "@/utils/money";
import type { WooProduct } from "@/types/woocommerce";
import { Link } from "react-router-dom";

export function ProductCard({ product }: { product: WooProduct }) {
  const img = product.images?.[0];
  const price = parsePrice(product.price || product.regular_price);
  const isNew = product.categories?.some((c) => /nouveaut/i.test(c.name) || /new/i.test(c.slug));

  return (
    <Link
      to={`/produit/${product.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card transition impexo-surface impexo-sheen",
        "hover:-translate-y-0.5 hover:shadow-[0_26px_70px_-45px_rgba(0,0,0,0.55)]",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/[0.02] opacity-0 transition group-hover:opacity-100" />

      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {img ? (
          <img
            src={img.src}
            alt={img.alt || product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-6 transition duration-700 ease-out group-hover:scale-[1.02] sm:p-7"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        <div className="absolute left-4 top-4 flex items-center gap-2">
          {product.on_sale ? <Badge className="rounded-full bg-foreground text-background">Offre</Badge> : null}
          {isNew ? <Badge className="rounded-full bg-muted text-foreground">Nouveau</Badge> : null}
        </div>
      </div>

      <div className="relative space-y-2 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium tracking-tight">{product.name}</div>
            <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">Finitions premium. Protection fine.</div>
          </div>
          <div className="shrink-0 text-sm font-medium tabular-nums">{formatEUR(price)}</div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>Design minimaliste</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>Toucher premium</span>
        </div>
      </div>
    </Link>
  );
}

