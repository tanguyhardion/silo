import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listings = await dbService.getListingsByProduct(id);
    return NextResponse.json({ success: true, listings });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.url || !body.title) {
      return NextResponse.json({ success: false, error: "L'URL et le titre de l'annonce sont obligatoires." }, { status: 400 });
    }

    const newListing = await dbService.addListing(id, {
      source: body.source || "autre",
      url: body.url,
      title: body.title,
      price: parseFloat(body.price || "0") || 0,
      currency: body.currency || "EUR",
      sellerName: body.sellerName || null,
      sellerType: body.sellerType || null,
      location: body.location || null,
      publishedDate: body.publishedDate || null,
      observedAt: body.observedAt || new Date().toLocaleDateString("fr-FR"),
      description: body.description || null,
      specs: body.specs || {},
      images: Array.isArray(body.images) ? body.images : [],
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, listing: newListing }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
