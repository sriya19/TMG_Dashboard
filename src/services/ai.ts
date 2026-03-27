/**
 * AI Service - Claude API Integration
 *
 * Provides AI-powered features for the TMG Dashboard:
 * 1. Project status summaries
 * 2. Next-step suggestions
 * 3. Customer message drafting
 * 4. Natural language search
 * 5. Analytics explanations
 * 6. Risk flag identification
 *
 * Uses Anthropic's Claude API via @anthropic-ai/sdk
 */

export interface AIProjectSummary {
  summary: string;
  keyFindings: string[];
  risks: string[];
  nextSteps: string[];
}

export interface AIMessageDraft {
  subject: string;
  body: string;
  channel: "email" | "sms" | "whatsapp";
  tone: "professional" | "friendly" | "urgent";
}

export interface AISearchResult {
  query: string;
  interpretation: string;
  results: { type: string; id: string; title: string; relevance: string }[];
}

export interface AIRiskFlag {
  projectId: string;
  projectName: string;
  riskType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
}

// ─── Prompt Templates ───────────────────────────────────────────────────────

export const AI_PROMPTS = {
  projectSummary: `You are an AI assistant for Top Marble & Granite, a countertop fabrication and installation business. Given the following project details, generate a concise business summary.

Project Details:
{{projectDetails}}

Generate:
1. A 2-3 sentence summary of where this project stands
2. Key findings (what's completed, what's in progress)
3. Any risks or concerns (delays, missing info, payment issues)
4. Recommended next steps

Format as JSON with keys: summary, keyFindings (array), risks (array), nextSteps (array).
Keep it practical and action-oriented for a small business owner.`,

  nextStepSuggestion: `You are an operations advisor for Top Marble & Granite. Based on the current project status and details, suggest the most important next actions.

Current Status: {{status}}
Project Type: {{jobType}}
Customer Type: {{customerType}}
Deposit Status: {{depositStatus}}
Material Status: {{materialStatus}}
Days Since Last Update: {{daysSinceUpdate}}

Provide 3-5 prioritized next steps specific to this project stage. Be specific and actionable.`,

  customerMessageDraft: `You are drafting a customer communication for Top Marble & Granite. Write a {{tone}} {{channel}} message.

Project: {{projectName}}
Customer: {{customerName}}
Current Stage: {{currentStage}}
Purpose: {{purpose}}
Key Details: {{keyDetails}}

Write a {{channel}} message that is:
- Professional but warm
- Clear about what's happening and any actions needed
- Appropriately sized for {{channel}} (brief for SMS, detailed for email)
- Includes relevant project details
- Ends with contact info if email`,

  naturalLanguageSearch: `You are a search assistant for Top Marble & Granite's project management system. Convert the following natural language query into structured search parameters.

Query: "{{query}}"

Available fields to search:
- status: [NEW_LEAD, MEASUREMENT_NEEDED, MEASUREMENT_SCHEDULED, ESTIMATE_SENT, DEPOSIT_PENDING, DEPOSIT_PAID, WAITING_FOR_STONE, IN_FABRICATION, INSTALL_SCHEDULED, FINAL_PAYMENT_PENDING, CLOSED, etc.]
- jobType: [COUNTERTOP, REPAIR, CABINET_INSTALL, COMMERCIAL]
- priority: [LOW, MEDIUM, HIGH, URGENT]
- dateRange: { start, end }
- customerType: [DIRECT, CONTRACTOR_REFERRED]
- paymentStatus: [PENDING, PAID, OVERDUE]

Return JSON with: { filters: {...}, sortBy: string, description: string }`,

  analyticsExplanation: `You are a business analytics advisor for Top Marble & Granite. Given these dashboard metrics, provide a brief plain-English summary of what they mean for the business.

Metrics:
{{metrics}}

Provide:
1. A 2-3 sentence overview
2. What's going well
3. Areas of concern
4. One actionable recommendation

Keep it conversational and practical for a business owner.`,

  riskAssessment: `You are a risk assessment tool for Top Marble & Granite. Analyze these active projects and flag any risks.

Projects:
{{projectsData}}

For each project with risks, identify:
- Risk type (payment_overdue, material_delay, schedule_conflict, missing_info, stale_project)
- Severity (low, medium, high, critical)
- Description
- Recommendation

Return as JSON array of risk flags. Only flag genuine concerns.`,
};

