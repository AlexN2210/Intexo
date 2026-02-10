import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <Container className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium tracking-tight">Impexo</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Coques d’iPhone haut de gamme — minimalisme, finesse, luxe.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <a className="hover:text-foreground" href="/boutique">
            Boutique
          </a>
          <a className="hover:text-foreground" href="/contact">
            Support
          </a>
          <span className="hidden md:inline">•</span>
          <span>© {new Date().getFullYear()} Impexo</span>
        </div>
      </Container>
    </footer>
  );
}

