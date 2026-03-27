/**
 * Google Calendar Integration Service
 *
 * Handles creating, updating, and managing calendar events
 * for measurements, installations, fabrication, and other scheduling.
 *
 * Setup required:
 * 1. Enable Google Calendar API in Google Cloud Console
 * 2. Create OAuth2 credentials
 * 3. Set environment variables (see .env.example)
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

  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  }

  /**
   * Build event description with project details
   */
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
    ]
      .filter(Boolean)
      .join("\n");
  }

  /**
   * Create a measurement event
   */
  async createMeasurementEvent(params: CreateEventParams): Promise<CalendarEvent> {
    console.log("[GCal] Creating measurement event:", params.title);
    const description = this.buildDescription(params);
    // TODO: Use Google Calendar API to create event
    // POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
    return this.mockEvent(params, description);
  }

  /**
   * Create an installation event
   */
  async createInstallEvent(params: CreateEventParams): Promise<CalendarEvent> {
    console.log("[GCal] Creating install event:", params.title);
    const description = this.buildDescription(params);
    return this.mockEvent(params, description);
  }

  /**
   * Create a fabrication event
   */
  async createFabricationEvent(params: CreateEventParams): Promise<CalendarEvent> {
    console.log("[GCal] Creating fabrication event:", params.title);
    const description = this.buildDescription(params);
    return this.mockEvent(params, description);
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, updates: Partial<CreateEventParams>): Promise<CalendarEvent> {
    console.log("[GCal] Updating event:", eventId);
    // TODO: PATCH https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}
    return this.mockEvent(
      {
        title: "Updated Event",
        description: "",
        location: "",
        startTime: new Date(),
        endTime: new Date(),
        attendeeEmails: [],
        projectNumber: "",
        eventType: "",
        customerName: "",
        customerPhone: "",
        assignedTeam: [],
        ...updates,
      },
      "Updated"
    );
  }

  /**
   * Delete/cancel an event
   */
  async cancelEvent(eventId: string): Promise<void> {
    console.log("[GCal] Cancelling event:", eventId);
    // TODO: DELETE https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}
  }

  /**
   * Get events for a date range
   */
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    console.log("[GCal] Getting events from", startDate, "to", endDate);
    // TODO: GET with timeMin and timeMax params
    return [];
  }

  /**
   * Reschedule an event
   */
  async rescheduleEvent(
    eventId: string,
    newStart: Date,
    newEnd: Date
  ): Promise<CalendarEvent> {
    console.log("[GCal] Rescheduling event:", eventId);
    return this.updateEvent(eventId, { startTime: newStart, endTime: newEnd });
  }

  private mockEvent(params: CreateEventParams, description: string): CalendarEvent {
    return {
      id: `gcal-${Date.now()}`,
      summary: params.title,
      description,
      location: params.location,
      start: { dateTime: params.startTime.toISOString(), timeZone: "America/Chicago" },
      end: { dateTime: params.endTime.toISOString(), timeZone: "America/Chicago" },
      attendees: params.attendeeEmails.map((email) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };
  }
}

export const googleCalendarService = new GoogleCalendarService();
