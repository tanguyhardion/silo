import { ScrapedListingData } from "@/types";
import { extractUrl } from "@/lib/utils";

export interface ScrapeResult {
  success: boolean;
  data?: ScrapedListingData;
  error?: string;
}

// ---------------------------------------------------------------------------
// Fetch HTML via ScrapingAnt (residential proxy + JS rendering)
// ---------------------------------------------------------------------------
async function fetchViaScrapingAnt(targetUrl: string): Promise<string> {
  const apiKey = process.env.SCRAPING_API_KEY;
  if (!apiKey) throw new Error("SCRAPING_API_KEY non configurée.");

  const endpoint =
    `https://api.scrapingant.com/v2/general` +
    `?url=${encodeURIComponent(targetUrl)}` +
    `&x-api-key=${apiKey}` +
    `&browser=true` +
    `&proxy_type=residential`;

  const res = await fetch(endpoint, { next: { revalidate: 0 } });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ScrapingAnt ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.text();
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------
export async function scrapeListing(rawUrl: string): Promise<ScrapeResult> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { success: false, error: "URL invalide ou manquante." };
  }

  const url = extractUrl(rawUrl);
  if (!url) {
    return { success: false, error: "URL invalide ou manquante." };
  }
  const isLeboncoin = url.includes("leboncoin.fr");
  const isAgriaffaires =
    url.includes("agriaffaires.com") || url.includes("agriaffaires.fr");

  try {
    const html = await fetchViaScrapingAnt(url);

    if (isLeboncoin) {
      return parseLeboncoin(url, html);
    }

    if (isAgriaffaires) {
      return parseAgriaffaires(url, html);
    }

    return parseGenericOg(url, html);
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Erreur lors de l'extraction de l'annonce.",
    };
  }
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Leboncoin — parses __NEXT_DATA__ embedded JSON
// ---------------------------------------------------------------------------
function parseLeboncoin(url: string, html: string): ScrapeResult {
  const idx = html.indexOf("__NEXT_DATA__");
  if (idx === -1) {
    return {
      success: false,
      error: "Structure Leboncoin non reconnue (pas de __NEXT_DATA__).",
    };
  }

  const start = html.indexOf(">", idx) + 1;
  const end = html.indexOf("</script>", start);
  if (start <= 0 || end === -1) {
    return { success: false, error: "Impossible de lire __NEXT_DATA__." };
  }

  let pageData: Record<string, unknown>;
  try {
    const root = JSON.parse(html.substring(start, end));
    pageData = (root?.props?.pageProps ?? {}) as Record<string, unknown>;
  } catch {
    return { success: false, error: "JSON __NEXT_DATA__ invalide." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ad = pageData.ad as any;
  if (!ad) {
    return {
      success: false,
      error: "Aucune annonce trouvée dans les données Leboncoin.",
    };
  }

  // Price is an array [number] on Leboncoin
  const rawPrice: number = Array.isArray(ad.price)
    ? (ad.price[0] ?? 0)
    : (ad.price ?? 0);

  // Location
  const loc = ad.location ?? {};
  const locationStr =
    [loc.city, loc.zipcode].filter(Boolean).join(" ") || "France";

  // Images — urls array
  const images: string[] = (ad.images?.urls ?? []).filter(Boolean);

  // Seller
  const ownerName: string = ad.owner?.name ?? "";
  const ownerType: string = ad.owner?.type ?? "private";
  const sellerType = ownerType === "pro" ? "pro" : "particulier";

  // Specs — extract attributes (mileage, hours, year, fuel, gearbox, etc.)
  const specs: Record<string, string> = {};
  const ignoredSpecKeys = new Set([
    "profile_picture_url",
    "profile_picture",
    "avatar",
    "photo",
    "photos",
    "image",
    "images",
  ]);

  if (Array.isArray(ad.attributes)) {
    for (const attr of ad.attributes) {
      const rawKey = (attr.key || "").toLowerCase();
      const rawKeyLabel = (attr.key_label || "").toLowerCase();
      
      // Skip ignored attributes like profile picture URLs, image URLs, etc.
      if (
        ignoredSpecKeys.has(rawKey) ||
        ignoredSpecKeys.has(rawKeyLabel) ||
        rawKey.includes("profile_picture") ||
        rawKey.includes("picture_url")
      ) {
        continue;
      }

      let label = "";
      let valStr = "";

      if (attr.key_label && attr.value_label) {
        label = attr.key_label as string;
        valStr = String(attr.value_label);
      } else if (attr.key && attr.value) {
        const keyMap: Record<string, string> = {
          mileage: "Kilométrage",
          regdate: "Année-modèle",
          fuel: "Carburant",
          gearbox: "Boîte de vitesse",
          doors: "Portes",
          seats: "Places",
          vehicle_type: "Type de véhicule",
          horsepower: "Puissance DIN",
          horse_power_fiscal: "Puissance fiscale",
          hours: "Heures",
          cylinder: "Cylindrée",
        };
        label = keyMap[attr.key] || attr.key;
        valStr = String(attr.value_label || attr.value);
      }

      // Do not include if value is an http/https URL or if label is ignored
      if (label && valStr && !valStr.startsWith("http://") && !valStr.startsWith("https://")) {
        specs[label] = valStr;
      }
    }
  }

  // Also check body/description for any missing hours/km/power
  const bodySpecs = extractSpecsFromHtml(ad.body || "");
  for (const [k, v] of Object.entries(bodySpecs)) {
    if (!specs[k]) specs[k] = v;
  }

  // Original publication date
  const rawPubDate =
    ad.first_publication_date ||
    ad.publication_date ||
    ad.expiration_date ||
    null;
  const publishedDate = formatPubDate(rawPubDate) || new Date().toLocaleDateString("fr-FR");

  // VAT mentions can live in attributes (pro ads), the description or the rendered page
  const attrText = Array.isArray(ad.attributes)
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ad.attributes.map((a: any) => `${a.key_label ?? a.key ?? ""} ${a.value_label ?? a.value ?? ""}`).join("\n")
    : "";
  const vat = resolveVatPrices(rawPrice, [attrText, ad.body ?? "", stripTags(html)], specs);

  return {
    success: true,
    data: {
      source: "leboncoin",
      url,
      title: ad.subject ?? "Annonce Leboncoin",
      ...vat,
      currency: "EUR",
      sellerName: ownerName || "Vendeur Leboncoin",
      sellerType,
      location: locationStr,
      description: ad.body ?? "",
      images,
      specs,
      publishedDate,
    },
  };
}

// ---------------------------------------------------------------------------
// Agriaffaires — JSON-LD Product schema then OpenGraph fallback
// ---------------------------------------------------------------------------
function parseAgriaffaires(url: string, html: string): ScrapeResult {
  const jsonLdIdx = html.indexOf('"application/ld+json"');
  if (jsonLdIdx !== -1) {
    const start = html.indexOf(">", jsonLdIdx) + 1;
    const end = html.indexOf("</script>", start);
    if (start > 0 && end !== -1) {
      try {
        const jsonLd = JSON.parse(html.substring(start, end));
        const product =
          jsonLd["@type"] === "Product"
            ? jsonLd
            : Array.isArray(jsonLd)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              jsonLd.find((x: any) => x["@type"] === "Product")
            : null;

        if (product) {
          const price =
            parseFloat(
              product.offers?.price ?? product.offers?.lowPrice ?? "0"
            ) || 0;
          const images: string[] = Array.isArray(product.image)
            ? product.image
            : product.image
            ? [product.image]
            : [];
          const sellerName: string =
            product.offers?.seller?.name ??
            extractMeta(html, "og:site_name") ??
            "Agriaffaires";

          const rawDate =
            product.offers?.validFrom ||
            product.releaseDate ||
            product.datePosted ||
            extractMeta(html, "article:published_time") ||
            extractMeta(html, "og:article:published_time") ||
            extractDateFromHtml(html);

          const vat = resolveVatPrices(price, [
            product.description ?? "",
            stripTags(html),
          ]);

          return {
            success: true,
            data: {
              source: "agriaffaires",
              url,
              title: cleanTitle(
                product.name ??
                  extractMeta(html, "og:title") ??
                  "Annonce Agriaffaires"
              ),
              ...vat,
              currency: product.offers?.priceCurrency ?? "EUR",
              sellerName,
              sellerType: "pro",
              location:
                extractMeta(html, "geo.placename") ??
                extractLocationRegex(html),
              description:
                product.description ??
                extractMeta(html, "og:description") ??
                "",
              images: images.filter(Boolean),
              specs: extractSpecsFromHtml(html),
              publishedDate: formatPubDate(rawDate) || new Date().toLocaleDateString("fr-FR"),
            },
          };
        }
      } catch {
        // fall through to OG
      }
    }
  }

  return parseGenericOg(url, html, "agriaffaires");
}

// ---------------------------------------------------------------------------
// Generic OpenGraph / meta extraction
// ---------------------------------------------------------------------------
function parseGenericOg(
  url: string,
  html: string,
  source: ScrapedListingData["source"] = "autre"
): ScrapeResult {
  const ogTitle =
    extractMeta(html, "og:title") ?? extractTag(html, "title") ?? "";
  const ogDesc =
    extractMeta(html, "og:description") ??
    extractMeta(html, "description") ??
    "";
  const ogImage = extractMeta(html, "og:image");

  const priceMatch =
    html.match(/(\d[\d\s.,]{2,})\s*(?:€|EUR|euros?)/i) ??
    ogTitle.match(/(\d[\d\s.,]{2,})\s*(?:€|EUR)/i) ??
    ogDesc.match(/(\d[\d\s.,]{2,})\s*(?:€|EUR)/i);

  let price = 0;
  if (priceMatch?.[1]) {
    price =
      parseFloat(priceMatch[1].replace(/\s/g, "").replace(",", ".")) || 0;
  }

  const images: string[] = [];
  if (
    ogImage &&
    !ogImage.includes("placeholder") &&
    !ogImage.includes("default")
  ) {
    images.push(ogImage);
  }

  const rawDate =
    extractMeta(html, "article:published_time") ??
    extractMeta(html, "og:article:published_time") ??
    extractMeta(html, "publication_date") ??
    extractMeta(html, "date") ??
    extractDateFromHtml(html);

  return {
    success: true,
    data: {
      source,
      url,
      title: cleanTitle(ogTitle) || "Annonce web",
      ...resolveVatPrices(price, [ogTitle, ogDesc, stripTags(html)]),
      currency: "EUR",
      sellerName: extractMeta(html, "author") ?? "Vendeur",
      sellerType: source === "agriaffaires" ? "pro" : "particulier",
      location: extractLocationRegex(html),
      description: ogDesc,
      images,
      specs: extractSpecsFromHtml(html),
      publishedDate: formatPubDate(rawDate) || new Date().toLocaleDateString("fr-FR"),
    },
  };
}

// ---------------------------------------------------------------------------
// VAT — prices are assumed HT unless the listing states otherwise
// ---------------------------------------------------------------------------
const VAT_RATE = 0.2;

function parseAmount(raw: string): number {
  // "45 000,50" / "45.000" / "45000" → number
  const cleaned = raw.replace(/[\s  ]/g, "");
  const normalized = /,\d{1,2}$/.test(cleaned)
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/[.,]/g, "");
  return parseFloat(normalized) || 0;
}

function findTaggedAmounts(text: string, tag: "HT" | "TTC"): number[] {
  const label =
    tag === "HT"
      ? String.raw`(?:H\.?T\.?|hors[\s-]+taxes?)`
      : String.raw`(?:T\.?T\.?C\.?|toutes[\s-]+taxes[\s-]+comprises)`;
  const num = String.raw`(\d{1,3}(?:[\s  .]\d{3})+(?:,\d{1,2})?|\d{3,}(?:,\d{1,2})?)`;
  const patterns = [
    // "45 000 € HT"
    new RegExp(String.raw`${num}\s*(?:€|euros?|EUR)\s*${label}(?![a-z])`, "gi"),
    // "Prix HT : 45 000 €"
    new RegExp(String.raw`\b${label}\s*:?\s*${num}\s*(?:€|euros?|EUR)`, "gi"),
  ];
  const amounts: number[] = [];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const n = parseAmount(m[1]);
      if (n > 0) amounts.push(n);
    }
  }
  return amounts;
}

