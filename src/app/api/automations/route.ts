/**
 * Automations API Route
 *
 * GET  /api/automations - List automation logs
 * POST /api/automations - Trigger an automation manually
 */

import { NextRequest, NextResponse } from "next/server";
import { automationEngine, AUTOMATION_RULES } from "@/services/automation";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("projectId") || undefined;

  try {
    const logs = automationEngine.getLogs(projectId);
    return NextResponse.json({
      logs,
      rules: AUTOMATION_RULES.map((r) => ({
        id: r.id,
        name: r.name,
        trigger: r.trigger,
        enabled: r.enabled,
      })),
    });
  } catch (error) {
    console.error("Error fetching automation logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger, context } = body;

    const results = await automationEngine.processTrigger(trigger, context);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error triggering automation:", error);
    return NextResponse.json({ error: "Failed to trigger automation" }, { status: 500 });
  }
}
