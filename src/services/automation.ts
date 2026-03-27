/**
 * Automation & Event Engine
 *
 * Event-driven automation for the TMG Dashboard.
 * Triggers notifications and actions based on project lifecycle events.
 *
 * Each automation:
 * 1. Is triggered by a project status change or scheduled event
 * 2. Determines the appropriate action(s)
 * 3. Sends notifications via the messaging service
 * 4. Logs the automation in the project timeline
 */

import { messagingService, type MessageChannel } from "./messaging";

export type AutomationTrigger =
  | "status_changed"
  | "payment_received"
  | "payment_overdue"
  | "event_scheduled"
  | "event_reminder"
  | "event_completed"
  | "project_created"
  | "estimate_approved"
  | "material_delivered"
  | "project_completed"
  | "daily_check";

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  condition: (context: AutomationContext) => boolean;
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationAction {
  type: "send_notification" | "update_status" | "create_event" | "log_activity";
  channel?: MessageChannel;
  templateId?: string;
  recipient?: "customer" | "team" | "contractor" | "specific";
  details?: Record<string, string>;
}

export interface AutomationContext {
  projectId: string;
  projectName: string;
  projectNumber: string;
  status: string;
  previousStatus?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  contractorName?: string;
  assignedTeam: string[];
  eventType?: string;
  eventDate?: string;
  paymentAmount?: number;
  paymentType?: string;
  address?: string;
}

export interface AutomationLogEntry {
  id: string;
  ruleId: string;
  ruleName: string;
  projectId: string;
  trigger: AutomationTrigger;
  actions: string[];
  status: "success" | "failed" | "skipped";
  details: string;
  timestamp: Date;
}

// ─── Automation Rules ───────────────────────────────────────────────────────

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "auto-1",
    name: "Estimate Sent Notification",
    trigger: "status_changed",
    condition: (ctx) => ctx.status === "ESTIMATE_SENT",
    enabled: true,
    actions: [
      { type: "send_notification", channel: "email", templateId: "estimate_sent", recipient: "customer" },
      { type: "log_activity", details: { message: "Estimate sent notification delivered to customer" } },
    ],
  },
  {
    id: "auto-2",
    name: "Deposit Reminder",
    trigger: "status_changed",
    condition: (ctx) => ctx.status === "DEPOSIT_PENDING",
    enabled: true,
    actions: [
      { type: "send_notification", channel: "sms", templateId: "deposit_reminder", recipient: "customer" },
    ],
  },
  {
    id: "auto-3",
    name: "Measurement Scheduled - Customer",
    trigger: "event_scheduled",
    condition: (ctx) => ctx.eventType === "MEASUREMENT",
    enabled: true,
    actions: [
      { type: "send_notification", channel: "sms", templateId: "measurement_confirmation", recipient: "customer" },
      { type: "send_notification", channel: "sms", templateId: "tech_dispatch", recipient: "team" },
    ],
  },
  {
    id: "auto-4",
    name: "Install Scheduled - Customer",
    trigger: "event_scheduled",
    condition: (ctx) => ctx.eventType === "INSTALLATION",
    enabled: true,
    actions: [
      { type: "send_notification", channel: "sms", templateId: "install_scheduled", recipient: "customer" },
      { type: "send_notification", channel: "sms", templateId: "tech_dispatch", recipient: "team" },
    ],
  },
  {
    id: "auto-5",
    name: "Install Reminder (Day Before)",
    trigger: "event_reminder",
    condition: (ctx) => ctx.eventType === "INSTALLATION",
    enabled: true,
    actions: [
      { type: "send_notification", channel: "sms", templateId: "install_reminder", recipient: "customer" },
    ],
  },
  {
    id: "auto-6",
    name: "Project Completed - Thank You",
    trigger: "project_completed",
    condition: () => true,
    enabled: true,
    actions: [
      { type: "send_notification", channel: "email", templateId: "completion_thankyou", recipient: "customer" },
    ],
  },
  {
    id: "auto-7",
    name: "Final Payment Reminder",
    trigger: "status_changed",
    condition: (ctx) => ctx.status === "FINAL_PAYMENT_PENDING",
    enabled: true,
    actions: [
      { type: "send_notification", channel: "sms", templateId: "final_payment_reminder", recipient: "customer" },
    ],
  },
  {
    id: "auto-8",
    name: "Overdue Payment Alert",
    trigger: "payment_overdue",
    condition: () => true,
    enabled: true,
    actions: [
      { type: "send_notification", channel: "sms", templateId: "final_payment_reminder", recipient: "customer" },
      { type: "log_activity", details: { message: "Overdue payment alert sent" } },
    ],
  },
];

