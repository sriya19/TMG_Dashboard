import { NextRequest, NextResponse } from "next/server";
import { getCustomers, createCustomer } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  try {
    const customers = await getCustomers({
      type: sp.get("type") || undefined,
      search: sp.get("search") || undefined,
      contractorId: sp.get("contractorId") || undefined,
    });
    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.firstName || !body.lastName || !body.phone) {
      return NextResponse.json({ error: "firstName, lastName, and phone are required" }, { status: 400 });
    }
    const customer = await createCustomer(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
