import { NextRequest, NextResponse } from "next/server";
import { upsertProjectScope } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const scope = await upsertProjectScope(id, body);
    return NextResponse.json(scope);
  } catch (error) {
    console.error("Error updating scope:", error);
    return NextResponse.json({ error: "Failed to update scope" }, { status: 500 });
  }
}
