import { NextRequest, NextResponse } from "next/server";
import { getContractors, createContractor } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  try {
    const contractors = await getContractors({
      search: sp.get("search") || undefined,
    });
    return NextResponse.json({ contractors });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json({ error: "Failed to fetch contractors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const contractor = await createContractor(body);
    return NextResponse.json(contractor, { status: 201 });
  } catch (error) {
    console.error("Error creating contractor:", error);
    return NextResponse.json({ error: "Failed to create contractor" }, { status: 500 });
  }
}
