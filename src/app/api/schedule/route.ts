/**
 * Schedule Events API Route
 *
 * GET  /api/schedule - List schedule events
 * POST /api/schedule - Create a schedule event
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const eventType = searchParams.get("eventType");
  const assignedToId = searchParams.get("assignedToId");

  try {
    // TODO: Prisma query with date range filter
    // Also sync with Google Calendar
    return NextResponse.json({
      events: [],
      filters: { startDate, endDate, eventType, assignedToId },
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: Create schedule event
    // Create Google Calendar event
    // Trigger automation (event_scheduled)
    // Send notifications to customer and team
    return NextResponse.json({ message: "Schedule event creation endpoint ready", body }, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
