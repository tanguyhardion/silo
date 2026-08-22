import { ScrapedListingData } from "@/types";

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

  const url = rawUrl.trim();
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

  // Specs — only generic attributes that have both key_label and value_label
  const specs: Record<string, string> = {};
  if (Array.isArray(ad.attributes)) {
    for (const attr of ad.attributes) {
      if (attr.generic && attr.key_label && attr.value_label) {
        specs[attr.key_label as string] = attr.value_label as string;
      }
    }
  }

  return {
    success: true,
    data: {
      source: "leboncoin",
      url,
      title: ad.subject ?? "Annonce Leboncoin",
      price: rawPrice,
      currency: "EUR",
      sellerName: ownerName || "Vendeur Leboncoin",
      sellerType,
      location: locationStr,
      description: ad.body ?? "",
      images,
      specs,
      publishedDate: new Date().toLocaleDateString("fr-FR"),
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
              price,
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
              publishedDate: new Date().toLocaleDateString("fr-FR"),
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

  return {
    success: true,
    data: {
      source,
      url,
      title: cleanTitle(ogTitle) || "Annonce web",
      price,
      currency: "EUR",
      sellerName: extractMeta(html, "author") ?? "Vendeur",
      sellerType: source === "agriaffaires" ? "pro" : "particulier",
      location: extractLocationRegex(html),
      description: ogDesc,
      images,
      specs: extractSpecsFromHtml(html),
      publishedDate: new Date().toLocaleDateString("fr-FR"),
    },
  };
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

function extractSpecsFromHtml(html: string): Record<string, string> {
  const specs: Record<string, string> = {};

  const hoursMatch = html.match(/(\d[\d\s]*)\s*(?:h\b|heures)/i);
  if (hoursMatch) specs["Heures"] = `${hoursMatch[1].trim()} h`;

  const yearMatch = html.match(
    /(?:Année|Millésime)\s*[:]?\s*(20[0-2]\d|19[89]\d)/i
  );
  if (yearMatch) specs["Année"] = yearMatch[1];

  const powerMatch = html.match(/(\d{2,3})\s*(?:ch|cv|HP|chevaux)/i);
  if (powerMatch) specs["Puissance"] = `${powerMatch[1]} ch`;

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
