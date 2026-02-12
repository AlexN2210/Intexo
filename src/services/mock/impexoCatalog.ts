import type { WooProduct, WooVariation } from "@/types/woocommerce";

const IMG_BASE = "/IMPEXO-IPHONE 17 SERIES12-31";

function eur(value: string): string {
  // "14,90 €" -> "14.90"
  return value.replace(/\s*€\s*/g, "").trim().replace(",", ".");
}

const frColorMap: Record<string, string> = {
  White: "Blanc",
  Black: "Noir",
  Green: "Vert",
  Pink: "Rose",
  Transparent: "Transparent",
  Gray: "Gris",
  Grey: "Gris",
  Yellow: "Jaune",
  Purple: "Violet",
  Blue: "Bleu",
  "Dark Blue": "Bleu nuit",
  "Dark Green": "Vert sombre",
  "Desert Gold": "Or désert",
  Orange: "Orange",
  Silver: "Argent",
  Red: "Rouge",
  Gold: "Or",
  "Rose Gold": "Or rose",
  Golden: "Doré",
  Brown: "Marron",
  "Wine Red": "Bordeaux",
  Fushcia: "Fuchsia",
  "Denim Blue": "Bleu denim",
};

function frColor(color: string) {
  return frColorMap[color] ?? color;
}

type Variant = {
  model: "iPhone 17" | "iPhone 17 Air" | "iPhone 17 Pro" | "iPhone 17 Pro Max";
  color: string;
  material: string;
  priceEUR: string; // "14,90"
  imageFile?: string;
};

type ProductDef = {
  code: string; // JOJO1015-1
  title: string;
  variants: Variant[];
  // image de fallback si une variante n'a pas d'image
  fallbackImageFile?: string;
};

type Marketing = {
  name: string; // nom affiché (sans JOJO)
  tagline: string; // courte phrase marketing
  story: string; // paragraphe marketing
  highlights: string[];
};

