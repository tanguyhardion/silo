import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const valuations = await dbService.getValuationsByProduct(id);
    return NextResponse.json({ success: true, valuations });
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
    if (!body.value || isNaN(parseFloat(body.value))) {
      return NextResponse.json({ success: false, error: "Le montant de valorisation est obligatoire." }, { status: 400 });
    }

    const newValuation = await dbService.addValuation(id, {
      value: parseFloat(body.value),
      valuationDate: body.valuationDate || new Date().toLocaleDateString("fr-FR"),
      notes: body.notes || "",
      createdBy: body.createdBy || "Utilisateur Silo",
    });

    return NextResponse.json({ success: true, valuation: newValuation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
