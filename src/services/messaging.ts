/**
 * Messaging Service (SMS, WhatsApp, Email)
 *
 * Handles sending notifications via multiple channels:
 * - SMS via Twilio
 * - WhatsApp via Twilio
 * - Email via SendGrid / Nodemailer
 *
 * Setup required:
 * 1. Twilio account with SMS and WhatsApp enabled
 * 2. SendGrid account or SMTP credentials
 * 3. Set environment variables (see .env.example)
 */

export type MessageChannel = "sms" | "whatsapp" | "email";

export interface MessagePayload {
  to: string; // Phone number or email
  channel: MessageChannel;
  subject?: string; // Email only
  body: string;
  projectId?: string;
  templateId?: string;
}

export interface MessageResult {
  success: boolean;
  messageId: string;
  channel: MessageChannel;
  timestamp: Date;
  error?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
  variables: string[]; // e.g., ["customerName", "projectName", "date"]
}

// Pre-built templates for common notifications
export const MESSAGE_TEMPLATES: Record<string, MessageTemplate> = {
  estimate_sent: {
    id: "estimate_sent",
    name: "Estimate Sent",
    channel: "email",
    subject: "Your Estimate from Top Marble & Granite",
    body: `Hi {{customerName}},

Thank you for your interest in Top Marble & Granite! We've prepared an estimate for your {{projectType}} project.

Project: {{projectName}}
Estimated Total: {{estimateAmount}}

Please review the attached estimate and let us know if you have any questions. We'd love to get started on making your vision a reality!

Best regards,
Top Marble & Granite Team
(555) 100-0001`,
    variables: ["customerName", "projectType", "projectName", "estimateAmount"],
  },

  deposit_reminder: {
    id: "deposit_reminder",
    name: "Deposit Reminder",
    channel: "sms",
    body: `Hi {{customerName}}, this is a reminder from Top Marble & Granite regarding the deposit of {{depositAmount}} for your {{projectName}} project. Please complete payment at your earliest convenience. Questions? Call us at (555) 100-0001.`,
    variables: ["customerName", "depositAmount", "projectName"],
  },

  measurement_confirmation: {
    id: "measurement_confirmation",
    name: "Measurement Confirmation",
    channel: "sms",
    body: `Hi {{customerName}}, your measurement appointment with Top Marble & Granite is confirmed for {{date}} at {{time}}. Address: {{address}}. Our technician {{techName}} will be there. Questions? Call (555) 100-0001.`,
    variables: ["customerName", "date", "time", "address", "techName"],
  },

  install_scheduled: {
    id: "install_scheduled",
    name: "Installation Scheduled",
    channel: "sms",
    body: `Hi {{customerName}}, your countertop installation is scheduled for {{date}} at {{time}}. Our team will arrive at {{address}}. Please ensure the area is cleared and accessible. See you soon! - Top Marble & Granite`,
    variables: ["customerName", "date", "time", "address"],
  },

  install_reminder: {
    id: "install_reminder",
    name: "Installation Reminder",
    channel: "sms",
    body: `Reminder: Your countertop installation with Top Marble & Granite is tomorrow, {{date}}. Our team will arrive around {{time}} at {{address}}. Please have the area ready. See you then!`,
    variables: ["date", "time", "address"],
  },

  completion_thankyou: {
    id: "completion_thankyou",
    name: "Completion Thank You",
    channel: "email",
    subject: "Thank You from Top Marble & Granite!",
    body: `Hi {{customerName}},

Thank you for choosing Top Marble & Granite for your {{projectName}} project! We hope you love your new countertops.

If you're happy with our work, we'd greatly appreciate a review on Google. Your feedback helps other homeowners find quality countertop services.

If you need anything in the future — repairs, additional projects, or referrals — don't hesitate to reach out!

Warm regards,
The Top Marble & Granite Team`,
    variables: ["customerName", "projectName"],
  },

  tech_dispatch: {
    id: "tech_dispatch",
    name: "Technician Dispatch",
    channel: "sms",
    body: `TMG Dispatch: {{eventType}} at {{address}}. Customer: {{customerName}} ({{customerPhone}}). Date: {{date}} {{time}}. Project: {{projectName}}. Notes: {{notes}}`,
    variables: ["eventType", "address", "customerName", "customerPhone", "date", "time", "projectName", "notes"],
  },

  final_payment_reminder: {
    id: "final_payment_reminder",
    name: "Final Payment Reminder",
    channel: "sms",
    body: `Hi {{customerName}}, the final payment of {{amount}} for your {{projectName}} project is due. Please submit payment at your convenience. Thank you! - Top Marble & Granite (555) 100-0001`,
    variables: ["customerName", "amount", "projectName"],
  },
};

class MessagingService {
  /**
   * Send a message via the specified channel
   */
  async send(payload: MessagePayload): Promise<MessageResult> {
    console.log(`[Messaging] Sending ${payload.channel} to ${payload.to}`);

    switch (payload.channel) {
      case "sms":
        return this.sendSMS(payload);
      case "whatsapp":
        return this.sendWhatsApp(payload);
      case "email":
        return this.sendEmail(payload);
      default:
        return { success: false, messageId: "", channel: payload.channel, timestamp: new Date(), error: "Unknown channel" };
    }
  }

  /**
   * Send a templated message
   */
  async sendTemplate(
    templateId: string,
    channel: MessageChannel,
    to: string,
    variables: Record<string, string>
  ): Promise<MessageResult> {
    const template = MESSAGE_TEMPLATES[templateId];
    if (!template) {
      return { success: false, messageId: "", channel, timestamp: new Date(), error: `Template ${templateId} not found` };
    }

    let body = template.body;
    let subject = template.subject;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      body = body.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value);
      if (subject) {
        subject = subject.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value);
      }
    }

    return this.send({ to, channel, subject, body });
  }

  private async sendSMS(payload: MessagePayload): Promise<MessageResult> {
    // TODO: Twilio SMS integration
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // const message = await client.messages.create({
    //   body: payload.body,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: payload.to,
    // });
    console.log(`[SMS] Would send to ${payload.to}: ${payload.body.substring(0, 50)}...`);
    return { success: true, messageId: `sms-${Date.now()}`, channel: "sms", timestamp: new Date() };
  }

  private async sendWhatsApp(payload: MessagePayload): Promise<MessageResult> {
    // TODO: Twilio WhatsApp integration
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // const message = await client.messages.create({
    //   body: payload.body,
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //   to: `whatsapp:${payload.to}`,
    // });
    console.log(`[WhatsApp] Would send to ${payload.to}: ${payload.body.substring(0, 50)}...`);
    return { success: true, messageId: `wa-${Date.now()}`, channel: "whatsapp", timestamp: new Date() };
  }

  private async sendEmail(payload: MessagePayload): Promise<MessageResult> {
    // TODO: SendGrid or Nodemailer integration
    // const msg = {
    //   to: payload.to,
    //   from: process.env.EMAIL_FROM,
    //   subject: payload.subject,
    //   text: payload.body,
    // };
    // await sgMail.send(msg);
    console.log(`[Email] Would send to ${payload.to}: ${payload.subject}`);
    return { success: true, messageId: `email-${Date.now()}`, channel: "email", timestamp: new Date() };
  }
}

export const messagingService = new MessagingService();