const marketingByCode: Record<string, Marketing> = {
  "JOJO1015-1": {
    name: "Impexo — Camera Shield",
    tagline: "Protection caméra intégrée. Silhouette fine.",
    story:
      "Protection caméra intégrée et lignes nettes, pour une présence premium sans épaisseur inutile. Une prise en main sûre, un rendu propre, au quotidien.",
    highlights: ["Protection caméra intégrée", "Profil fin", "Toucher premium"],
  },
  "JOJO1015-2": {
    name: "Impexo — Crystal Clear",
    tagline: "Transparence pure. Finition nette.",
    story:
      "Une transparence qui respecte le design, sans effet “plastique”. La finition reste nette, la coque se fait oublier — l’allure, elle, reste.",
    highlights: ["Transparence premium", "Rendu net", "Protection quotidienne"],
  },
  "JOJO1015-3": {
    name: "Impexo — Camera Shield Plus",
    tagline: "Caméra protégée. Détail signature.",
    story:
      "La protection caméra devient un détail de design. Toucher souple, lignes maîtrisées : un style affirmé, toujours minimaliste.",
    highlights: ["Protection caméra", "Toucher souple", "Détails maîtrisés"],
  },
  "JOJO1015-4": {
    name: "Impexo — Crystal Acrylic",
    tagline: "Acrylique premium. Transparence maîtrisée.",
    story:
      "Acrylique premium et contours confort, pour une transparence plus “studio”. L’allure reste propre, la prise en main reste sûre.",
    highlights: ["Acrylique + TPU", "Transparence premium", "Tenue impeccable"],
  },
  "JOJO1015-5": {
    name: "Impexo — LensGuard Signature",
    tagline: "Protection des optiques. Finition signature.",
    story:
      "Une protection pensée pour la zone caméra, avec un rendu net et une finition soignée. Le luxe ici, c’est la précision.",
    highlights: ["Protection des optiques", "Finition soignée", "Rendu premium"],
  },
  "JOJO1015-6": {
    name: "Impexo — Magnétique (compatible MagSafe)",
    tagline: "Technologie magnétique compatible MagSafe. Maintien net.",
    story:
      "Pensée pour un usage fluide : maintien magnétique et silhouette épurée. Un geste simple, une sensation précise.",
    highlights: ["Compatible MagSafe", "Maintien magnétique", "Silhouette épurée"],
  },
  "JOJO1015-7": {
    name: "Impexo — Armour Hybrid",
    tagline: "Hybride structurée. Protection maîtrisée.",
    story:
      "Structure et confort réunis : une protection plus présente, mais toujours propre au regard. L’équilibre entre robustesse et finesse.",
    highlights: ["PC+TPU", "Protection structurée", "Finition mate"],
  },
  "JOJO1015-8": {
    name: "Impexo — Soft TPU",
    tagline: "Toucher velours. Minimalisme quotidien.",
    story:
      "Une sensation douce en main et une finition propre. La coque du quotidien, pensée comme un objet premium.",
    highlights: ["TPU soft-touch", "Confort en main", "Finition premium"],
  },
  "JOJO1015-9": {
    name: "Impexo — Camera Shield Essential",
    tagline: "Protection caméra. Essentiel premium.",
    story:
      "Une protection caméra propre, un profil fin, un style sobre. Tout ce qu’il faut — rien de trop.",
    highlights: ["Protection caméra", "Profil fin", "Style sobre"],
  },
  "JOJO1015-10": {
    name: "Impexo — Camera Shield Air",
    tagline: "Lignes nettes. Caméra protégée.",
    story:
      "Une esthétique précise, une protection caméra intégrée et un rendu premium. Simple, mais parfaitement exécuté.",
    highlights: ["Protection caméra", "Finition nette", "Toucher premium"],
  },
  "JOJO1015-11": {
    name: "Impexo — Magnétique Signature (compatible MagSafe)",
    tagline: "Technologie magnétique compatible MagSafe. Style signature.",
    story:
      "Fixation magnétique fluide, silhouette épurée, détails premium. Une signature sobre, pensée pour durer.",
    highlights: ["Compatible MagSafe", "Silhouette épurée", "Détails premium"],
  },
  "JOJO1015-12": {
    name: "Impexo — Matte Studio",
    tagline: "Finition mate. Sobriété absolue.",
    story:
      "Une finition mate élégante, sans reflets superflus. Toucher velours, lignes propres, allure premium.",
    highlights: ["Finition mate", "Toucher velours", "Style minimaliste"],
  },
  "JOJO1015-13": {
    name: "Impexo — Camera Shield PC",
    tagline: "Rigide et nette. Caméra protégée.",
    story:
      "Une coque rigide au rendu net, avec protection caméra intégrée. Un style précis, sans compromis.",
    highlights: ["PC rigide", "Protection caméra", "Rendu net"],
  },
  "JOJO1015-14": {
    name: "Impexo — Hybrid Studio",
    tagline: "Hybride TPU + PC. Équilibre parfait.",
    story:
      "Structure et confort : une hybridation TPU/PC pour un rendu net et une tenue fiable. Finitions soignées.",
    highlights: ["Hybride TPU+PC", "Confort", "Protection structurée"],
  },
  "JOJO1015-15": {
    name: "Impexo — Grip Texture",
    tagline: "Texture grip subtile. Contrôle premium.",
    story:
      "Une texture discrète, pensée pour sécuriser la prise en main. Contrôle, confort et élégance — sans effet “tech”.",
    highlights: ["Texture grip", "PC+TPU", "Confort en main"],
  },
  "JOJO1015-16": {
    name: "Impexo — Denim Leather",
    tagline: "Texture denim. Luxe tactile.",
    story:
      "Une finition textile premium au toucher unique. Pour celles et ceux qui veulent une élégance différente, plus tactile.",
    highlights: ["TPU + denim", "Toucher unique", "Style premium"],
  },
  "JOJO1015-17": {
    name: "Impexo — Rigide Classique",
    tagline: "Classique premium. Lignes propres.",
    story:
      "Une coque rigide au style intemporel. Rendu propre, protection quotidienne, sensation premium.",
    highlights: ["Protection quotidienne", "Look sobre", "Finition premium"],
  },
  "JOJO1015-18": {
    name: "Impexo — Metal Edge Ring",
    tagline: "Contour métal. Anneau intégré.",
    story:
      "Détails métalliques précis et anneau intégré. Fonctionnel, mais toujours élégant.",
    highlights: ["PC+Metal", "Anneau intégré", "Détails métal"],
  },
  "JOJO1015-19": {
    name: "Impexo — LensGuard Pro",
    tagline: "Protection des optiques. Présence luxe.",
    story:
      "Une protection des optiques plus marquée, avec une finition premium. Présence affirmée, lignes maîtrisées.",
    highlights: ["Protection caméra", "Finition premium", "Style affirmé"],
  },
  "JOJO1015-20": {
    name: "Impexo — TPU Studio",
    tagline: "Simple. Premium. Précise.",
    story:
      "Une coque TPU épurée, confortable et nette. Le minimalisme, exécuté avec précision.",
    highlights: ["TPU", "Confort", "Minimalisme"],
  },
  "JOJO1015-21": {
    name: "Impexo — Magnétique Luxe (compatible MagSafe)",
    tagline: "Compatible MagSafe. Détails luxe.",
    story:
      "Compatible MagSafe, pensée pour une expérience sans friction. Maintien précis, silhouette premium.",
    highlights: ["Compatible MagSafe", "Maintien précis", "Style épuré"],
  },
  "JOJO1015-22": {
    name: "Impexo — Metal Frame Ring",
    tagline: "Cadre métal. Anneau intégré.",
    story:
      "Cadre métal et anneau intégré, pour une finition plus luxueuse. Détails précis, rendu premium.",
    highlights: ["Cadre métal", "Anneau intégré", "Finitions luxe"],
  },
  "JOJO1015-23": {
    name: "Impexo — Metal Frame",
    tagline: "Cadre luxe. Silhouette nette.",
    story:
      "Un cadre plus luxueux, une silhouette plus nette. Protection pensée pour rester élégante, partout.",
    highlights: ["Finition luxe", "Silhouette nette", "Protection premium"],
  },
  "JOJO1015-24": {
    name: "Impexo — Crystal Luxe",
    tagline: "Transparence luxe. Détails lumineux.",
    story:
      "Transparence premium et détails lumineux, dosés avec justesse. Chic, sans excès.",
    highlights: ["Détails lumineux", "TPU premium", "Look luxe"],
  },
  "JOJO1015-25": {
    name: "Impexo — Crystal Luxe+",
    tagline: "Transparence luxe. Finition premium.",
    story:
      "Transparence haut de gamme, finitions premium. Une coque élégante, partout.",
    highlights: ["Transparence premium", "Finition luxe", "Protection quotidienne"],
  },
};

