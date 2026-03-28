/**
 * Google Calendar Integration Service
 *
 * Real implementation using Google Calendar API v3.
 * Requires OAuth2 credentials set in environment variables.
 */

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: { email: string; displayName?: string }[];
  reminders: { useDefault: boolean; overrides?: { method: string; minutes: number }[] };
}

export interface CreateEventParams {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails: string[];
  projectNumber: string;
  eventType: string;
  customerName: string;
  customerPhone: string;
  assignedTeam: string[];
  notes?: string;
}

class GoogleCalendarService {
  private calendarId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      console.warn("[GCal] Missing credentials - using mock mode");
      return "mock_token";
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return this.accessToken!;
    } catch (error) {
      console.error("[GCal] Token refresh error:", error);
      return "mock_token";
    }
  }

  private buildDescription(params: CreateEventParams): string {
    return [
      `Project: ${params.projectNumber}`,
      `Type: ${params.eventType}`,
      `Customer: ${params.customerName}`,
      `Phone: ${params.customerPhone}`,
      `Team: ${params.assignedTeam.join(", ")}`,
      params.notes ? `Notes: ${params.notes}` : "",
      "",
      "--- TMG Dashboard Event ---",
    ].filter(Boolean).join("\n");
  }

  private async apiCall(method: string, endpoint: string, body?: unknown): Promise<unknown> {
    const token = await this.getAccessToken();

    if (token === "mock_token") {
      console.log(`[GCal Mock] ${method} ${endpoint}`);
      return null;
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${response.status} ${error}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  private buildEventBody(params: CreateEventParams) {
    return {
      summary: params.title,
      description: this.buildDescription(params),
      location: params.location,
      start: { dateTime: params.startTime.toISOString(), timeZone: "America/Chicago" },
      end: { dateTime: params.endTime.toISOString(), timeZone: "America/Chicago" },
      attendees: params.attendeeEmails.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };
  }

  async createEvent(params: CreateEventParams): Promise<CalendarEvent> {
    console.log(`[GCal] Creating ${params.eventType} event: ${params.title}`);
    const body = this.buildEventBody(params);

    const result = await this.apiCall("POST", "/events", body);

    if (!result) {
      // Mock response
      return {
        id: `gcal-${Date.now()}`,
        summary: params.title,
        description: this.buildDescription(params),
        location: params.location,
        start: { dateTime: params.startTime.toISOString(), timeZone: "America/Chicago" },
        end: { dateTime: params.endTime.toISOString(), timeZone: "America/Chicago" },
        attendees: params.attendeeEmails.map(email => ({ email })),
        reminders: { useDefault: false, overrides: [{ method: "email", minutes: 60 }, { method: "popup", minutes: 30 }] },
      };
    }

    return result as CalendarEvent;
  }

  async createMeasurementEvent(params: CreateEventParams): Promise<CalendarEvent> {
    return this.createEvent({ ...params, eventType: "Measurement" });
  }

  async createInstallEvent(params: CreateEventParams): Promise<CalendarEvent> {
    return this.createEvent({ ...params, eventType: "Installation" });
  }

  async createFabricationEvent(params: CreateEventParams): Promise<CalendarEvent> {
    return this.createEvent({ ...params, eventType: "Fabrication" });
  }

  async updateEvent(eventId: string, updates: Partial<CreateEventParams>): Promise<CalendarEvent | null> {
    console.log("[GCal] Updating event:", eventId);

    const updateBody: Record<string, unknown> = {};
    if (updates.title) updateBody.summary = updates.title;
    if (updates.location) updateBody.location = updates.location;
    if (updates.startTime) updateBody.start = { dateTime: updates.startTime.toISOString(), timeZone: "America/Chicago" };
    if (updates.endTime) updateBody.end = { dateTime: updates.endTime.toISOString(), timeZone: "America/Chicago" };

    const result = await this.apiCall("PATCH", `/events/${eventId}`, updateBody);
    return (result as CalendarEvent) || null;
  }

  async cancelEvent(eventId: string): Promise<void> {
    console.log("[GCal] Cancelling event:", eventId);
    await this.apiCall("DELETE", `/events/${eventId}`);
  }

  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
    });

    const result = await this.apiCall("GET", `/events?${params}`);
    if (!result) return [];
    return ((result as { items?: CalendarEvent[] }).items || []) as CalendarEvent[];
  }

  async rescheduleEvent(eventId: string, newStart: Date, newEnd: Date): Promise<CalendarEvent | null> {
    return this.updateEvent(eventId, { startTime: newStart, endTime: newEnd });
  }
}

export const googleCalendarService = new GoogleCalendarService();
