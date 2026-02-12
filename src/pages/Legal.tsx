import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";

export default function Legal() {
  return (
    <div className="bg-background">
      <Container className="py-10 sm:py-12">
        <FadeIn>
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">INFORMATIONS</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Mentions légales</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Contenu “mock” pour validation design. Tu remplaceras ensuite par tes informations officielles.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-8 rounded-3xl border p-6 impexo-surface">
          <div className="text-sm font-medium tracking-tight">Éditeur du site</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Impexo (informations à compléter)
            <br />
            Adresse : …
            <br />
            Email : …
            <br />
            SIRET : …
          </div>

          <div className="mt-8 text-sm font-medium tracking-tight">Hébergement</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Hébergeur : …
            <br />
            Adresse : …
            <br />
            Téléphone : …
          </div>

          <div className="mt-8 text-sm font-medium tracking-tight">Propriété intellectuelle</div>
          <div className="mt-2 text-sm text-muted-foreground">
            L’ensemble des contenus (textes, visuels, marques) est protégé. Toute reproduction est interdite sans
            autorisation.
          </div>

          <div className="mt-8 text-sm font-medium tracking-tight">Marques & compatibilité</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Les marques citées (ex. MagSafe) appartiennent à leurs propriétaires respectifs. Impexo est une marque
            indépendante et n’est pas affiliée à Apple Inc. Les produits indiqués comme “compatibles MagSafe” le sont à
            titre informatif.
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}

