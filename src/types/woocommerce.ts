export type WooImage = {
  id: number;
  src: string;
  alt: string;
  name?: string;
};

export type WooAttribute = {
  id: number;
  name: string;
  slug?: string;
  visible: boolean;
  variation: boolean;
  options: string[];
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable" | string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  images: WooImage[];
  attributes: WooAttribute[];
  variations: number[];
  categories: WooCategory[];
  stock_status: "instock" | "outofstock" | "onbackorder" | string;
};

export type WooVariationAttribute = {
  id: number;
  name: string;
  option: string;
};

export type WooVariation = {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  image?: WooImage;
  attributes: WooVariationAttribute[];
  stock_status: "instock" | "outofstock" | "onbackorder" | string;
  sku?: string; // SKU (référence produit) pour identifier la série
};