const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(1, b * 0.01);

// Structured fields such as Leboncoin's "Prix de vente HT : 3500" (no currency sign)
function findTaggedSpecs(specs: Record<string, string>, tag: "HT" | "TTC"): number[] {
  const label = tag === "HT" ? /\bH\.?T\.?\b|hors[\s-]+taxes?/i : /\bT\.?T\.?C\.?\b/i;
  return Object.entries(specs)
    .filter(([key]) => /prix|price|montant/i.test(key) && label.test(key))
    .map(([, value]) => parseAmount(value.replace(/[^\d\s.,]/g, "").trim()))
    .filter((n) => n > 0);
}

export function resolveVatPrices(
  price: number,
  texts: string[],
  specs: Record<string, string> = {}
): { price: number; priceTtc: number | null } {
  if (!price) return { price, priceTtc: null };
  const text = texts.join("\n");
  const ht = [...findTaggedSpecs(specs, "HT"), ...findTaggedAmounts(text, "HT")];
  const ttc = [...findTaggedSpecs(specs, "TTC"), ...findTaggedAmounts(text, "TTC")];
  const htOfPrice = ht.find((n) => n < price && near(n * (1 + VAT_RATE), price));

  // Displayed price explicitly labelled TTC
  const priceIsTtc =
    ttc.some((n) => near(n, price)) ||
    (/prix[^.\n]{0,20}\bTTC\b/i.test(text) && !ht.some((n) => near(n, price)));
  if (priceIsTtc) {
    return {
      price: htOfPrice ?? Math.round(price / (1 + VAT_RATE)),
      priceTtc: price,
    };
  }

  // Displayed price is HT; keep the TTC amount if one is also stated
  const ttcMatch = ttc.find((n) => n > price && near(n, price * (1 + VAT_RATE)));
  if (ttcMatch) return { price, priceTtc: ttcMatch };

  // An HT amount of ~price/1.2 is stated → displayed price was TTC
  if (htOfPrice) return { price: htOfPrice, priceTtc: price };

  // An explicit HT field below the displayed price wins even off the 20% ratio
  const specHt = findTaggedSpecs(specs, "HT").find((n) => n < price);
  if (specHt) return { price: specHt, priceTtc: price };

  // Nothing specified → HT
  return { price, priceTtc: null };
}