const defs: ProductDef[] = [
  {
    code: "JOJO1015-1",
    title: "Camera Protection Case #1",
    fallbackImageFile: "JOJO1015-1.JPG",
    variants: [
      { model: "iPhone 17", color: "White", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-1.JPG" },
      { model: "iPhone 17 Air", color: "Black", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-1AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Green", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-1P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Pink", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-1PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-2",
    title: "Transparent TPU",
    fallbackImageFile: "JOJO1015-2.JPG",
    variants: [
      { model: "iPhone 17", color: "Transparent", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-2.JPG" },
      { model: "iPhone 17 Air", color: "Gray", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-2AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Yellow", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-2P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "TPU", priceEUR: "14,90", imageFile: "JOJO1015-2PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-15",
    title: "Anti-slip Texture Case",
    fallbackImageFile: "JOJO1015-15P.JPG",
    variants: [
      { model: "iPhone 17 Pro", color: "Dark Blue", material: "PC+TPU", priceEUR: "17,90", imageFile: "JOJO1015-15P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Pink", material: "PC+TPU", priceEUR: "17,90", imageFile: "JOJO1015-15PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-22",
    title: "Luxury Metal Frame + Ring",
    fallbackImageFile: "JOJO1015-22.JPG",
    variants: [
      { model: "iPhone 17", color: "Purple", material: "PC+Metal", priceEUR: "17,90", imageFile: "JOJO1015-22.JPG" },
      { model: "iPhone 17 Air", color: "Grey", material: "PC+Metal", priceEUR: "17,90", imageFile: "JOJO1015-22AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Desert Gold", material: "PC+Metal", priceEUR: "17,90", imageFile: "JOJO1015-22P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Orange", material: "PC+Metal", priceEUR: "17,90", imageFile: "JOJO1015-22PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-3",
    title: "Camera Protection Case #2",
    fallbackImageFile: "JOJO1015-3.jpg",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "17,90", imageFile: "JOJO1015-3.jpg" },
      { model: "iPhone 17 Air", color: "Blue", material: "TPU", priceEUR: "17,90", imageFile: "JOJO1015-3AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Red", material: "TPU", priceEUR: "17,90", imageFile: "JOJO1015-3P.jpg" },
      { model: "iPhone 17 Pro Max", color: "Grey", material: "TPU", priceEUR: "17,90", imageFile: "JOJO1015-3PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-4",
    title: "Transparent Acrylic + TPU",
    fallbackImageFile: "JOJO1015-4.JPG",
    variants: [
      { model: "iPhone 17", color: "Transparent", material: "Acrylic+TPU", priceEUR: "17,90", imageFile: "JOJO1015-4.JPG" },
      { model: "iPhone 17 Air", color: "Transparent", material: "Acrylic+TPU", priceEUR: "17,90", imageFile: "JOJO1015-4AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Transparent", material: "Acrylic+TPU", priceEUR: "17,90", imageFile: "JOJO1015-4P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Transparent", material: "Acrylic+TPU", priceEUR: "17,90", imageFile: "JOJO1015-4PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-5",
    title: "Camera Protection Case #3",
    fallbackImageFile: "JOJO1015-5AIR.jpg",
    variants: [
      // Pas d'image iPhone 17 détectée dans le dossier : fallback sur AIR.
      { model: "iPhone 17", color: "Silver", material: "TPU", priceEUR: "17,90", imageFile: "JOJO1015-5AIR.jpg" },
      { model: "iPhone 17 Air", color: "Black", material: "TPU", priceEUR: "17,90", imageFile: "JOJO1015-5AIR.jpg" },
      { model: "iPhone 17 Pro", color: "Blue", material: "TPU", priceEUR: "19,90", imageFile: "JOJO1015-5P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Pink", material: "TPU", priceEUR: "19,90", imageFile: "JOJO1015-5PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-6",
    title: "Technologie magnétique compatible MagSafe",
    fallbackImageFile: "JOJO1015-6.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "PC", priceEUR: "19,90", imageFile: "JOJO1015-6.JPG" },
      { model: "iPhone 17 Air", color: "Dark Green", material: "PC", priceEUR: "19,90", imageFile: "JOJO1015-6AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Blue", material: "PC", priceEUR: "22,90", imageFile: "JOJO1015-6P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Gold", material: "PC", priceEUR: "22,90", imageFile: "JOJO1015-6PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-18",
    title: "Metal Edge TPU + Ring",
    fallbackImageFile: "JOJO1015-18.JPG",
    variants: [
      { model: "iPhone 17", color: "Silver", material: "PC+Metal", priceEUR: "19,90", imageFile: "JOJO1015-18.JPG" },
      { model: "iPhone 17 Air", color: "Rose Gold", material: "PC+Metal", priceEUR: "19,90", imageFile: "JOJO1015-18AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Black", material: "PC+Metal", priceEUR: "19,90", imageFile: "JOJO1015-18P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Dark Green", material: "PC+Metal", priceEUR: "19,90", imageFile: "JOJO1015-18PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-7",
    title: "Hard PC Case",
    fallbackImageFile: "JOJO1015-7.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "PC+TPU", priceEUR: "22,90", imageFile: "JOJO1015-7.JPG" },
      { model: "iPhone 17 Air", color: "Green", material: "PC+TPU", priceEUR: "22,90", imageFile: "JOJO1015-7AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Pink", material: "PC+TPU", priceEUR: "22,90", imageFile: "JOJO1015-7P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "PC+TPU", priceEUR: "22,90", imageFile: "JOJO1015-7PM.jpg" },
    ],
  },
  {
    code: "JOJO1015-8",
    title: "TPU Case",
    fallbackImageFile: "JOJO1015-8.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-8.JPG" },
      { model: "iPhone 17 Air", color: "Silver", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-8AIR.jpg" },
      { model: "iPhone 17 Pro", color: "Dark Green", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-8P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-8PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-9",
    title: "Camera Protection Case #1",
    fallbackImageFile: "JOJO1015-9.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-9.JPG" },
      { model: "iPhone 17 Air", color: "Pink", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-9AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Blue", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-9P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Silver", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-9PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-10",
    title: "Camera Protection Case #2",
    fallbackImageFile: "JOJO1015-10.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-10.JPG" },
      { model: "iPhone 17 Air", color: "Blue", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-10AIR.JPG" },
      { model: "iPhone 17 Pro", color: "White", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-10P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-10PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-11",
    title: "Technologie magnétique compatible MagSafe",
    fallbackImageFile: "JOJO1015-11.jpg",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-11.jpg" },
      { model: "iPhone 17 Air", color: "White", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-11AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Desert Gold", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-11P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Blue", material: "TPU", priceEUR: "22,90", imageFile: "JOJO1015-11PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-12",
    title: "Matte Case",
    fallbackImageFile: "JOJO1015-12.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-12.JPG" },
      { model: "iPhone 17 Air", color: "Pink", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-12AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Purple", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-12P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Brown", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-12PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-13",
    title: "Camera Protection Case #3 (PC)",
    fallbackImageFile: "JOJO1015-13.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "PC", priceEUR: "24,90", imageFile: "JOJO1015-13.JPG" },
      { model: "iPhone 17 Air", color: "Red", material: "PC", priceEUR: "24,90", imageFile: "JOJO1015-13AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Purple", material: "PC", priceEUR: "24,90", imageFile: "JOJO1015-13P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Blue", material: "PC", priceEUR: "24,90", imageFile: "JOJO1015-13PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-14",
    title: "TPU + PC Case",
    fallbackImageFile: "JOJO1015-14.JPG",
    variants: [
      { model: "iPhone 17", color: "Golden", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-14.JPG" },
      { model: "iPhone 17 Air", color: "Black", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-14AIR.jpg" },
      { model: "iPhone 17 Pro", color: "Pink", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-14P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Red", material: "TPU", priceEUR: "24,90", imageFile: "JOJO1015-14PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-16",
    title: "PU Leather #1 (Jean)",
    fallbackImageFile: "JOJO1015-16.JPG",
    variants: [
      { model: "iPhone 17", color: "Denim Blue", material: "TPU+Jean", priceEUR: "26,90", imageFile: "JOJO1015-16.JPG" },
      { model: "iPhone 17 Air", color: "Black", material: "TPU+Jean", priceEUR: "26,90", imageFile: "JOJO1015-16AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Grey", material: "TPU+Jean", priceEUR: "26,90", imageFile: "JOJO1015-16P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Brown", material: "TPU+Jean", priceEUR: "26,90", imageFile: "JOJO1015-16PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-17",
    title: "Hard PC Case",
    fallbackImageFile: "JOJO1015-17.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-17.JPG" },
      { model: "iPhone 17 Air", color: "Pink", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-17AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Blue", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-17P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-17PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-19",
    title: "Camera Protection Case #4",
    fallbackImageFile: "JOJO1015-19.JPG",
    variants: [
      { model: "iPhone 17", color: "Brown", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-19.JPG" },
      { model: "iPhone 17 Air", color: "Silver", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-19AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Red", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-19P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-19PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-20",
    title: "TPU Case",
    fallbackImageFile: "JOJO1015-20.JPG",
    variants: [
      { model: "iPhone 17", color: "Wine Red", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-20.JPG" },
      { model: "iPhone 17 Air", color: "Dark Green", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-20AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Pink", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-20P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "TPU", priceEUR: "26,90", imageFile: "JOJO1015-20PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-21",
    title: "Technologie magnétique compatible MagSafe",
    fallbackImageFile: "JOJO1015-21.JPG",
    variants: [
      { model: "iPhone 17", color: "Fushcia", material: "PC", priceEUR: "26,90", imageFile: "JOJO1015-21.JPG" },
      { model: "iPhone 17 Air", color: "Black", material: "PC", priceEUR: "26,90", imageFile: "JOJO1015-21AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Purple", material: "PC", priceEUR: "26,90", imageFile: "JOJO1015-21P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Yellow", material: "PC", priceEUR: "26,90", imageFile: "JOJO1015-21PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-23",
    title: "Luxury Metal Frame",
    fallbackImageFile: "JOJO1015-23.JPG",
    variants: [
      { model: "iPhone 17", color: "Black", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-23.JPG" },
      { model: "iPhone 17 Air", color: "Brown", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-23AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Grey", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-23P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Blue", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-23PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-24",
    title: "Luxury Transparent #2",
    fallbackImageFile: "JOJO1015-24.JPG",
    variants: [
      { model: "iPhone 17", color: "Silver", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-24.JPG" },
      { model: "iPhone 17 Air", color: "Pink", material: "TPU+Rhinestone", priceEUR: "29,90", imageFile: "JOJO1015-24AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Blue", material: "TPU+Rhinestone", priceEUR: "29,90", imageFile: "JOJO1015-24P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Purple", material: "TPU+Rhinestone", priceEUR: "29,90", imageFile: "JOJO1015-24PM.JPG" },
    ],
  },
  {
    code: "JOJO1015-25",
    title: "Luxury Transparent #3",
    fallbackImageFile: "JOJO1015-25.JPG",
    variants: [
      { model: "iPhone 17", color: "Silver", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-25.JPG" },
      { model: "iPhone 17 Air", color: "Black", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-25AIR.JPG" },
      { model: "iPhone 17 Pro", color: "Gold", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-25P.JPG" },
      { model: "iPhone 17 Pro Max", color: "Red", material: "TPU", priceEUR: "29,90", imageFile: "JOJO1015-25PM.JPG" },
    ],
  },
];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[#]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function imgPath(file?: string) {
  if (!file) return "/placeholder.svg";
  return `${IMG_BASE}/${file}`;
}

export const impexoMockVariationsByProductId: Record<number, WooVariation[]> = {};
export const impexoMockSlugByCode: Record<string, string> = {};

export const impexoMockProducts: WooProduct[] = defs.map((d, idx) => {
  const id = 5000 + idx;
  const marketing = marketingByCode[d.code];
  const name = marketing?.name ?? d.title;
  const suffix = d.code.split("-")[1] || String(idx + 1);
  const slug = `${slugify(name)}-${suffix}`;
  impexoMockSlugByCode[d.code] = slug;

  const models = Array.from(new Set(d.variants.map((v) => v.model)));
  const colors = Array.from(new Set(d.variants.map((v) => frColor(v.color))));
  const materials = Array.from(new Set(d.variants.map((v) => v.material)));

  const variationList: WooVariation[] = d.variants.map((v, i) => {
    const vid = id * 100 + (i + 1);
    const c = frColor(v.color);
    return {
      id: vid,
      price: eur(v.priceEUR),
      regular_price: eur(v.priceEUR),
      sale_price: "",
      on_sale: false,
      image: { id: vid, src: imgPath(v.imageFile ?? d.fallbackImageFile), alt: `${name} — ${v.model} — ${c}` },
      attributes: [
        { id: 1, name: "Modèle", option: v.model },
        { id: 2, name: "Couleur", option: c },
        { id: 3, name: "Matériau", option: v.material },
      ],
      stock_status: "instock",
    };
  });

  impexoMockVariationsByProductId[id] = variationList;

  const prices = variationList.map((vv) => Number(vv.price)).filter((n) => Number.isFinite(n));
  const minPrice = prices.length ? Math.min(...prices) : 0;

  const heroImage = variationList[0]?.image?.src ?? imgPath(d.fallbackImageFile);

  return {
    id,
    name,
    slug,
    type: "variable",
    description: `<p><strong>${marketing?.name ?? d.title}</strong></p><p>${marketing?.story ?? "Finitions premium, design minimaliste, pensé pour une expérience élégante."}</p><ul>${(marketing?.highlights ?? ["Finition premium", "Design minimaliste", "Protection quotidienne"]).map((h) => `<li>${h}</li>`).join("")}</ul>`,
    short_description: `<p>${marketing?.tagline ?? d.title}</p>`,
    price: String(minPrice.toFixed(2)),
    regular_price: String(minPrice.toFixed(2)),
    sale_price: "",
    on_sale: false,
    images: [{ id: id, src: heroImage, alt: name }],
    attributes: [
      { id: 1, name: "Modèle", visible: true, variation: true, options: models },
      { id: 2, name: "Couleur", visible: true, variation: true, options: colors },
      { id: 3, name: "Matériau", visible: true, variation: true, options: materials },
    ],
    variations: variationList.map((vv) => vv.id),
    categories: [{ id: 17, name: "iPhone 17 Series", slug: "iphone-17-series" }],
    stock_status: "instock",
  };
});

