import { NavLink } from "@/components/NavLink";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { selectCartCount, useCartStore } from "@/store/cartStore";
import { Menu, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const cartCount = useCartStore((s) => selectCartCount(s.items));
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !isScrolled;
  const headerClassName = cn(
    isHome ? "fixed left-0 right-0 top-0" : "sticky top-0",
    "z-50 transition-colors duration-300",
    transparent
      ? "border-b border-transparent bg-transparent"
      : "border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70",
  );

  const navBase = cn(
    "rounded-full px-3 py-2 text-sm transition",
    transparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
  );
  const navActive = transparent ? "text-white bg-white/10" : "text-foreground bg-muted";

  return (
    <header className={headerClassName}>
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="group -mt-0.5 flex flex-col leading-none">
            <div className={cn("text-base font-semibold tracking-tight sm:text-lg", transparent ? "text-white" : "")}>
              Impexo
            </div>
            <div className={cn("mt-1 text-[11px]", transparent ? "text-white/65" : "text-muted-foreground")}>
              Coques iPhone haut de gamme
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex md:pt-0.5">
            <NavLink
              to="/"
              className={navBase}
              activeClassName={navActive}
            >
              Accueil
            </NavLink>
            <NavLink
              to="/boutique"
              className={navBase}
              activeClassName={navActive}
            >
              Boutique
            </NavLink>
            <NavLink
              to="/contact"
              className={navBase}
              activeClassName={navActive}
            >
              Support
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Menu mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "rounded-full",
                    transparent ? "text-white hover:bg-white/10 hover:text-white" : "",
                  )}
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle>Impexo</SheetTitle>
                </SheetHeader>
                <div className="mt-8 grid gap-2">
                  {[
                    { to: "/", label: "Accueil" },
                    { to: "/boutique", label: "Boutique" },
                    { to: "/panier", label: "Panier" },
                    { to: "/contact", label: "Support" },
                  ].map((l) => (
                    <SheetClose asChild key={l.to}>
                      <Link
                        to={l.to}
                        className="rounded-2xl border bg-background px-4 py-3 text-sm font-medium tracking-tight hover:bg-muted"
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <div className="mt-10 text-xs text-muted-foreground">
                  Coques d’iPhone haut de gamme — sobriété, finesse, luxe.
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Button
            asChild
            variant="ghost"
            className={cn("relative overflow-visible rounded-full", transparent ? "text-white hover:bg-white/10 hover:text-white" : "")}
          >
            <Link to="/panier" aria-label="Aller au panier" className="relative inline-flex overflow-visible">
              <ShoppingBag className="h-4 w-4" />
              <span className="sr-only">Panier</span>
              <span
                className={cn(
                  "pointer-events-none absolute -right-0.5 -top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1",
                  "text-[11px] font-semibold leading-none",
                  cartCount > 0 ? "opacity-100" : "opacity-0",
                  transparent ? "bg-white text-black" : "bg-foreground text-background",
                )}
              >
                {cartCount}
              </span>
            </Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

