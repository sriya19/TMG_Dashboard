"use client";

import { useState } from "react";
import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { scheduleEvents, projects, customers } from "@/lib/seed-data";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Send,
  Check,
  RefreshCw,
  Filter,
} from "lucide-react";

type ViewMode = "week" | "day" | "2day";
type EventFilter = "all" | "MEASUREMENT" | "INSTALLATION" | "FABRICATION" | "REPAIR_VISIT" | "CONSULTATION" | "CABINET_INSTALL";

const eventTypeColors: Record<string, { bg: string; border: string; text: string }> = {
  MEASUREMENT: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  INSTALLATION: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
  FABRICATION: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  REPAIR_VISIT: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
  CONSULTATION: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700" },
  CABINET_INSTALL: { bg: "bg-teal-50", border: "border-teal-300", text: "text-teal-700" },
};

function getProjectForEvent(event: (typeof scheduleEvents)[0]) {
  return projects.find((p) => p.id === event.projectId) ?? null;
}

function getCustomerForProject(project: ReturnType<typeof getProjectForEvent>) {
  if (!project) return null;
  return customers.find((c) => c.id === project.customerId) ?? null;
}

function getEventColors(eventType: string) {
  return eventTypeColors[eventType] ?? { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-700" };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");

  const filteredEvents =
    eventFilter === "all"
      ? scheduleEvents
      : scheduleEvents.filter((e) => e.eventType === eventFilter);

  function navigatePrev() {
    if (viewMode === "week") {
      setCurrentDate((d) => addDays(d, -7));
    } else if (viewMode === "2day") {
      setCurrentDate((d) => addDays(d, -2));
    } else {
      setCurrentDate((d) => addDays(d, -1));
    }
  }

  function navigateNext() {
    if (viewMode === "week") {
      setCurrentDate((d) => addDays(d, 7));
    } else if (viewMode === "2day") {
      setCurrentDate((d) => addDays(d, 2));
    } else {
      setCurrentDate((d) => addDays(d, 1));
    }
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Week view helpers
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  function eventsForDay(day: Date) {
    return filteredEvents.filter((e) => isSameDay(e.startTime, day));
  }

  // Render event card for week view (compact)
  function renderWeekEventCard(event: (typeof scheduleEvents)[0]) {
    const colors = getEventColors(event.eventType);
    return (
      <div
        key={event.id}
        className={`p-2 rounded border ${colors.bg} ${colors.border} mb-1 cursor-pointer hover:shadow-sm transition-shadow`}
      >
        <p className={`text-xs font-semibold ${colors.text}`}>{format(event.startTime, "h:mm a")}</p>
        <p className="text-xs font-medium text-slate-800 truncate">{event.title}</p>
        <p className="text-xs text-slate-500 truncate">{event.location}</p>
        <p className="text-xs text-slate-400">{event.assignedTeam?.[0]}</p>
      </div>
    );
  }

  // Render detailed event card for day/2-day views
  function renderDayEventCard(event: (typeof scheduleEvents)[0]) {
    const colors = getEventColors(event.eventType);
    const project = getProjectForEvent(event);
    const customer = getCustomerForProject(project);
    return (
      <div
        key={event.id}
        className={`p-4 rounded-lg border-l-4 ${colors.border} bg-white shadow-sm mb-3`}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}
              >
                {event.eventType.replace("_", " ")}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  event.status === "CONFIRMED"
                    ? "bg-green-100 text-green-700"
                    : event.status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {event.status}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800">{event.title}</h3>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {format(event.startTime, "h:mm a")} - {format(event.endTime, "h:mm a")}
            </span>
          </div>
          {project && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{project.name}</span>
            </div>
          )}
          {customer && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>
                {customer.firstName} {customer.lastName}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{event.location}</span>
          </div>
          {event.assignedTeam && event.assignedTeam.length > 0 && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Team: {event.assignedTeam.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <Send className="w-3 h-3" />
            Send Details
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
            <Check className="w-3 h-3" />
            Confirm
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <RefreshCw className="w-3 h-3" />
            Mark Complete
          </button>
        </div>
      </div>
    );
  }

  // Week View
  function renderWeekView() {
    return (
      <div className="grid grid-cols-7 gap-1 min-h-[500px]">
        {weekDays.map((day) => {
          const dayEvents = eventsForDay(day);
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="bg-white rounded border p-2">
              <div
                className={`text-center mb-2 pb-2 border-b ${
                  today ? "border-blue-300" : "border-slate-100"
                }`}
              >
                <p className={`text-xs font-medium ${today ? "text-blue-600" : "text-slate-500"}`}>
                  {format(day, "EEE")}
                </p>
                <p
                  className={`text-lg font-bold ${
                    today ? "text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : "text-slate-800"
                  }`}
                >
                  {format(day, "d")}
                </p>
              </div>
              <div>{dayEvents.map(renderWeekEventCard)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // Day View
  function renderDayView() {
    const dayEvents = eventsForDay(currentDate);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
          {isToday(currentDate) && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              Today
            </span>
          )}
        </h2>
        {dayEvents.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No events scheduled</p>
        ) : (
          dayEvents.map(renderDayEventCard)
        )}
      </div>
    );
  }

  // 2-Day View
  function renderTwoDayView() {
    const nextDay = addDays(currentDate, 1);
    const days = [currentDate, nextDay];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          return (
            <div key={day.toISOString()} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {format(day, "EEEE, MMMM d")}
                {isToday(day) && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </h2>
              {dayEvents.length === 0 ? (
                <p className="text-slate-400 text-sm py-8 text-center">No events scheduled</p>
              ) : (
                dayEvents.map(renderDayEventCard)
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Quick Actions - Installs Next 2 Days
  const installsNext2Days = scheduleEvents.filter(
    (e) =>
      e.eventType === "INSTALLATION" &&
      (isSameDay(e.startTime, currentDate) ||
        isSameDay(e.startTime, addDays(currentDate, 1)) ||
        isSameDay(e.startTime, addDays(currentDate, 2)))
  );

  // Quick Actions - Measurements This Week
  const measurementsThisWeek = scheduleEvents.filter(
    (e) =>
      e.eventType === "MEASUREMENT" &&
      e.startTime >= weekStart &&
      e.startTime <= weekEnd
  );

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule &amp; Calendar</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
            {(["day", "2day", "week"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {mode === "2day" ? "2-Day" : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrev}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={goToday}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value as EventFilter)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="MEASUREMENT">Measurements</option>
              <option value="INSTALLATION">Installations</option>
              <option value="FABRICATION">Fabrication</option>
              <option value="REPAIR_VISIT">Repairs</option>
              <option value="CONSULTATION">Consultations</option>
              <option value="CABINET_INSTALL">Cabinet Installs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date Label */}
      <div className="mb-4">
        <p className="text-sm text-slate-500">
          {viewMode === "week"
            ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
            : viewMode === "2day"
            ? `${format(currentDate, "MMM d")} - ${format(addDays(currentDate, 1), "MMM d, yyyy")}`
            : format(currentDate, "MMMM d, yyyy")}
        </p>
      </div>

      {/* Calendar View */}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
      {viewMode === "2day" && renderTwoDayView()}

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Installs Next 2 Days */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Installs Next 2 Days</h3>
          {installsNext2Days.length === 0 ? (
            <p className="text-sm text-slate-400">No installations in the next 2 days</p>
          ) : (
            <div className="space-y-3">
              {installsNext2Days.map((event) => {
                const project = getProjectForEvent(event);
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800">
                        {project?.name ?? event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(event.startTime, "EEE, MMM d")} at{" "}
                          {format(event.startTime, "h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <User className="w-3 h-3" />
                        <span>{event.assignedTeam?.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Measurements This Week */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Measurements This Week</h3>
          {measurementsThisWeek.length === 0 ? (
            <p className="text-sm text-slate-400">No measurements this week</p>
          ) : (
            <div className="space-y-3">
              {measurementsThisWeek.map((event) => {
                const project = getProjectForEvent(event);
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800">
                        {project?.name ?? event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(event.startTime, "EEE, MMM d")} at{" "}
                          {format(event.startTime, "h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <User className="w-3 h-3" />
                        <span>{event.assignedTeam?.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
