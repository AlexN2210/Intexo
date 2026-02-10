import { motion, type MotionProps } from "framer-motion";
import type { PropsWithChildren } from "react";

export function FadeIn({
  children,
  delay = 0,
  className,
  ...props
}: PropsWithChildren<{ delay?: number; className?: string } & MotionProps>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

