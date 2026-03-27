/**
 * AI API Route
 *
 * POST /api/ai - Process AI requests (summaries, suggestions, drafts, search)
 */

import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/services/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "project_summary": {
        const summary = await aiService.generateProjectSummary(params.projectDetails);
        return NextResponse.json({ summary });
      }

      case "next_steps": {
        const steps = await aiService.getNextSteps(params);
        return NextResponse.json({ steps });
      }

      case "draft_message": {
        const draft = await aiService.draftCustomerMessage(params);
        return NextResponse.json({ draft });
      }

      case "search": {
        const results = await aiService.processSearchQuery(params.query);
        return NextResponse.json({ results });
      }

      case "risk_assessment": {
        const risks = await aiService.assessRisks(params.projectsData);
        return NextResponse.json({ risks });
      }

      default:
        return NextResponse.json({ error: "Unknown AI action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing AI request:", error);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}
