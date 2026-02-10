import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="max-w-lg text-center">
          <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">IMPEXO</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">404</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Cette page n’existe pas (ou a été déplacée). Retournez à l’essentiel.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-6">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full px-6">
              <Link to="/boutique">Aller à la boutique</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