function stripTags(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractMeta(html: string, name: string): string | null {
  const reg1 = new RegExp(
    `<meta\\s+(?:name|property)=["']${name}["']\\s+content=["'](.*?)["']`,
    "i"
  );
  const m1 = html.match(reg1);
  if (m1?.[1]) return decodeHtmlEntities(m1[1].trim());

  const reg2 = new RegExp(
    `<meta\\s+content=["'](.*?)["']\\s+(?:name|property)=["']${name}["']`,
    "i"
  );
  const m2 = html.match(reg2);
  if (m2?.[1]) return decodeHtmlEntities(m2[1].trim());

  return null;
}

function extractTag(html: string, tag: string): string | null {
  const reg = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = html.match(reg);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractLocationRegex(html: string): string {
  const m =
    html.match(/([0-9]{2}\s*-\s*[A-Za-zÀ-ÿ\-]+)/i) ??
    html.match(/([0-9]{5}\s+[A-Za-zÀ-ÿ\-]+)/i);
  return m ? m[1] : "France";
}

function formatPubDate(rawDate?: string | null): string | null {
  if (!rawDate) return null;
  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("fr-FR");
  }
  // Try matching DD/MM/YYYY or YYYY-MM-DD
  const m1 = rawDate.match(/(\d{4})[-/.](\d{2})[-/.](\d{2})/);
  if (m1) {
    return `${m1[3]}/${m1[2]}/${m1[1]}`;
  }
  const m2 = rawDate.match(/(\d{2})[-/.](\d{2})[-/.](\d{4})/);
  if (m2) {
    return `${m2[1]}/${m2[2]}/${m2[3]}`;
  }
  return null;
}

function extractDateFromHtml(html: string): string | null {
  // Matches "Publiée le 12/03/2024", "Mise en ligne le ...", "Date de publication : ..."
  const m =
    html.match(/(?:Publi[ée]e?|Mise en ligne|Date|Parue?)\s*(?:le\s*)?[:]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i) ??
    html.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/i);
  return m ? m[1] : null;
}

