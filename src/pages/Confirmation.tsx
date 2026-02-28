import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");

  return (
    <div className="bg-background">
      <Container className="py-10 sm:py-12">
        <FadeIn className="mx-auto max-w-xl text-center">
          <div className="rounded-3xl border bg-card p-8 sm:p-10">
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="rounded-full">
                <Link to="/boutique">Continuer mes achats</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">Retour à l&apos;accueil</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
