import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useCartStore } from "@/store/cartStore";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

export function Layout() {
  const refresh = useCartStore((s) => s.refresh);

  // Charger le panier après un court délai pour éviter le burst cart+products (rate limit)
  useEffect(() => {
    const t = setTimeout(() => {
      refresh().catch((error) => {
        console.error("[Layout] Erreur lors du chargement initial du panier:", error);
      });
    }, 500);
    return () => clearTimeout(t);
  }, [refresh]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

