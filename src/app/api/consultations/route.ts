/**
 * Consultation Forms API Route
 *
 * GET  /api/consultations - List consultation forms
 * POST /api/consultations - Submit a consultation form
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");

  try {
    return NextResponse.json({
      consultations: [],
      filters: { status },
    });
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return NextResponse.json({ error: "Failed to fetch consultations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Create consultation form
    // Optionally create customer and project records
    // if (body.createProject) {
    //   const customer = await prisma.customer.create({ ... });
    //   const project = await prisma.project.create({ ... });
    //   consultation.projectId = project.id;
    //   consultation.customerId = customer.id;
    // }
    return NextResponse.json({ message: "Consultation form submission endpoint ready", body }, { status: 201 });
  } catch (error) {
    console.error("Error submitting consultation:", error);
    return NextResponse.json({ error: "Failed to submit consultation" }, { status: 500 });
  }
}
