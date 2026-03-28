import { NextResponse } from "next/server";
import { quickbooksService } from "@/services/quickbooks";

export async function GET() {
  const authUrl = quickbooksService.getAuthUrl();
  return NextResponse.json({ authUrl });
}
