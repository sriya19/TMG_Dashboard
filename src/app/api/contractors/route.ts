/**
 * Contractors API Route
 *
 * GET  /api/contractors - List contractors
 * POST /api/contractors - Create contractor
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const active = searchParams.get("active");

  try {
    // TODO: Prisma query with project counts and revenue aggregation
    return NextResponse.json({
      contractors: [],
      filters: { search, active },
    });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json({ error: "Failed to fetch contractors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: "Contractor creation endpoint ready", body }, { status: 201 });
  } catch (error) {
    console.error("Error creating contractor:", error);
    return NextResponse.json({ error: "Failed to create contractor" }, { status: 500 });
  }
}
