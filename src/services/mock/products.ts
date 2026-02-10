import type { WooProduct } from "@/types/woocommerce";

const base = "/placeholder.svg";

export const mockProducts: WooProduct[] = [
  {
    id: 1001,
    name: "Coque Impexo Noir Obsidienne",
    slug: "coque-impexo-noir-obsidienne",
    type: "simple",
    description:
      "<p>Finition noire profonde, toucher soft premium, protection fine.</p><p>Conçue pour sublimer l’iPhone, sans le surcharger.</p>",
    short_description: "<p>Noir profond. Toucher soft. Protection fine.</p>",
    price: "79",
    regular_price: "79",
    sale_price: "",
    on_sale: false,
    images: [{ id: 1, src: base, alt: "Coque Impexo noir obsidienne" }],
    attributes: [
      { id: 1, name: "Modèle", visible: true, variation: false, options: ["iPhone 15 Pro", "iPhone 15 Pro Max"] },
      { id: 2, name: "Couleur", visible: true, variation: false, options: ["Noir"] },
      { id: 3, name: "Matériau", visible: true, variation: false, options: ["Polycarbonate premium"] },
    ],
    variations: [],
    categories: [{ id: 1, name: "Best-sellers", slug: "best-sellers" }],
    stock_status: "instock",
  },
  {
    id: 1002,
    name: "Coque Impexo Argent Satin",
    slug: "coque-impexo-argent-satin",
    type: "simple",
    description:
      "<p>Reflets satinés subtils, bordures affleurantes, sensation métal.</p><p>Minimalisme, élégance, précision.</p>",
    short_description: "<p>Argent satiné. Reflets subtils. Luxe discret.</p>",
    price: "89",
    regular_price: "89",
    sale_price: "",
    on_sale: false,
    images: [{ id: 2, src: base, alt: "Coque Impexo argent satiné" }],
    attributes: [
      { id: 1, name: "Modèle", visible: true, variation: false, options: ["iPhone 15", "iPhone 15 Pro"] },
      { id: 2, name: "Couleur", visible: true, variation: false, options: ["Argent"] },
      { id: 3, name: "Matériau", visible: true, variation: false, options: ["Aluminium anodisé"] },
    ],
    variations: [],
    categories: [{ id: 2, name: "Nouveautés", slug: "nouveautes" }],
    stock_status: "instock",
  },
  {
    id: 1003,
    name: "Coque Impexo Gris Premium",
    slug: "coque-impexo-gris-premium",
    type: "simple",
    description:
      "<p>Gris premium, texture micro-mate, élégance intemporelle.</p><p>Protection quotidienne, sensation haut de gamme.</p>",
    short_description: "<p>Gris premium. Micro-mate. Intemporel.</p>",
    price: "79",
    regular_price: "79",
    sale_price: "",
    on_sale: false,
    images: [{ id: 3, src: base, alt: "Coque Impexo gris premium" }],
    attributes: [
      { id: 1, name: "Modèle", visible: true, variation: false, options: ["iPhone 14 Pro", "iPhone 15 Pro"] },
      { id: 2, name: "Couleur", visible: true, variation: false, options: ["Gris"] },
      { id: 3, name: "Matériau", visible: true, variation: false, options: ["Silicone premium"] },
    ],
    variations: [],
    categories: [{ id: 1, name: "Best-sellers", slug: "best-sellers" }],
    stock_status: "instock",
  },
  {
    id: 1004,
    name: "Coque Impexo Blanc Pur",
    slug: "coque-impexo-blanc-pur",
    type: "simple",
    description:
      "<p>Blanc pur, lignes nettes, minimalisme absolu.</p><p>Conçue pour celles et ceux qui aiment l’essentiel.</p>",
    short_description: "<p>Blanc pur. Minimalisme absolu.</p>",
    price: "79",
    regular_price: "79",
    sale_price: "",
    on_sale: false,
    images: [{ id: 4, src: base, alt: "Coque Impexo blanc pur" }],
    attributes: [
      { id: 1, name: "Modèle", visible: true, variation: false, options: ["iPhone 15", "iPhone 15 Plus"] },
      { id: 2, name: "Couleur", visible: true, variation: false, options: ["Blanc"] },
      { id: 3, name: "Matériau", visible: true, variation: false, options: ["Silicone premium"] },
    ],
    variations: [],
    categories: [{ id: 3, name: "Essentiels", slug: "essentiels" }],
    stock_status: "instock",
  },
];