// ─── AI Service Class ───────────────────────────────────────────────────────

class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || "";
  }

  /**
   * Generate a project summary using Claude
   */
  async generateProjectSummary(projectDetails: string): Promise<AIProjectSummary> {
    const prompt = AI_PROMPTS.projectSummary.replace("{{projectDetails}}", projectDetails);

    try {
      const response = await this.callClaude(prompt);
      return JSON.parse(response);
    } catch {
      return {
        summary: "Unable to generate summary at this time.",
        keyFindings: [],
        risks: [],
        nextSteps: ["Retry summary generation"],
      };
    }
  }

  /**
   * Get next-step suggestions for a project
   */
  async getNextSteps(params: {
    status: string;
    jobType: string;
    customerType: string;
    depositStatus: string;
    materialStatus: string;
    daysSinceUpdate: number;
  }): Promise<string[]> {
    let prompt = AI_PROMPTS.nextStepSuggestion;
    for (const [key, value] of Object.entries(params)) {
      prompt = prompt.replace(`{{${key}}}`, String(value));
    }

    try {
      const response = await this.callClaude(prompt);
      return response.split("\n").filter((line: string) => line.trim());
    } catch {
      return ["Follow up on project status", "Check for any pending items"];
    }
  }

  /**
   * Draft a customer message
   */
  async draftCustomerMessage(params: {
    projectName: string;
    customerName: string;
    currentStage: string;
    purpose: string;
    keyDetails: string;
    channel: "email" | "sms" | "whatsapp";
    tone: "professional" | "friendly" | "urgent";
  }): Promise<AIMessageDraft> {
    let prompt = AI_PROMPTS.customerMessageDraft;
    for (const [key, value] of Object.entries(params)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }

    try {
      const response = await this.callClaude(prompt);
      return {
        subject: params.channel === "email" ? `Update: ${params.projectName}` : "",
        body: response,
        channel: params.channel,
        tone: params.tone,
      };
    } catch {
      return {
        subject: "",
        body: "Unable to draft message. Please try again.",
        channel: params.channel,
        tone: params.tone,
      };
    }
  }

  /**
   * Process natural language search query
   */
  async processSearchQuery(query: string): Promise<AISearchResult> {
    const prompt = AI_PROMPTS.naturalLanguageSearch.replace("{{query}}", query);

    try {
      const response = await this.callClaude(prompt);
      return {
        query,
        interpretation: response,
        results: [],
      };
    } catch {
      return { query, interpretation: "Unable to process query", results: [] };
    }
  }

  /**
   * Generate risk flags for active projects
   */
  async assessRisks(projectsData: string): Promise<AIRiskFlag[]> {
    const prompt = AI_PROMPTS.riskAssessment.replace("{{projectsData}}", projectsData);

    try {
      const response = await this.callClaude(prompt);
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  /**
   * Call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    if (!this.apiKey) {
      console.log("[AI] No API key configured, returning mock response");
      return this.getMockResponse(prompt);
    }

    // Using @anthropic-ai/sdk
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: this.apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text : "";
  }

  private getMockResponse(prompt: string): string {
    if (prompt.includes("project summary") || prompt.includes("Project Details:")) {
      return JSON.stringify({
        summary: "This project is progressing well through the pipeline. Key milestones have been met on schedule.",
        keyFindings: [
          "Customer deposit has been received",
          "Material has been selected and ordered",
          "Fabrication is on track for scheduled date",
        ],
        risks: ["Material delivery may be delayed by 2-3 days based on vendor timeline"],
        nextSteps: [
          "Confirm material delivery date with vendor",
          "Schedule fabrication slot",
          "Send customer progress update",
        ],
      });
    }
    return "AI response placeholder - configure ANTHROPIC_API_KEY for real responses.";
  }
}

export const aiService = new AIService();
