import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-background min-h-screen impexo-safe-bottom">
      <Container className="py-6 sm:py-10 md:py-12">
        <FadeIn className="mx-auto max-w-xl text-center">
          <div className="rounded-2xl border bg-card p-6 sm:rounded-3xl sm:p-8 md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="mt-6 text-xs font-medium tracking-[0.2em] text-muted-foreground">MERCI</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Commande confirmée</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Votre paiement a bien été enregistré. Vous recevrez un email de confirmation sous peu.
            </p>
            {(orderId || sessionId) && (
              <p className="mt-2 text-xs text-muted-foreground">
                {orderId && <>Référence commande : #{orderId}</>}
                {orderId && sessionId && " · "}
                {sessionId && <>Session : {sessionId.slice(0, 20)}…</>}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
              <Button asChild className="min-h-[48px] rounded-full text-base sm:min-h-0 sm:h-10">
                <Link to="/boutique">Continuer mes achats</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-[48px] rounded-full text-base sm:min-h-0 sm:h-10">
                <Link to="/">Retour à l&apos;accueil</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
