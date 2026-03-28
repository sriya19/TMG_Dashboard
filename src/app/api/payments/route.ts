import { NextRequest, NextResponse } from "next/server";
import { getPayments, createPayment, updatePayment } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  try {
    const payments = await getPayments({
      status: sp.get("status") || undefined,
      type: sp.get("type") || undefined,
      projectId: sp.get("projectId") || undefined,
    });
    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.projectId || !body.paymentType || body.amount === undefined) {
      return NextResponse.json({ error: "projectId, paymentType, and amount are required" }, { status: 400 });
    }
    const payment = await createPayment(body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const updated = await updatePayment(body.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