// ─── Automation Engine ──────────────────────────────────────────────────────

class AutomationEngine {
  private logs: AutomationLogEntry[] = [];

  /**
   * Process a trigger event against all automation rules
   */
  async processTrigger(
    trigger: AutomationTrigger,
    context: AutomationContext
  ): Promise<AutomationLogEntry[]> {
    const matchingRules = AUTOMATION_RULES.filter(
      (rule) => rule.enabled && rule.trigger === trigger && rule.condition(context)
    );

    const results: AutomationLogEntry[] = [];

    for (const rule of matchingRules) {
      const logEntry = await this.executeRule(rule, context);
      results.push(logEntry);
      this.logs.push(logEntry);
    }

    return results;
  }

  /**
   * Execute a single automation rule
   */
  private async executeRule(
    rule: AutomationRule,
    context: AutomationContext
  ): Promise<AutomationLogEntry> {
    const executedActions: string[] = [];

    try {
      for (const action of rule.actions) {
        switch (action.type) {
          case "send_notification": {
            const recipient = this.resolveRecipient(action.recipient || "customer", context);
            if (action.templateId) {
              await messagingService.sendTemplate(
                action.templateId,
                action.channel || "sms",
                recipient,
                {
                  customerName: context.customerName,
                  projectName: context.projectName,
                  projectNumber: context.projectNumber,
                  address: context.address || "",
                  date: context.eventDate || "",
                  time: context.eventDate || "",
                  amount: context.paymentAmount?.toString() || "",
                  depositAmount: context.paymentAmount?.toString() || "",
                  eventType: context.eventType || "",
                  customerPhone: context.customerPhone,
                  techName: context.assignedTeam[0] || "",
                  notes: "",
                }
              );
            }
            executedActions.push(`Sent ${action.channel} to ${action.recipient}`);
            break;
          }
          case "log_activity":
            executedActions.push(`Logged: ${action.details?.message || "activity"}`);
            break;
          case "update_status":
            executedActions.push(`Status update: ${action.details?.newStatus}`);
            break;
          case "create_event":
            executedActions.push(`Event created: ${action.details?.eventType}`);
            break;
        }
      }

      return {
        id: `log-${Date.now()}-${rule.id}`,
        ruleId: rule.id,
        ruleName: rule.name,
        projectId: context.projectId,
        trigger: rule.trigger,
        actions: executedActions,
        status: "success",
        details: `Executed ${executedActions.length} actions`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        id: `log-${Date.now()}-${rule.id}`,
        ruleId: rule.id,
        ruleName: rule.name,
        projectId: context.projectId,
        trigger: rule.trigger,
        actions: executedActions,
        status: "failed",
        details: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };
    }
  }

  private resolveRecipient(
    recipientType: string,
    context: AutomationContext
  ): string {
    switch (recipientType) {
      case "customer":
        return context.customerPhone || context.customerEmail;
      case "team":
        return context.assignedTeam[0] || "";
      case "contractor":
        return context.contractorName || "";
      default:
        return "";
    }
  }

  /**
   * Get automation logs
   */
  getLogs(projectId?: string): AutomationLogEntry[] {
    if (projectId) {
      return this.logs.filter((log) => log.projectId === projectId);
    }
    return this.logs;
  }

  /**
   * Run daily checks (overdue payments, stale projects, etc.)
   */
  async runDailyChecks(activeProjects: AutomationContext[]): Promise<AutomationLogEntry[]> {
    const allResults: AutomationLogEntry[] = [];
    for (const project of activeProjects) {
      const results = await this.processTrigger("daily_check", project);
      allResults.push(...results);
    }
    return allResults;
  }
}

export const automationEngine = new AutomationEngine();
