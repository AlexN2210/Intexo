import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export function Container({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl min-w-0",
        "px-8 sm:px-10 md:px-12 lg:px-14 impexo-safe-x",
        className,
      )}
    >
      {children}
    </div>
  );
}
