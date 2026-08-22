import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await dbService.getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Bien introuvable" }, { status: 404 });
    }

    const valuations = await dbService.getValuationsByProduct(id);
    const listings = await dbService.getListingsByProduct(id);
    const activityLogs = await dbService.getActivityLogsByProduct(id);

    return NextResponse.json({
      success: true,
      product,
      valuations,
      listings,
      activityLogs,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await dbService.updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Bien introuvable" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
