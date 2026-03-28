import { NextRequest, NextResponse } from "next/server";
import { createCommunicationLog } from "@/lib/db";
import { messagingService, MESSAGE_TEMPLATES } from "@/services/messaging";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, channel, to, templateId, variables, customMessage, subject } = body;

    if (!projectId || !action) {
      return NextResponse.json({ error: "projectId and action required" }, { status: 400 });
    }

    let messageBody = customMessage || "";
    let messageSubject = subject || "";

    // Use template if specified
    if (templateId && variables) {
      const template = MESSAGE_TEMPLATES[templateId];
      if (template) {
        messageBody = template.body;
        messageSubject = template.subject || "";
        for (const [key, value] of Object.entries(variables as Record<string, string>)) {
          const placeholder = `{{${key}}}`;
          const escaped = placeholder.replace(/[{}]/g, "\\$&");
          messageBody = messageBody.replace(new RegExp(escaped, "g"), value);
          if (messageSubject) messageSubject = messageSubject.replace(new RegExp(escaped, "g"), value);
        }
      }
    }

    // Send via messaging service
    const result = await messagingService.send({
      to: to || "",
      channel: channel || "sms",
      subject: messageSubject,
      body: messageBody,
      projectId,
    });

    // Log the communication
    const log = await createCommunicationLog({
      projectId,
      channel: (channel || "SMS").toUpperCase(),
      direction: "OUTBOUND",
      recipient: to,
      subject: messageSubject || undefined,
      body: messageBody,
      status: result.success ? "sent" : "failed",
      externalId: result.messageId,
    });

    return NextResponse.json({ result, log }, { status: 201 });
  } catch (error) {
    console.error("Error dispatching message:", error);
    return NextResponse.json({ error: "Failed to dispatch message" }, { status: 500 });
  }
}
