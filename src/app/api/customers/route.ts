/**
 * Customers API Route
 *
 * GET  /api/customers - List customers
 * POST /api/customers - Create customer
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const contractorId = searchParams.get("contractorId");

  try {
    // TODO: Prisma query
    return NextResponse.json({
      customers: [],
      filters: { type, search, contractorId },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Create customer with Prisma
    // Also sync with QuickBooks if needed
    return NextResponse.json({ message: "Customer creation endpoint ready", body }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
