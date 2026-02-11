import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { selectCartSubtotal, useCartStore } from "@/store/cartStore";
import { formatEUR } from "@/utils/money";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cart() {
  const { toast } = useToast();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const subtotal = selectCartSubtotal(items);

  const checkout = () => {
    toast({
      title: "Checkout à connecter",
      description: "Pour WooCommerce headless, on branche ensuite le parcours checkout (souvent via un backend proxy).",
    });
  };

  return (
    <div className="bg-background">
      <Container className="py-10 sm:py-12">
        <FadeIn>
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">PANIER</div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Votre sélection</h1>
              <p className="mt-2 text-sm text-muted-foreground">Simple. Clair. Premium.</p>
            </div>
            {items.length ? (
              <Button variant="ghost" className="rounded-full" onClick={clear}>
                Vider
              </Button>
            ) : null}
          </div>
        </FadeIn>

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border bg-card p-10 text-center">
            <div className="text-sm font-medium tracking-tight">Votre panier est vide.</div>
            <div className="mt-2 text-sm text-muted-foreground">Découvrez nos coques premium.</div>
            <div className="mt-6">
              <Button asChild className="rounded-full px-6">
                <Link to="/boutique">Aller à la boutique</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((it) => (
                <FadeIn key={it.key} className="rounded-3xl border bg-card p-5">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 overflow-hidden rounded-2xl bg-muted/40">
                      {it.imageSrc ? (
                        <img
                          src={it.imageSrc}
                          alt={it.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-2"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium tracking-tight">{it.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {[it.options?.model, it.options?.color, it.options?.material].filter(Boolean).join(" • ")}
                          </div>
                        </div>
                        <div className="text-sm font-medium tabular-nums">{formatEUR(it.unitPrice)}</div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 w-10 rounded-full"
                            onClick={() => setQuantity(it.key, it.quantity - 1)}
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="w-10 text-center text-sm font-medium tabular-nums">{it.quantity}</div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 w-10 rounded-full"
                            onClick={() => setQuantity(it.key, it.quantity + 1)}
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem(it.key)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.05} className="rounded-3xl border bg-card p-6 lg:sticky lg:top-24 lg:self-start">
              <div className="text-sm font-medium tracking-tight">Résumé</div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium tabular-nums">{formatEUR(subtotal)}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Livraison & taxes calculées au checkout WooCommerce.
              </div>
              <Button className="mt-6 h-12 w-full rounded-full" onClick={checkout}>
                Passer au paiement
              </Button>
              <div className="mt-3 text-center text-xs text-muted-foreground">
                Paiement sécurisé (à connecter).
              </div>
            </FadeIn>
          </div>
        )}
      </Container>
    </div>
  );
}

