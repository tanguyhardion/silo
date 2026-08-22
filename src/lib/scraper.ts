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
  if (Array.isArray(ad.attributes)) {
    for (const attr of ad.attributes) {
      if (attr.key_label && attr.value_label) {
        specs[attr.key_label as string] = attr.value_label as string;
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
        const label = keyMap[attr.key] || attr.key;
        specs[label] = String(attr.value_label || attr.value);
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
      price,
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
