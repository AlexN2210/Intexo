import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxGlow() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 90]);
  const opacity = useTransform(scrollY, [0, 700], [0.35, 0]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.10),transparent_60%)]"
      style={{ y, opacity }}
    />
  );
}

