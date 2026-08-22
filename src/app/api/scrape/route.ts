import { NextResponse } from "next/server";
import { scrapeListing } from "@/lib/scraper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: "Veuillez renseigner une URL valide." }, { status: 400 });
    }

    const result = await scrapeListing(url);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Échec de l'extraction." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
