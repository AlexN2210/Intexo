import { useParams, Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";

const TITLES: Record<string, string> = {
  "mentions-legales": "Mentions légales",
  "cgv": "Conditions Générales de Vente (CGV)",
  "politique-confidentialite": "Politique de confidentialité (RGPD)",
  "politique-cookies": "Politique de cookies",
  "livraison": "Livraison",
  "paiement": "Paiement",
  "retours-retractation": "Retours & rétractation",
  "garanties-legales": "Garanties légales",
};

export default function LegalContent() {
  const { slug } = useParams<{ slug: string }>();
  const title = (slug && TITLES[slug]) || "Document";

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-10 sm:py-14 lg:py-16">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Contenu à compléter.</p>
        <p className="mt-6">
          <Link to="/mentions-legales" className="text-sm underline hover:no-underline">
            ← Retour aux mentions légales
          </Link>
        </p>
      </Container>
    </div>
  );
}
