import { NextResponse } from "next/server";

export interface ImageSuggestion {
  title: string;
  image: string;
  thumbnail: string;
  source?: string;
  width?: number;
  height?: number;
}

// Fetch images via DuckDuckGo Image Search API
async function fetchDuckDuckGoImages(query: string): Promise<ImageSuggestion[]> {
  const vqdRes = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    }
  );

  if (!vqdRes.ok) {
    throw new Error(`DuckDuckGo initial request failed (${vqdRes.status})`);
  }

  const html = await vqdRes.text();
  const vqdMatch =
    html.match(/vqd=([0-9-]+)/) ||
    html.match(/vqd="([0-9-]+)"/) ||
    html.match(/vqd:\s*"([0-9-]+)"/);

  if (!vqdMatch?.[1]) {
    throw new Error("Could not obtain search token (VQD).");
  }

  const vqd = vqdMatch[1];
  const searchUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(
    query
  )}&vqd=${vqd}&f=,,,&p=1`;

  const imgRes = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Referer: "https://duckduckgo.com/",
      Accept: "application/json, text/javascript, */*; q=0.01",
    },
  });

  if (!imgRes.ok) {
    throw new Error(`DuckDuckGo image results failed (${imgRes.status})`);
  }

  const data = await imgRes.json();
  const results = (data.results || []) as Array<{
    title?: string;
    image?: string;
    thumbnail?: string;
    source?: string;
    width?: number;
    height?: number;
  }>;

  return results
    .filter((item) => Boolean(item.image || item.thumbnail))
    .slice(0, 15)
    .map((item) => ({
      title: item.title || "Image trouvée",
      image: item.image || item.thumbnail || "",
      thumbnail: item.thumbnail || item.image || "",
      source: item.source || "Web",
      width: item.width,
      height: item.height,
    }));
}

// Fallback search using Wikimedia Commons API
async function fetchWikimediaImages(query: string): Promise<ImageSuggestion[]> {
  const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|extmetadata&format=json&origin=*`;

  const res = await fetch(endpoint, {
    headers: {
      "User-Agent": "SiloApp/1.0 (contact@silo-agri.fr)",
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return [];

  const suggestions: ImageSuggestion[] = [];
  for (const key of Object.keys(pages)) {
    const page = pages[key];
    const info = page.imageinfo?.[0];
    if (info?.url) {
      suggestions.push({
        title: page.title?.replace(/^File:/i, "") || "Image Wikipedia",
        image: info.url,
        thumbnail: info.thumburl || info.url,
        source: "Wikimedia",
        width: info.width,
        height: info.height,
      });
    }
  }
  return suggestions;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json(
      { success: false, error: "Veuillez spécifier une recherche valide." },
      { status: 400 }
    );
  }

  try {
    let images: ImageSuggestion[] = [];
    try {
      images = await fetchDuckDuckGoImages(q);
    } catch (ddgError) {
      console.warn("DuckDuckGo image search failed, falling back:", ddgError);
      images = await fetchWikimediaImages(q);
    }

    if (images.length === 0) {
      images = await fetchWikimediaImages(q);
    }

    return NextResponse.json({
      success: true,
      query: q,
      results: images,
    });
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Erreur lors de la recherche d'images.",
      },
      { status: 500 }
    );
  }
}
