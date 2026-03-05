import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";

const LEGAL_PAGES = [
  { slug: "legal", label: "Mentions légales | CGV | Politique de confidentialité" },
  { slug: "retours-retractation", label: "Retours & rétractation" },
] as const;

const BASE = "/mentions-legales";

export default function Legal() {
  return (
    <div className="min-h-screen bg-background">
      <Container className="py-10 sm:py-14 lg:py-16">
        <FadeIn>
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">INFORMATIONS</div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight sm:mt-3 sm:text-2xl lg:text-3xl">
              Mentions légales & informations
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Consultez les documents ci-dessous. Chaque lien s’ouvre dans un nouvel onglet.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-2 lg:gap-4">
            {LEGAL_PAGES.map(({ slug, label }) => (
              <li key={slug}>
                <a
                  href={`${BASE}/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-medium transition-colors hover:bg-muted/50 sm:rounded-3xl sm:p-5"
                >
                  <span className="flex-1">{label}</span>
                  <span className="text-muted-foreground" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Container>
    </div>
  );
}
