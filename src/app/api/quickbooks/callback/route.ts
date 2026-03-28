import { NextRequest, NextResponse } from "next/server";
import { quickbooksService } from "@/services/quickbooks";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const realmId = request.nextUrl.searchParams.get("realmId");

  if (!code) {
    return NextResponse.json({ error: "No auth code provided" }, { status: 400 });
  }

  try {
    const tokens = await quickbooksService.authenticate(code);
    // In production, store tokens securely (database, encrypted env, etc.)
    console.log("[QB] Authenticated successfully. RealmId:", realmId);

    // Redirect back to the dashboard with success
    return NextResponse.redirect(new URL("/payments?qb=connected", request.url));
  } catch (error) {
    console.error("[QB] Authentication failed:", error);
    return NextResponse.redirect(new URL("/payments?qb=error", request.url));
  }
}