function extractSpecsFromHtml(html: string): Record<string, string> {
  const specs: Record<string, string> = {};

  // Hours (tractors, heavy equipment, harvesters, etc.)
  const hoursMatch =
    html.match(/(?:Heures?|Nb\.?\s*heures?)\s*[:]?\s*(\d[\d\s.,]*)\s*(?:h\b|heures)?/i) ??
    html.match(/(\d[\d\s.,]*)\s*(?:h\b|heures)/i);
  if (hoursMatch) {
    const val = hoursMatch[1].trim().replace(/\s+/g, " ");
    if (parseInt(val.replace(/\D/g, ""), 10) > 0) {
      specs["Heures"] = `${val} h`;
    }
  }

  // Kilometers (utility vehicles, 4x4, trucks, cars, etc.)
  const kmMatch =
    html.match(/(?:Kilom[ée]trage|Km)\s*[:]?\s*(\d[\d\s.,]*)\s*(?:km\b|kilom[ée]tres)?/i) ??
    html.match(/(\d[\d\s.,]*)\s*(?:km\b|kilom[ée]tres)/i);
  if (kmMatch) {
    const val = kmMatch[1].trim().replace(/\s+/g, " ");
    if (parseInt(val.replace(/\D/g, ""), 10) > 0) {
      specs["Kilométrage"] = `${val} km`;
    }
  }

  // Year / Millésime
  const yearMatch =
    html.match(/(?:Ann[ée]e(?:\s*-\s*mod[èe]le)?|Mill[ée]sime)\s*[:]?\s*(20[0-2]\d|19[789]\d)/i) ??
    html.match(/\b(20[0-2]\d|19[789]\d)\b/);
  if (yearMatch && !specs["Année"] && !specs["Année-modèle"]) {
    specs["Année"] = yearMatch[1];
  }

  // Power (ch, cv, HP)
  const powerMatch =
    html.match(/(?:Puissance|Puissance\s*DIN)\s*[:]?\s*(\d{2,4})\s*(?:ch|cv|hp|chevaux)?/i) ??
    html.match(/(\d{2,4})\s*(?:ch|cv|HP|chevaux)\b/i);
  if (powerMatch && !specs["Puissance"]) {
    specs["Puissance"] = `${powerMatch[1]} ch`;
  }

  // Transmission / Gearbox
  const gearboxMatch = html.match(/(?:Bo[îi]te(?:\s+de\s+vitesses?)?)\s*[:]?\s*(Manuelle|Automatique|Hydrostatique|Continue|Vario|Semi-powershift|Powershift)/i);
  if (gearboxMatch && !specs["Boîte de vitesse"]) {
    specs["Boîte de vitesse"] = gearboxMatch[1];
  }

  // Fuel / Carburant
  const fuelMatch = html.match(/(?:Carburant|Énergie|Energie)\s*[:]?\s*(Diesel|Essence|Électrique|Electrique|Hybride|GNR)/i);
  if (fuelMatch && !specs["Carburant"]) {
    specs["Carburant"] = fuelMatch[1];
  }

  // Condition / État
  const conditionMatch = html.match(/(?:[ÉE]tat|Condition)\s*[:]?\s*([A-Za-zÀ-ÿ\s]{3,25})(?:<|$|\n|,)/i);
  if (conditionMatch && !specs["État"] && conditionMatch[1].trim().length < 25) {
    const stateStr = conditionMatch[1].trim();
    if (/bon|très bon|neuf|correct|moyen|reconditionné|usagé/i.test(stateStr)) {
      specs["État"] = stateStr;
    }
  }

  return specs;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*Leboncoin.*$/i, "")
    .replace(/\s*\|\s*Agriaffaires.*$/i, "")
    .replace(/\s*-\s*Agriaffaires.*$/i, "")
    .trim();
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&euro;/g, "€");
}
