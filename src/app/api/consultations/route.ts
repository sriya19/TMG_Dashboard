import { NextRequest, NextResponse } from "next/server";
import { getConsultations, createConsultation } from "@/lib/db";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") || undefined;
  try {
    const consultations = await getConsultations({ status });
    return NextResponse.json({ consultations });
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return NextResponse.json({ error: "Failed to fetch consultations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.customerName || !body.phone) {
      return NextResponse.json({ error: "customerName and phone are required" }, { status: 400 });
    }
    const result = await createConsultation(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating consultation:", error);
    return NextResponse.json({ error: "Failed to create consultation" }, { status: 500 });
  }
}
