import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { BadgeCheck, CreditCard, Truck } from "lucide-react";

export function TrustBar({ className }: { className?: string }) {
  const items = [
    { icon: Truck, title: "Livraison suivie", desc: "Expédition rapide & tracking" },
    { icon: CreditCard, title: "Paiement sécurisé", desc: "Cartes & solutions fiables" },
    { icon: BadgeCheck, title: "Retours simples", desc: "Sous conditions — à préciser" },
  ] as const;

  return (
    <div className={cn("border-y bg-background/70", className)}>
      <Container className="grid gap-3 py-6 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3 rounded-3xl border p-4 impexo-surface">
            <it.icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium tracking-tight">{it.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{it.desc}</div>
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}

