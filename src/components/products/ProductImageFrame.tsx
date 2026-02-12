import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ProductImageFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        // Pas de "bloc dans bloc": pas de bordure interne, juste une ambiance studio.
        "relative overflow-hidden rounded-3xl",
        "impexo-studio ring-1 ring-black/5",
        className,
      )}
    >
      {/* overlays très légers (on garde le fond blanc pur dominant) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_16%,rgba(255,255,255,0.55),transparent_55%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

