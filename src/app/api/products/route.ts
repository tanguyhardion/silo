import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { dbService } from "@/lib/db-service";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    const products = await dbService.getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    const body = await request.json();
    if (!body.name || !body.type) {
      return NextResponse.json({ success: false, error: "Le nom et le type sont obligatoires." }, { status: 400 });
    }

    const newProduct = await dbService.createProduct({
      name: body.name,
      type: body.type,
      customType: body.customType || null,
      description: body.description || null,
      currentEstimatedValue: parseFloat(body.currentEstimatedValue || "0") || 0,
      currency: "EUR",
      mainImageUrl: body.mainImageUrl || null,
      status: "active",
      initialValuationNotes: body.initialValuationNotes,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
