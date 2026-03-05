import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  selectCartCount,
  selectCartDiscount,
  selectCartSubtotal,
  useCartStore,
} from "@/store/cartStore";
import { formatEUR } from "@/utils/money";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { toast } = useToast();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const isLoading = useCartStore((s) => s.isLoading);
  const setCheckoutLoading = useCartStore((s) => s.setCheckoutLoading);

  // Débloquer le panier au montage (au cas où isLoading serait resté true après une redirection ou retour arrière)
  useEffect(() => {
    setCheckoutLoading(false);
  }, [setCheckoutLoading]);
  const packOfferId = useCartStore((s) => s.packOfferId);
  const setPackOfferId = useCartStore((s) => s.setPackOfferId);
  const subtotal = selectCartSubtotal(items);
  const count = selectCartCount(items);
  const discount = selectCartDiscount(subtotal, count, packOfferId);
  const total = Math.max(0, subtotal - discount);

  const handleSetQuantity = (key: string, quantity: number) => {
    setQuantity(key, quantity);
  };

  const handleRemoveItem = (key: string) => {
    removeItem(key);
    toast({ title: "Article retiré", description: "L'article a été retiré du panier" });
  };

  const handleClear = () => {
    clear();
    toast({ title: "Panier vidé", description: "Tous les articles ont été retirés du panier" });
  };

  // Page WordPress "Panier" : on arrive avec ?cart=, le script PHP remplit le panier puis l’utilisateur va sur "Validation de la commande"
  const navigate = useNavigate();

  const checkout = () => {
    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Votre panier est vide",
        variant: "destructive",
      });
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="bg-background min-h-screen impexo-safe-bottom">
      <Container className="py-10 sm:py-14 lg:py-16">
        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">PANIER</div>
              <h1 className="mt-2 text-xl font-semibold tracking-tight sm:mt-3 sm:text-2xl lg:text-3xl">Votre sélection</h1>
              <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">Simple. Clair. Premium.</p>
            </div>
            {items.length ? (
              <Button
                variant="ghost"
                className="min-h-[44px] rounded-full px-4 text-sm sm:px-5"
                onClick={handleClear}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vider"}
              </Button>
            ) : null}
          </div>
        </FadeIn>

        {items.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-card p-6 text-center sm:mt-8 sm:rounded-3xl sm:p-8 md:p-10">
            <div className="text-base font-medium tracking-tight">Votre panier est vide.</div>
            <div className="mt-2 text-sm text-muted-foreground">Découvrez nos coques premium.</div>
            <div className="mt-6">
              <Button asChild className="min-h-[48px] w-full rounded-full px-5 text-base sm:w-auto sm:px-6">
                <Link to="/boutique">Aller à la boutique</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-3">
            <div className="min-w-0 space-y-3 lg:col-span-2 sm:space-y-4">
              {items.map((it) => (
                <FadeIn key={it.key} className="rounded-2xl border bg-card p-5 sm:rounded-3xl sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted/40 sm:h-24 sm:w-24 sm:rounded-2xl">
                      {it.imageSrc ? (
                        <img
                          src={it.imageSrc}
                          alt={it.name}
                          loading="lazy"
                          decoding="async"
                          className="impexo-cutout h-full w-full object-contain p-2"
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
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="impexo-touch h-11 w-11 min-w-[44px] rounded-full sm:h-10 sm:w-10"
                            onClick={() => handleSetQuantity(it.key, it.quantity - 1)}
                            aria-label="Diminuer la quantité"
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="min-w-[2.5rem] text-center text-sm font-medium tabular-nums">{it.quantity}</div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="impexo-touch h-11 w-11 min-w-[44px] rounded-full sm:h-10 sm:w-10"
                            onClick={() => handleSetQuantity(it.key, it.quantity + 1)}
                            aria-label="Augmenter la quantité"
                            disabled={isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

<Button
                        type="button"
                        variant="ghost"
                        className="min-h-[44px] rounded-full px-4 text-sm text-muted-foreground hover:text-foreground sm:px-5"
                        onClick={() => handleRemoveItem(it.key)}
                        disabled={isLoading}
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

            <FadeIn delay={0.05} className="min-w-0 rounded-2xl border bg-card p-5 sm:rounded-3xl sm:p-6 impexo-safe-bottom lg:sticky lg:top-24 lg:self-start">
              <div className="text-sm font-medium tracking-tight">Résumé</div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium tabular-nums">{formatEUR(subtotal)}</span>
              </div>
              <div className="mt-4 rounded-3xl border p-4 impexo-surface">
                <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground">OFFRES</div>
                <div className="mt-2 text-sm font-medium tracking-tight">Packs (mock)</div>
                <div className="mt-1 text-xs text-muted-foreground">Choisis une offre pour optimiser la conversion.</div>

                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => setPackOfferId(packOfferId === "pack2" ? null : "pack2")}
                    className={[
                      "min-h-[44px] rounded-2xl border px-4 py-3 text-left text-sm transition",
                      packOfferId === "pack2" ? "bg-foreground text-background" : "bg-background hover:bg-muted/60",
                      count < 2 ? "opacity-50" : "",
                    ].join(" ")}
                    aria-pressed={packOfferId === "pack2"}
                  >
                    Pack 2 — <span className="font-semibold">-10%</span>
                    <div className={packOfferId === "pack2" ? "text-background/80 text-xs mt-1" : "text-muted-foreground text-xs mt-1"}>
                      Actif dès 2 articles au panier.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPackOfferId(packOfferId === "pack3" ? null : "pack3")}
                    className={[
                      "min-h-[44px] rounded-2xl border px-4 py-3 text-left text-sm transition",
                      packOfferId === "pack3" ? "bg-foreground text-background" : "bg-background hover:bg-muted/60",
                      count < 3 ? "opacity-50" : "",
                    ].join(" ")}
                    aria-pressed={packOfferId === "pack3"}
                  >
                    Pack 3 — <span className="font-semibold">-15%</span>
                    <div className={packOfferId === "pack3" ? "text-background/80 text-xs mt-1" : "text-muted-foreground text-xs mt-1"}>
                      Actif dès 3 articles au panier.
                    </div>
                  </button>
                </div>
              </div>

              {discount > 0 ? (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remise pack</span>
                  <span className="font-medium tabular-nums">- {formatEUR(discount)}</span>
                </div>
              ) : null}

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">{formatEUR(total)}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Livraison & taxes calculées au checkout WooCommerce.
              </div>
              <Button
                className="mt-6 min-h-[48px] w-full rounded-full px-5 text-base sm:h-12 sm:px-6"
                onClick={checkout}
                disabled={isLoading || items.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création de la commande...
                  </>
                ) : (
                  "Passer au paiement"
                )}
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

