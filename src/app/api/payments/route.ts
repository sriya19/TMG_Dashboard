/**
 * Payments API Route
 *
 * GET  /api/payments - List payments
 * POST /api/payments - Record a payment
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const projectId = searchParams.get("projectId");

  try {
    // TODO: Prisma query
    // Also sync with QuickBooks for latest payment status
    return NextResponse.json({
      payments: [],
      filters: { status, type, projectId },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Create payment record
    // Sync with QuickBooks
    // Trigger automation (payment_received)
    // Update project status if deposit/final payment
    return NextResponse.json({ message: "Payment recording endpoint ready", body }, { status: 201 });
  } catch (error) {
    console.error("Error recording payment:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
