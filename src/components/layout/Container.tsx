import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export function Container({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl min-w-0",
        "px-6 sm:px-8 md:px-10 lg:px-12 impexo-safe-x",
        className,
      )}
    >
      {children}
    </div>
  );
}
