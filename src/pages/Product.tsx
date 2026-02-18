import { FadeIn } from "@/components/animations/FadeIn";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProductBySlugQuery, useProductVariationsQuery } from "@/hooks/useWooProducts";
import { useCartStore } from "@/store/cartStore";
import { formatEUR, parsePrice } from "@/utils/money";
import { findMatchingVariation, getAttributeOptions } from "@/utils/productAttributes";
import { Minus, Plus, Shield, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function Product() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const [qty, setQty] = useState(1);
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [series, setSeries] = useState<string>(""); // Série (extraite du SKU)

  const q = useProductBySlugQuery(slug);
  const product = q.data ?? null;

  // Fonction de normalisation pour comparer les chaînes (définie avant son utilisation)
  const norm = (s?: string) =>
    (s ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Fonction pour extraire la série depuis le SKU (ex: "JOJO1015-24" -> "JOJO1015-24")
  const extractSeriesFromSku = (sku?: string): string => {
    if (!sku) return "";
    // Le SKU contient la série complète (ex: JOJO1015-24)
    // On peut aussi extraire depuis la référence dans les attributs si le SKU n'est pas disponible
    return sku.trim();
  };

  const hasVariations = Boolean(product && product.type === "variable" && product.variations?.length);
  const varsQ = useProductVariationsQuery(product?.id, hasVariations);
  
  // Filtrer les variations pour s'assurer qu'elles appartiennent bien à ce produit
  const variations = useMemo(() => {
    const raw = varsQ.data ?? [];
    if (!product?.id || !Array.isArray(raw)) return [];
    
    console.log(`[Product ${product.id}] 🔍 Analyse de ${raw.length} variations reçues pour "${product.name}"`);
    
    // Si le produit a une liste d'IDs de variations, utiliser seulement celles-là
    // C'est la méthode la plus fiable pour s'assurer que les variations appartiennent au bon produit
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      const validVariationIds = new Set(product.variations);
      const filtered = raw.filter((v) => {
        const isValid = validVariationIds.has(v.id);
        if (!isValid) {
          const ref = v.attributes?.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
          const m = v.attributes?.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
          const c = v.attributes?.find((a) => /couleur|color/i.test(a.name))?.option;
          console.warn(`[Product ${product.id}] ❌ Variation ${v.id} FILTRÉE (n'est pas dans la liste des variations du produit)`);
          console.warn(`  → Variation: ${m || '?'} + ${c || '?'} (Réf: ${ref || 'N/A'})`);
          console.warn(`  → IDs attendus: ${product.variations.join(', ')}`);
        }
        return isValid;
      });
      
      // Log pour debug si des variations sont filtrées
      if (filtered.length !== raw.length) {
        console.warn(`[Product ${product.id}] ⚠️  ${raw.length - filtered.length} variations filtrées sur ${raw.length}`);
        console.warn(`  → Variations conservées: ${filtered.length}`);
        console.warn(`  → IDs attendus: ${product.variations.join(', ')}`);
        console.warn(`  → IDs reçus: ${raw.map(v => v.id).join(', ')}`);
      } else {
        console.log(`[Product ${product.id}] ✅ Toutes les variations sont valides (${filtered.length} variations)`);
      }
      
      return filtered;
    }
    
    // Sinon, vérifier que les variations ont bien des attributs cohérents avec le produit
    const productAttrNames = new Set((product.attributes ?? []).map(a => norm(a.name)));
    console.log(`[Product ${product.id}] ⚠️  Pas de liste d'IDs de variations, filtrage par attributs`);
    console.log(`  → Attributs du produit: ${Array.from(productAttrNames).join(', ')}`);
    
    const filtered = raw.filter((v) => {
      // S'assurer que la variation a des attributs
      if (!v.attributes || v.attributes.length === 0) return false;
      
      // Vérifier que les noms d'attributs de la variation correspondent aux attributs du produit
      const variationAttrNames = (v.attributes ?? []).map(a => norm(a.name));
      
      // Au moins un attribut de la variation doit correspondre à un attribut du produit
      return variationAttrNames.some(vName => {
        // Vérifier correspondance exacte ou partielle
        return Array.from(productAttrNames).some(pName => {
          // Correspondance exacte
          if (vName === pName) return true;
          // Correspondance partielle (pour gérer les variations de nom)
          if (vName.includes(pName) || pName.includes(vName)) return true;
          // Vérifier les patterns communs (modèle, couleur, matériau)
          const commonPatterns = ['model', 'modèle', 'color', 'couleur', 'material', 'matériau'];
          return commonPatterns.some(pattern => vName.includes(pattern) && pName.includes(pattern));
        });
      });
    });
    
    console.log(`[Product ${product.id}] → ${filtered.length} variations conservées après filtrage par attributs`);
    
    return filtered;
  }, [varsQ.data, product?.id, product?.variations, product?.attributes, product?.name, norm]);

  const models = useMemo(() => (product ? getAttributeOptions(product, "model") : []), [product]);
  const colors = useMemo(() => (product ? getAttributeOptions(product, "color") : []), [product]);
  const materials = useMemo(() => (product ? getAttributeOptions(product, "material") : []), [product]);

  // Fonction helper pour récupérer un attribut depuis une variation
  const getAttr = (variation: typeof variations[0], name: string): string | null => {
    const attr = variation.attributes?.find((a) => norm(a.name) === norm(name));
    return attr ? attr.option : null;
  };

  // Extraire toutes les séries disponibles avec leurs labels lisibles
  const availableSeries = useMemo(() => {
    if (!hasVariations) return [];
    const seriesMap = new Map<string, { value: string; label: string; firstVariation: typeof variations[0] | null }>();
    
    variations.forEach((v) => {
      const sku = v.sku;
      let seriesValue = "";
      
      if (sku) {
        seriesValue = extractSeriesFromSku(sku);
      } else {
        // Fallback : essayer d'extraire depuis la référence dans les attributs
        const ref = v.attributes?.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
        if (ref) {
          seriesValue = extractSeriesFromSku(ref);
        }
      }
      
      if (seriesValue && !seriesMap.has(seriesValue)) {
        // Stocker la première variation de cette série pour construire le label
        seriesMap.set(seriesValue, { value: seriesValue, label: "", firstVariation: v });
      }
    });
    
    // Construire les labels pour chaque série
    const seriesArray = Array.from(seriesMap.entries()).map(([value, data]) => {
      const v = data.firstVariation;
      if (!v) {
        return { value, label: value };
      }
      
      // Récupérer les attributs humains
      const modele = getAttr(v, "Modèle");
      const couleur = getAttr(v, "Couleur");
      const reference = getAttr(v, "Référence") || value;
      
      // Construire le label : "iPhone 17 Pro Max — Violet (JOJO1015-24)"
      const labelParts = [];
      if (modele) labelParts.push(modele);
      if (couleur) labelParts.push(couleur);
      if (reference) labelParts.push(`(${reference})`);
      
      const label = labelParts.length > 0 
        ? labelParts.join(" — ") 
        : value; // Fallback sur la valeur brute si pas d'attributs
      
      return { value, label };
    });
    
    return seriesArray.sort((a, b) => a.value.localeCompare(b.value));
  }, [hasVariations, variations]);

  // Filtrer les variations par série si une série est sélectionnée
  const filteredVariationsBySeries = useMemo(() => {
    if (!hasVariations || !series) return variations;
    return variations.filter((v) => {
      const sku = v.sku;
      if (sku) {
        return extractSeriesFromSku(sku) === series;
      }
      // Fallback : utiliser la référence dans les attributs
      const ref = v.attributes?.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
      return ref && extractSeriesFromSku(ref) === series;
    });
  }, [hasVariations, variations, series]);

  const availableColorsByModel = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!hasVariations) return map;
    
    // Utiliser les variations filtrées par série si une série est sélectionnée
    const varsToUse = series ? filteredVariationsBySeries : variations;
    
    // Logger pour debug
    console.log(`[Product ${product?.id}] 📊 Construction de la carte Modèle → Couleurs depuis ${varsToUse.length} variations${series ? ` (série: ${series})` : ''}`);
    
    varsToUse.forEach((v) => {
      const m = v.attributes?.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
      const c = v.attributes?.find((a) => /couleur|color/i.test(a.name))?.option;
      const ref = v.attributes?.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
      
      if (!m || !c) {
        console.warn(`[Product ${product?.id}] ⚠️  Variation ${v.id} ignorée (modèle ou couleur manquant)`);
        return;
      }
      
      const k = norm(m);
      const list = map.get(k) ?? [];
      if (!list.some((x) => norm(x) === norm(c))) {
        list.push(c);
        console.log(`[Product ${product?.id}]   → ${m} + ${c} (Réf: ${ref || 'N/A'})`);
      } else {
        // Doublon détecté
        console.warn(`[Product ${product?.id}] ⚠️  DOUBLON détecté: ${m} + ${c} (Réf: ${ref || 'N/A'})`);
      }
      map.set(k, list);
    });
    
    // tri pour un affichage stable
    Array.from(map.entries()).forEach(([k, list]) => {
      map.set(k, [...list].sort((a, b) => a.localeCompare(b)));
    });
    
    console.log(`[Product ${product?.id}] ✅ Carte construite: ${map.size} modèles avec couleurs`);
    
    return map;
  }, [hasVariations, variations, product?.id, series, filteredVariationsBySeries]);

  const allowedColorsForSelectedModel = useMemo(() => {
    if (!hasVariations) return colors;
    const m = model || models[0];
    return (m ? availableColorsByModel.get(norm(m)) : undefined) ?? [];
  }, [hasVariations, colors, availableColorsByModel, model, models]);
  const displayedColors = useMemo(() => {
    // UX demandé: quand un modèle est sélectionné, on n'affiche que ses couleurs disponibles.
    return hasVariations ? allowedColorsForSelectedModel : colors;
  }, [hasVariations, allowedColorsForSelectedModel, colors]);

  const selected = useMemo(() => {
    return { 
      model: model || models[0], 
      color: color || undefined,
      series: series || undefined
    };
  }, [model, color, series, models]);

  // Filtrer les variations selon le modèle et la couleur sélectionnés
  const filteredVariationsByModelAndColor = useMemo(() => {
    if (!hasVariations || !selected.model || !selected.color) return [];
    
    // 1. Filtrer selon le modèle choisi
    const filteredByModel = variations.filter((v) => {
      const modele = getAttr(v, "Modèle");
      return modele === selected.model;
    });
    
    // 2. Filtrer selon la couleur choisie
    const filteredByColor = filteredByModel.filter((v) => {
      const couleur = getAttr(v, "Couleur");
      return couleur === selected.color;
    });
    
    return filteredByColor;
  }, [hasVariations, variations, selected.model, selected.color]);

  const preferredModel = searchParams.get("model") ?? "";
  const preferredColor = searchParams.get("color") ?? "";
  const preferredSeries = searchParams.get("series") ?? "";

  // Sélection initiale : prend en compte ?model= & ?color= & ?series= si possible.
  useEffect(() => {
    if (!product) return;
    
    // Initialiser la série si plusieurs variations sont disponibles pour le modèle et couleur sélectionnés
    // On attend que le modèle et la couleur soient définis avant d'initialiser la série
    if (hasVariations && filteredVariationsByModelAndColor.length > 1 && !series) {
      const firstVariation = filteredVariationsByModelAndColor[0];
      if (firstVariation) {
        const sku = firstVariation.sku;
        const seriesValue = sku ? extractSeriesFromSku(sku) : getAttr(firstVariation, "Référence");
        if (seriesValue) {
          // Vérifier si la série préférée existe dans les variations filtrées
          const preferredVariation = preferredSeries 
            ? filteredVariationsByModelAndColor.find((v) => {
                const vSku = v.sku;
                const vSeries = vSku ? extractSeriesFromSku(vSku) : getAttr(v, "Référence");
                return vSeries === preferredSeries;
              })
            : null;
          
          const initialSeriesValue = preferredVariation 
            ? (preferredVariation.sku ? extractSeriesFromSku(preferredVariation.sku) : getAttr(preferredVariation, "Référence"))
            : seriesValue;
          
          if (initialSeriesValue && initialSeriesValue !== series) {
            setSeries(initialSeriesValue);
          }
        }
      }
    }
    
    const initialModel =
      (preferredModel && models.includes(preferredModel) ? preferredModel : "") || model || models[0] || "";
    if (initialModel && initialModel !== model) setModel(initialModel);

    const allowedForModel = hasVariations ? availableColorsByModel.get(norm(initialModel)) ?? [] : colors;
    const preferred = preferredColor ? allowedForModel.find((c) => norm(c) === norm(preferredColor)) : "";
    const initialColor =
      preferred || color || allowedForModel[0] || colors[0] || "";
    if (initialColor && initialColor !== color) setColor(initialColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, models.join("|"), colors.join("|"), preferredModel, preferredColor, preferredSeries, filteredVariationsByModelAndColor]);

  // Si la couleur courante n'est pas disponible pour le modèle courant, on prend la première couleur disponible.
  useEffect(() => {
    if (!hasVariations) return;
    const m = model || models[0];
    if (!m) return;
    const allowed = availableColorsByModel.get(norm(m)) ?? [];
    if (!allowed.length) return;
    if (!color || !allowed.some((c) => norm(c) === norm(color))) {
      setColor(allowed[0]);
    }
  }, [hasVariations, model, models, availableColorsByModel, color]);

  const matchedVariation = useMemo(() => {
    if (!hasVariations) return undefined;
    if (!selected.model || !selected.color) return undefined;
    
    // Utiliser les variations filtrées par série si une série est sélectionnée
    const varsToUse = series ? filteredVariationsBySeries : variations;
    
    // Trouver toutes les variations correspondantes avec vérification stricte
    const matching = varsToUse.filter((v) => {
      const attrs = v.attributes ?? [];
      const m = attrs.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
      const c = attrs.find((a) => /couleur|color/i.test(a.name))?.option;
      
      // Vérification stricte : correspondance exacte après normalisation
      const modelMatch = m && norm(m) === norm(selected.model);
      const colorMatch = c && norm(c) === norm(selected.color);
      
      // Si une série est sélectionnée, vérifier aussi la série
      let seriesMatch = true;
      if (selected.series) {
        const sku = v.sku;
        if (sku) {
          seriesMatch = extractSeriesFromSku(sku) === selected.series;
        } else {
          // Fallback : utiliser la référence dans les attributs
          const ref = attrs.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
          seriesMatch = ref ? extractSeriesFromSku(ref) === selected.series : false;
        }
      }
      
      return modelMatch && colorMatch && seriesMatch;
    });
    
    // Si plusieurs variations correspondent, logger les détails pour debug
    if (matching.length > 1) {
      console.warn(`[Product ${product?.id}] ⚠️ PLUSIEURS VARIATIONS trouvées pour ${selected.model} + ${selected.color}:`);
      matching.forEach((v, idx) => {
        const ref = v.attributes?.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
        const img = v.image?.src || 'Pas d\'image';
        console.warn(`  ${idx + 1}. Variation ID ${v.id} (Réf: ${ref || 'N/A'}) - Image: ${img}`);
      });
      console.warn(`  → Sélection de la première variation (ID: ${matching[0].id})`);
    }
    
    // Si aucune variation ne correspond, logger pour debug
    if (matching.length === 0) {
      console.warn(`[Product ${product?.id}] ⚠️ AUCUNE variation trouvée pour ${selected.model} + ${selected.color}`);
      console.warn(`  Variations disponibles:`, variations.map(v => {
        const m = v.attributes?.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
        const c = v.attributes?.find((a) => /couleur|color/i.test(a.name))?.option;
        return `${m || '?'} + ${c || '?'}`;
      }));
    }
    
    return matching[0];
  }, [hasVariations, variations, selected, product?.id, series, filteredVariationsBySeries]);

  const fallbackVariationForModel = useMemo(() => {
    if (!hasVariations) return undefined;
    const m = selected.model;
    if (!m) return undefined;
    const mk = norm(m);
    return variations.find((v) =>
      v.attributes?.some((a) => /mod|mod[eè]le|iphone/i.test(a.name) && norm(a.option) === mk),
    );
  }, [hasVariations, variations, selected.model]);

  // Image principale : utiliser l'image de la variation correspondante, sinon fallback
  const heroImage = useMemo(() => {
    if (matchedVariation?.image?.src) {
      const ref = matchedVariation.attributes?.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
      const m = matchedVariation.attributes?.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
      const c = matchedVariation.attributes?.find((a) => /couleur|color/i.test(a.name))?.option;
      
      // Vérifier que le nom de l'image correspond à la référence et au modèle
      const imageUrl = matchedVariation.image.src;
      const imageFilename = imageUrl.split('/').pop() || '';
      const imageRef = imageFilename.split('-')[0]?.toUpperCase() || '';
      const refNormalized = ref ? ref.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
      
      // Vérifier la correspondance
      if (refNormalized && imageRef && !imageRef.includes(refNormalized) && !refNormalized.includes(imageRef)) {
        console.warn(`[Product ${product?.id}] ⚠️  INCOHERENCE DETECTEE:`);
        console.warn(`  → Variation: ${m} + ${c} (Réf: ${ref})`);
        console.warn(`  → Image URL: ${imageUrl}`);
        console.warn(`  → Référence dans l'image: ${imageRef}`);
        console.warn(`  → Référence attendue: ${refNormalized}`);
      }
      
      console.log(`[Product ${product?.id}] ✅ Image sélectionnée pour ${selected.model} + ${selected.color}:`);
      console.log(`  → Image: ${imageFilename}`);
      console.log(`  → Référence: ${ref || 'N/A'}`);
      console.log(`  → Modèle: ${m || 'N/A'}, Couleur: ${c || 'N/A'}`);
      
      return matchedVariation.image.src;
    }
    if (fallbackVariationForModel?.image?.src) {
      console.log(`[Product ${product?.id}] Image fallback (variation pour modèle): ${fallbackVariationForModel.image.src}`);
      return fallbackVariationForModel.image.src;
    }
    if (product?.images?.[0]?.src) {
      console.log(`[Product ${product?.id}] Image fallback (produit parent): ${product.images[0].src}`);
      return product.images[0].src;
    }
    return undefined;
  }, [matchedVariation, fallbackVariationForModel, product?.images, product?.id, selected.model, selected.color]);

  const price = parsePrice(
    matchedVariation?.price ??
      fallbackVariationForModel?.price ??
      product?.price ??
      product?.regular_price,
  );

  const selectedMaterial = useMemo(() => {
    // Mapping des matériaux basé sur le SKU du produit parent (depuis le CSV)
    // Les matériaux sont dans le CSV mais pas toujours importés comme attributs/meta dans WooCommerce
    const materialMapping: Record<string, string> = {
      "impexo-camera-protection": "TPU", // La plupart sont TPU, sauf JOJO1015-13 qui est PC
      "impexo-transparent": "TPU", // La plupart sont TPU, sauf JOJO1015-4 qui est Acrylic+TPU
      "impexo-luxury-transparent": "TPU", // La plupart sont TPU, sauf certaines avec TPU+Rhinestone
      "impexo-magnetic": "PC", // La plupart sont PC, sauf JOJO1015-11 qui est TPU
      "impexo-luxury-metal": "PC", // Cadre métallique
      "impexo-anti-slip-matte": "TPU", // Texture antidérapante
      "impexo-jean": "TPU", // Effet cuir/jean
      "impexo-pc-tpu": "PC + TPU", // Renforcée PC + TPU
    };
    
    // Mapping basé sur le nom du produit (pour fallback si le slug ne correspond pas)
    const materialMappingByName: Record<string, string> = {
      "protection caméra": "TPU",
      "transparente premium": "TPU",
      "luxury transparente": "TPU",
      "magnétique": "PC",
      "luxury metal": "PC",
      "texture antidérapante": "TPU",
      "effet cuir": "TPU",
      "renforcée pc": "PC + TPU",
      "pc + tpu": "PC + TPU",
    };
    
    // Mapping spécifique par référence (pour les cas particuliers)
    const materialByReference: Record<string, string> = {
      "JOJO1015-13": "PC", // impexo-camera-protection avec PC
      "JOJO1015-4": "Acrylic + TPU", // impexo-transparent avec Acrylic+TPU
      "JOJO1015-24": "TPU + Rhinestone", // impexo-luxury-transparent avec TPU+Rhinestone (pour certaines variations)
      "JOJO1015-11": "TPU", // impexo-magnetic avec TPU
    };
    
    // Fonction helper pour trouver le matériau dans les meta fields
    const findMaterialInMeta = (variation: typeof variations[0], source: string): string | null => {
      // Vérifier si meta_data existe (peut être undefined si WooCommerce ne renvoie pas les meta fields)
      if (!variation.meta_data || variation.meta_data.length === 0) {
        return null;
      }
      
      // Log tous les meta fields disponibles pour debug (seulement pour la première variation)
      if (source.includes("matchedVariation") || source.includes("variation 1865")) {
        console.log(`[Product ${product?.id}] 🔍 ${source} - Meta fields disponibles:`, variation.meta_data.map(m => `${m.key}: ${m.value}`));
      }
      
      // Chercher dans les meta fields avec plusieurs clés possibles
      const materialMetaKeys = ["material", "matériau", "_material", "_matériau", "pa_material", "pa_matériau", "attribute_material", "attribute_matériau"];
      
      for (const key of materialMetaKeys) {
        const meta = variation.meta_data.find((m) => norm(m.key) === norm(key));
        if (meta?.value) {
          const materialValue = String(meta.value);
          console.log(`[Product ${product?.id}] ✅ Matériau trouvé dans meta "${key}": ${materialValue}`);
          return materialValue;
        }
      }
      
      return null;
    };
    
    // Fonction helper pour obtenir le matériau depuis le mapping basé sur le SKU/référence
    const getMaterialFromMapping = (variation: typeof variations[0]): string | null => {
      // Log pour debug
      console.log(`[Product ${product?.id}] 🔍 Recherche matériau - Référence: "${getAttr(variation, "Référence")}", Slug produit: "${product?.slug}", Nom: "${product?.name}"`);
      
      // 1. Essayer avec la référence de la variation
      const ref = getAttr(variation, "Référence");
      if (ref && materialByReference[ref]) {
        console.log(`[Product ${product?.id}] ✅ Matériau trouvé via mapping référence "${ref}": ${materialByReference[ref]}`);
        return materialByReference[ref];
      }
      
      // 2. Essayer avec le SKU du produit parent (slug)
      if (product?.slug) {
        // Essayer avec le slug exact
        let materialFromSlug = materialMapping[product.slug];
        
        // Si pas trouvé, essayer avec des variations du slug
        if (!materialFromSlug) {
          // Essayer avec le slug sans préfixe "coque-" ou autres variations
          const slugVariations = [
            product.slug,
            product.slug.replace(/^coque-/, ''),
            product.slug.replace(/^-/, ''),
            product.slug.replace(/^impexo-/, ''), // Enlever préfixe impexo-
          ];
          
          for (const slugVar of slugVariations) {
            materialFromSlug = materialMapping[slugVar];
            if (materialFromSlug) {
              console.log(`[Product ${product?.id}] ✅ Matériau trouvé via mapping slug variation "${slugVar}": ${materialFromSlug}`);
              return materialFromSlug;
            }
          }
        } else {
          console.log(`[Product ${product?.id}] ✅ Matériau trouvé via mapping slug "${product.slug}": ${materialFromSlug}`);
          return materialFromSlug;
        }
      }
      
      // 3. Essayer avec le nom du produit (fallback)
      if (product?.name) {
        const productNameLower = product.name.toLowerCase();
        for (const [key, material] of Object.entries(materialMappingByName)) {
          if (productNameLower.includes(key)) {
            console.log(`[Product ${product?.id}] ✅ Matériau trouvé via mapping nom "${key}": ${material}`);
            return material;
          }
        }
      }
      
      return null;
    };
    
    // Fonction helper pour trouver le matériau dans les attributs (avec plusieurs patterns possibles)
    const findMaterialInAttributes = (attrs: typeof variations[0]['attributes'], source: string) => {
      if (!attrs) {
        return null;
      }
      
      // Essayer plusieurs noms possibles pour l'attribut matériau
      const materialPatterns = ["Matériau", "Material", "matériau", "material", "Matériaux", "Materials", "pa_material", "pa_matériau"];
      
      for (const pattern of materialPatterns) {
        const attr = attrs.find((a) => norm(a.name) === norm(pattern));
        if (attr?.option) {
          console.log(`[Product ${product?.id}] ✅ Matériau trouvé dans attributs avec pattern "${pattern}": ${attr.option}`);
          return attr.option;
        }
      }
      
      // Fallback : chercher avec regex
      const attr = attrs.find((a) => /mat[ée]riau|material/i.test(a.name));
      if (attr?.option) {
        console.log(`[Product ${product?.id}] ✅ Matériau trouvé dans attributs avec regex: ${attr.option}`);
        return attr.option;
      }
      
      return null;
    };
    
    // 1. Essayer de récupérer depuis les meta fields de la variation correspondante
    if (matchedVariation) {
      const materialFromMeta = findMaterialInMeta(matchedVariation, "matchedVariation (meta)");
      if (materialFromMeta) return materialFromMeta;
      
      const materialFromAttrs = findMaterialInAttributes(matchedVariation.attributes, "matchedVariation (attrs)");
      if (materialFromAttrs) return materialFromAttrs;
      
      // Essayer avec le mapping basé sur le SKU/référence
      const materialFromMapping = getMaterialFromMapping(matchedVariation);
      if (materialFromMapping) return materialFromMapping;
    }
    
    // 2. Essayer depuis la variation fallback
    if (fallbackVariationForModel) {
      const materialFromMeta = findMaterialInMeta(fallbackVariationForModel, "fallbackVariation (meta)");
      if (materialFromMeta) return materialFromMeta;
      
      const materialFromAttrs = findMaterialInAttributes(fallbackVariationForModel.attributes, "fallbackVariation (attrs)");
      if (materialFromAttrs) return materialFromAttrs;
      
      // Essayer avec le mapping basé sur le SKU/référence
      const materialFromMapping = getMaterialFromMapping(fallbackVariationForModel);
      if (materialFromMapping) return materialFromMapping;
    }
    
    // 3. Essayer depuis les attributs du produit parent
    if (materials.length > 0) {
      console.log(`[Product ${product?.id}] ✅ Matériau depuis produit parent: ${materials[0]}`);
      return materials[0];
    }
    
    // 4. Essayer de récupérer depuis toutes les variations disponibles (meta fields d'abord)
    if (variations.length > 0) {
      console.log(`[Product ${product?.id}] 🔍 Recherche dans ${variations.length} variations (meta fields puis attributs puis mapping)...`);
      for (const v of variations) {
        const materialFromMeta = findMaterialInMeta(v, `variation ${v.id} (meta)`);
        if (materialFromMeta) return materialFromMeta;
        
        const materialFromAttrs = findMaterialInAttributes(v.attributes, `variation ${v.id} (attrs)`);
        if (materialFromAttrs) return materialFromAttrs;
        
        // Essayer avec le mapping basé sur le SKU/référence
        const materialFromMapping = getMaterialFromMapping(v);
        if (materialFromMapping) return materialFromMapping;
      }
    }
    
    // 5. Fallback : utiliser le mapping basé sur le slug du produit parent
    if (product?.slug) {
      // Essayer avec le slug exact
      let materialFromSlug = materialMapping[product.slug];
      
      // Si pas trouvé, essayer avec des variations du slug
      if (!materialFromSlug) {
        const slugVariations = [
          product.slug,
          product.slug.replace(/^coque-/, ''),
          product.slug.replace(/^-/, ''),
        ];
        
        for (const slugVar of slugVariations) {
          materialFromSlug = materialMapping[slugVar];
          if (materialFromSlug) {
            console.log(`[Product ${product?.id}] ✅ Matériau depuis mapping slug (fallback) "${slugVar}": ${materialFromSlug}`);
            return materialFromSlug;
          }
        }
      } else {
        console.log(`[Product ${product?.id}] ✅ Matériau depuis mapping slug (fallback): ${materialFromSlug}`);
        return materialFromSlug;
      }
    }
    
    // 6. Fallback final : utiliser le mapping basé sur le nom du produit
    if (product?.name) {
      const productNameLower = product.name.toLowerCase();
      for (const [key, material] of Object.entries(materialMappingByName)) {
        if (productNameLower.includes(key)) {
          console.log(`[Product ${product?.id}] ✅ Matériau trouvé via mapping nom (fallback final) "${key}": ${material}`);
          return material;
        }
      }
    }
    
    console.warn(`[Product ${product?.id}] ⚠️ Aucun matériau trouvé après toutes les tentatives`);
    console.warn(`[Product ${product?.id}] ⚠️ Slug du produit: "${product?.slug}"`);
    console.warn(`[Product ${product?.id}] ⚠️ Nom du produit: "${product?.name}"`);
    console.warn(`[Product ${product?.id}] ⚠️ Clés disponibles dans mapping slug:`, Object.keys(materialMapping));
    return undefined;
  }, [matchedVariation, fallbackVariationForModel, materials, variations, product?.id, product?.slug]);

  const mentionsMagSafe = useMemo(() => {
    const blob = `${product?.name ?? ""} ${product?.short_description ?? ""} ${product?.description ?? ""}`;
    return /magsafe/i.test(blob);
  }, [product?.name, product?.short_description, product?.description]);

  const gallery = useMemo(() => {
    if (!product) return [];
    if (hasVariations) {
      const uniq = new Map<string, { src: string; alt: string; model?: string; color?: string; isActive: boolean }>();
      
      // Filtrer les variations pour ne garder que celles qui appartiennent vraiment à ce produit
      // Vérifier que les attributs correspondent aux attributs du produit parent
      const productAttrNames = new Set((product.attributes ?? []).map(a => norm(a.name)));
      
      variations.forEach((v) => {
        // Vérification supplémentaire : s'assurer que la variation a des attributs cohérents
        const variationAttrNames = (v.attributes ?? []).map(a => norm(a.name));
        const hasMatchingAttrs = variationAttrNames.some(vName => 
          Array.from(productAttrNames).some(pName => 
            vName === pName || 
            vName.includes(pName) || 
            pName.includes(vName) ||
            ['model', 'modèle', 'color', 'couleur'].some(pattern => vName.includes(pattern) && pName.includes(pattern))
          )
        );
        
        if (!hasMatchingAttrs) {
          console.warn(`[Product ${product.id}] Variation ${v.id} ignorée dans la galerie (attributs non cohérents)`);
          return;
        }
        
        const src = v.image?.src;
        if (!src) return;
        const m = v.attributes?.find((a) => /mod|mod[eè]le|iphone/i.test(a.name))?.option;
        const c = v.attributes?.find((a) => /couleur|color/i.test(a.name))?.option;
        const ref = v.attributes?.find((a) => /r[eé]f[eé]rence|reference/i.test(a.name))?.option;
        const key = `${src}|${m ?? ""}|${c ?? ""}|${ref ?? ""}`;
        if (!uniq.has(key)) {
          uniq.set(key, {
            src,
            alt: `${product.name}${m ? ` — ${m}` : ""}${c ? ` — ${c}` : ""}${ref ? ` — ${ref}` : ""}`,
            model: m,
            color: c,
            isActive: Boolean(matchedVariation && v.id === matchedVariation.id),
          });
        }
      });
      return Array.from(uniq.values());
    }
    // simple product
    return (product.images ?? []).map((im, idx) => ({
      src: im.src,
      alt: im.alt || `${product.name} — ${idx + 1}`,
      isActive: idx === 0,
    }));
  }, [product, hasVariations, variations, matchedVariation, norm]);

  const canAdd = Boolean(product) && qty > 0 && (!hasVariations || Boolean(matchedVariation));

  // FIX: ajout du mot-clé "async" manquant sur la fonction onAdd
  const onAdd = async () => {
    if (!product) return;
    if (hasVariations && !matchedVariation) {
      toast({
        title: "Sélection incomplète",
        description: "Choisis un modèle et une couleur disponibles.",
      });
      return;
    }
    try {
      await addItem({
        productId: product.id,
        variationId: matchedVariation?.id,
        name: product.name,
        slug: product.slug,
        imageSrc: matchedVariation?.image?.src ?? heroImage,
        price: matchedVariation?.price ?? product.price ?? product.regular_price,
        options: {
          model: selected.model,
          color: selected.color,
          material: selectedMaterial,
        },
        quantity: qty,
      });
      toast({
        title: "Ajouté au panier",
        description: `${product.name}${selected.model ? ` — ${selected.model}` : ""}${selected.color ? ` — ${selected.color}` : ""}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter au panier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-background">
      <Container className="py-10 sm:py-12">
        {q.isLoading ? (
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        ) : !product ? (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <div className="text-sm font-medium tracking-tight">Produit introuvable.</div>
            <div className="mt-2 text-sm text-muted-foreground">Vérifie le lien ou retourne à la boutique.</div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <FadeIn>
              <div className="overflow-hidden rounded-3xl border bg-muted/30">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="group relative block w-full">
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.05),transparent_60%)] opacity-0 transition group-hover:opacity-100" />
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt={product.images?.[0]?.alt || product.name}
                          loading="eager"
                          decoding="async"
                          className="impexo-product-shadow impexo-image-fade impexo-cutout aspect-square w-full object-contain p-6 transition duration-700 ease-out group-hover:scale-[1.01] sm:p-8"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-muted" />
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0">
                    {heroImage ? (
                      <div className="bg-black">
                        <img src={heroImage} alt={product.name} className="h-[80vh] w-full object-contain" />
                      </div>
                    ) : null}
                  </DialogContent>
                </Dialog>
              </div>

              {gallery.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {gallery.slice(0, 12).map((g) => {
                    const gWithAttrs = g as { src: string; alt: string; isActive: boolean; model?: string; color?: string };
                    return (
                      <button
                        key={`${g.src}-${gWithAttrs.model ?? ""}-${gWithAttrs.color ?? ""}`}
                        type="button"
                        onClick={() => {
                          if (gWithAttrs.model) setModel(gWithAttrs.model);
                          if (gWithAttrs.color) setColor(gWithAttrs.color);
                        }}
                        className={[
                          "group overflow-hidden rounded-2xl border bg-muted/30 transition",
                          g.isActive ? "border-foreground/40" : "hover:border-foreground/25",
                        ].join(" ")}
                        aria-label={`Voir ${g.alt}`}
                      >
                        <img
                          src={g.src}
                          alt={g.alt}
                          loading="lazy"
                          decoding="async"
                          className="impexo-cutout aspect-square w-full object-contain p-2 transition duration-300 ease-out group-hover:scale-[1.02]"
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Zoom élégant (cliquer)</span>
                <span className="tabular-nums">{formatEUR(price)}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium tracking-[0.2em] text-muted-foreground">IMPEXO</div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
                  <div className="mt-3 text-lg font-medium tabular-nums">{formatEUR(price)}</div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Modèle d'iPhone</div>
                    <Select
                      value={model}
                      onValueChange={(next) => {
                        setModel(next);
                        if (!hasVariations) return;
                        const allowed = availableColorsByModel.get(norm(next)) ?? [];
                        // On garde la couleur si elle existe pour ce modèle; sinon on choisit la première disponible.
                        if (color) {
                          const kept = allowed.find((c) => norm(c) === norm(color));
                          if (kept) {
                            if (kept !== color) setColor(kept);
                            return;
                          }
                        }
                        if (allowed.length) setColor(allowed[0]);
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-full">
                        <SelectValue placeholder="Choisir un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Couleur</div>
                    <div className="flex flex-wrap gap-2">
                      {displayedColors.map((c) => {
                        const active = color === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              // Comme on n'affiche que les couleurs disponibles, on peut sélectionner directement.
                              const inAllowed = allowedColorsForSelectedModel.find((x) => norm(x) === norm(c));
                              setColor(inAllowed ?? c);
                            }}
                            className={[
                              "rounded-full border px-3 py-2 text-xs transition",
                              active ? "bg-foreground text-background" : "bg-background hover:bg-muted/60",
                            ].join(" ")}
                            disabled={displayedColors.length <= 1}
                          >
                            {c}
                          </button>
                        );
                      })}
                      {displayedColors.length === 1 ? (
                        <span className="text-xs text-muted-foreground">1 couleur disponible pour ce modèle</span>
                      ) : null}
                      {displayedColors.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Couleurs non renseignées</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Sélecteur de série/design (affiche uniquement les variations correspondant au modèle et couleur sélectionnés) */}
                {hasVariations && filteredVariationsByModelAndColor.length > 1 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Série / Design</div>
                    <Select
                      value={series}
                      onValueChange={(next) => {
                        // next est maintenant l'ID de la variation ou la série extraite
                        // Extraire la série depuis la variation sélectionnée
                        const selectedVariation = filteredVariationsByModelAndColor.find(
                          (v) => {
                            const sku = v.sku;
                            if (sku) return extractSeriesFromSku(sku) === next;
                            const ref = getAttr(v, "Référence");
                            return ref && extractSeriesFromSku(ref) === next;
                          }
                        );
                        
                        if (selectedVariation) {
                          const sku = selectedVariation.sku;
                          const seriesValue = sku ? extractSeriesFromSku(sku) : getAttr(selectedVariation, "Référence");
                          if (seriesValue) {
                            setSeries(seriesValue);
                          }
                        } else {
                          setSeries(next);
                        }
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-full">
                        <SelectValue placeholder="Choisir une série" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVariationsByModelAndColor.map((v) => {
                          const modele = getAttr(v, "Modèle");
                          const couleur = getAttr(v, "Couleur");
                          const sku = v.sku;
                          const seriesValue = sku ? extractSeriesFromSku(sku) : getAttr(v, "Référence") || "";
                          
                          // Construire le label sans référence interne : "iPhone 17 — Argent"
                          const labelParts = [];
                          if (modele) labelParts.push(modele);
                          if (couleur) labelParts.push(couleur);
                          const label = labelParts.length > 0 ? labelParts.join(" — ") : seriesValue;
                          
                          return (
                            <SelectItem key={v.id} value={seriesValue}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="rounded-3xl border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-muted-foreground">Quantité</div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-10 text-center text-sm font-medium tabular-nums">{qty}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setQty((q) => q + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="mt-4 h-12 w-full rounded-full text-sm"
                    disabled={!canAdd}
                    onClick={onAdd}
                  >
                    Ajouter au panier
                  </Button>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Paiement & livraison à brancher côté WooCommerce / checkout.
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-3xl border bg-card p-4">
                    <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium tracking-tight">Protection fine</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Ajustement précis. Confort au quotidien.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-3xl border bg-card p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium tracking-tight">Finitions premium</div>
                      <div className="mt-1 text-sm text-muted-foreground">Reflets, textures, minimalisme.</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border bg-card p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="text-xs font-medium tracking-[0.22em] text-muted-foreground">DÉTAILS</div>
                      <div className="mt-2 text-sm font-medium tracking-tight">Fiche produit</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border bg-background/40 p-4">
                      <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">MODÈLE</div>
                      <div className="mt-2 text-sm font-medium tracking-tight">{selected.model || "—"}</div>
                    </div>
                    <div className="rounded-2xl border bg-background/40 p-4">
                      <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">COULEUR</div>
                      <div className="mt-2 text-sm font-medium tracking-tight">{selected.color || "—"}</div>
                    </div>
                    <div className="rounded-2xl border bg-background/40 p-4">
                      <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground">MATÉRIAU</div>
                      <div className="mt-2 text-sm font-medium tracking-tight">{selectedMaterial || "—"}</div>
                    </div>
                  </div>

                  {models.length ? (
                    <div className="mt-5">
                      <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground">
                        COMPATIBILITÉS DISPONIBLES
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {models.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center rounded-full border bg-background/40 px-3 py-1 text-xs font-medium text-foreground/90"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {product.short_description ? (
                    <div
                      className="prose prose-sm mt-4 max-w-none text-muted-foreground prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.short_description }}
                    />
                  ) : null}
                  {product.description ? (
                    <div
                      className="prose prose-sm mt-4 max-w-none text-muted-foreground prose-p:leading-relaxed prose-ul:my-3 prose-li:my-1"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : null}

                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    <div>Produit compatible avec les modèles iPhone 17, 17 Air, 17 Pro et 17 Pro Max.</div>
                    <div>La marque Apple® est mentionnée uniquement à titre de compatibilité. IMPEXO est une marque indépendante.</div>
                    {mentionsMagSafe ? (
                      <div>
                        MagSafe est une marque d'Apple Inc. La mention « compatible MagSafe » décrit une compatibilité avec des accessoires MagSafe, sans affiliation ni
                        approbation.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </Container>
    </div>
  );
}
