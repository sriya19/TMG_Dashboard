import { NextRequest, NextResponse } from "next/server";
import { getScheduleEvents, createScheduleEvent } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  try {
    const events = await getScheduleEvents({
      startDate: sp.get("startDate") || undefined,
      endDate: sp.get("endDate") || undefined,
      eventType: sp.get("eventType") || undefined,
      projectId: sp.get("projectId") || undefined,
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.projectId || !body.eventType || !body.title || !body.startTime) {
      return NextResponse.json({ error: "projectId, eventType, title, and startTime required" }, { status: 400 });
    }
    const event = await createScheduleEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
