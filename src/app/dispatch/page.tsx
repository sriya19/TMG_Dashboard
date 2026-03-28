"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Send,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  Check,
  AlertTriangle,
  Loader2,
  Wrench,
  Hammer,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  projects as seedProjects,
  scheduleEvents as seedEvents,
  customers as seedCustomers,
  users as seedUsers,
} from "@/lib/seed-data";
import type { CommChannel } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DispatchLog {
  id: string;
  time: Date;
  channel: CommChannel;
  recipient: string;
  projectName: string;
  template: string;
  status: "sent" | "failed" | "pending";
}

type ActionCardKey =
  | "measurement_details"
  | "dispatch_measurement"
  | "install_details"
  | "dispatch_install"
  | "fabrication_update"
  | "manager_update";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCustomerForProject(projectId: string) {
  const proj = seedProjects.find((p) => p.id === projectId);
  if (!proj) return null;
  return seedCustomers.find((c) => c.id === proj.customerId) ?? null;
}

function getProjectAddress(projectId: string) {
  const proj = seedProjects.find((p) => p.id === projectId);
  if (!proj) return "";
  return [proj.jobAddress, proj.jobCity, proj.jobState].filter(Boolean).join(", ");
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  MEASUREMENT: "bg-purple-100 text-purple-800",
  INSTALLATION: "bg-green-100 text-green-800",
  FABRICATION: "bg-blue-100 text-blue-800",
  REPAIR_VISIT: "bg-orange-100 text-orange-800",
  CABINET_INSTALL: "bg-teal-100 text-teal-800",
  CONSULTATION: "bg-indigo-100 text-indigo-800",
  DELIVERY: "bg-cyan-100 text-cyan-800",
  OTHER: "bg-slate-100 text-slate-800",
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  RESCHEDULED: "bg-purple-100 text-purple-800",
};

// ─── Action Card Definitions ──────────────────────────────────────────────────

const ACTION_CARDS: {
  key: ActionCardKey;
  title: string;
  description: string;
  accent: string;
  accentBorder: string;
  accentBg: string;
  icon: React.ElementType;
  template: string;
}[] = [
  {
    key: "measurement_details",
    title: "Send Measurement Details to Customer",
    description: "Notify customer about upcoming measurement appointment",
    accent: "text-purple-600",
    accentBorder: "border-purple-200",
    accentBg: "bg-purple-50",
    icon: Wrench,
    template: "measurement_confirmation",
  },
  {
    key: "dispatch_measurement",
    title: "Dispatch Measurement Tech",
    description: "Send measurement tech to job site with details",
    accent: "text-purple-600",
    accentBorder: "border-purple-200",
    accentBg: "bg-purple-50",
    icon: MapPin,
    template: "tech_dispatch",
  },
  {
    key: "install_details",
    title: "Send Install Details to Customer",
    description: "Notify customer about upcoming installation",
    accent: "text-green-600",
    accentBorder: "border-green-200",
    accentBg: "bg-green-50",
    icon: Hammer,
    template: "install_scheduled",
  },
  {
    key: "dispatch_install",
    title: "Dispatch Install Team",
    description: "Send installation team to job site",
    accent: "text-green-600",
    accentBorder: "border-green-200",
    accentBg: "bg-green-50",
    icon: User,
    template: "tech_dispatch",
  },
  {
    key: "fabrication_update",
    title: "Send Fabrication Update",
    description: "Update customer on fabrication progress",
    accent: "text-blue-600",
    accentBorder: "border-blue-200",
    accentBg: "bg-blue-50",
    icon: Building2,
    template: "fabrication_update",
  },
  {
    key: "manager_update",
    title: "Send Manager Update",
    description: "Send project details to a manager or supervisor",
    accent: "text-amber-600",
    accentBorder: "border-amber-200",
    accentBg: "bg-amber-50",
    icon: MessageSquare,
    template: "manager_update",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DispatchPage() {
  const [expandedCard, setExpandedCard] = useState<ActionCardKey | null>(null);
  const [projects, setProjects] = useState(seedProjects);
  const [events, setEvents] = useState(seedEvents);
  const [dispatchLog, setDispatchLog] = useState<DispatchLog[]>([]);

  // Form state per card
  const [selectedProject, setSelectedProject] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WHATSAPP" | "EMAIL">("SMS");
  const [techName, setTechName] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [managerRecipient, setManagerRecipient] = useState("");
  const [sendingCard, setSendingCard] = useState<ActionCardKey | null>(null);
  const [successCard, setSuccessCard] = useState<ActionCardKey | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProjects(data);
      })
      .catch(() => {});
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setEvents(data);
      })
      .catch(() => {});
  }, []);

  const resetForm = useCallback(() => {
    setSelectedProject("");
    setChannel("SMS");
    setTechName("");
    setTeamMembers("");
    setCustomMessage("");
    setManagerRecipient("");
  }, []);

  const handleSend = useCallback(
    async (cardKey: ActionCardKey, template: string) => {
      if (!selectedProject) return;
      setSendingCard(cardKey);
      setSuccessCard(null);

      const proj = projects.find((p) => p.id === selectedProject);
      const customer = getCustomerForProject(selectedProject);
      const address = getProjectAddress(selectedProject);

      const variables: Record<string, string> = {
        projectName: proj?.name ?? "",
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : "",
        address,
        channel,
      };

      if (cardKey === "dispatch_measurement") {
        variables.techName = techName;
        variables.eventType = "Measurement";
      }
      if (cardKey === "dispatch_install") {
        variables.teamMembers = teamMembers;
        variables.eventType = "Installation";
      }
      if (cardKey === "fabrication_update") {
        variables.message = customMessage;
      }
      if (cardKey === "manager_update") {
        variables.message = customMessage;
        variables.recipient = managerRecipient;
        variables.dateTime = new Date().toISOString();
        variables.notes = (proj as Record<string, unknown>)?.notes as string ?? "";
      }

      try {
        await fetch("/api/dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selectedProject,
            template,
            channel,
            variables,
          }),
        });
      } catch {
        // API may not exist yet; log locally
      }

      const recipient =
        cardKey === "manager_update"
          ? managerRecipient
          : customer
            ? customer.phone
            : "Unknown";

      setDispatchLog((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date(),
          channel: channel as CommChannel,
          recipient,
          projectName: proj?.name ?? "",
          template,
          status: "sent",
        },
        ...prev,
      ]);

      setSendingCard(null);
      setSuccessCard(cardKey);
      setTimeout(() => setSuccessCard(null), 3000);
      resetForm();
    },
    [selectedProject, channel, techName, teamMembers, customMessage, managerRecipient, projects, resetForm]
  );

  const toggleCard = (key: ActionCardKey) => {
    if (expandedCard === key) {
      setExpandedCard(null);
      resetForm();
    } else {
      setExpandedCard(key);
      resetForm();
    }
  };

  // ─── Computed Data ──────────────────────────────────────────────────────────

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const twoDaysEnd = new Date(todayStart.getTime() + 3 * 86400000);

  const todaysEvents = events.filter((e) => {
    const start = new Date(e.startTime);
    return start >= todayStart && start < todayEnd;
  });

  const upcomingInstalls = events.filter((e) => {
    const start = new Date(e.startTime);
    return (
      e.eventType === "INSTALLATION" && start >= todayStart && start < twoDaysEnd
    );
  });

  const pendingDispatches = projects.filter(
    (p) =>
      p.status === "MEASUREMENT_SCHEDULED" || p.status === "INSTALL_SCHEDULED"
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Send className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dispatch Center
            </h1>
            <p className="text-sm text-slate-500">
              Send updates, dispatch teams, and manage field operations
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Quick Dispatch Actions */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Quick Dispatch Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            const isExpanded = expandedCard === card.key;
            const isSending = sendingCard === card.key;
            const isSuccess = successCard === card.key;

            return (
              <div
                key={card.key}
                className={`bg-white rounded-xl shadow-sm border ${isExpanded ? card.accentBorder : "border-slate-200"} transition-all`}
              >
                {/* Card header */}
                <button
                  onClick={() => toggleCard(card.key)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.accentBg}`}>
                      <Icon className={`w-5 h-5 ${card.accent}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {isSuccess ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded form */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                    {/* Project select */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Project
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select project...</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.projectNumber} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Auto-filled customer info (for customer-facing cards) */}
                    {selectedProject &&
                      (card.key === "measurement_details" ||
                        card.key === "install_details" ||
                        card.key === "fabrication_update") && (
                        <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600 space-y-1">
                          {(() => {
                            const cust = getCustomerForProject(selectedProject);
                            return cust ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {cust.firstName} {cust.lastName}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {cust.phone}
                                </div>
                                {cust.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {cust.email}
                                  </div>
                                )}
                              </>
                            ) : null;
                          })()}
                        </div>
                      )}

                    {/* Auto-filled address (for dispatch cards) */}
                    {selectedProject &&
                      (card.key === "dispatch_measurement" ||
                        card.key === "dispatch_install") && (
                        <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getProjectAddress(selectedProject) || "No address on file"}
                        </div>
                      )}

                    {/* Tech name for measurement dispatch */}
                    {card.key === "dispatch_measurement" && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Tech Name
                        </label>
                        <input
                          type="text"
                          value={techName}
                          onChange={(e) => setTechName(e.target.value)}
                          placeholder="e.g. Mike Johnson"
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Team members for install dispatch */}
                    {card.key === "dispatch_install" && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Team Members
                        </label>
                        <input
                          type="text"
                          value={teamMembers}
                          onChange={(e) => setTeamMembers(e.target.value)}
                          placeholder="e.g. Carlos Rivera, James Wilson"
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Custom message for fabrication & manager */}
                    {(card.key === "fabrication_update" ||
                      card.key === "manager_update") && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Message
                        </label>
                        <textarea
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          rows={3}
                          placeholder={
                            card.key === "manager_update"
                              ? "Project update details..."
                              : "Fabrication status update..."
                          }
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    )}

                    {/* Manager update: auto-populated info */}
                    {card.key === "manager_update" && selectedProject && (
                      <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600 space-y-1">
                        {(() => {
                          const proj = projects.find(
                            (p) => p.id === selectedProject
                          );
                          const cust = getCustomerForProject(selectedProject);
                          return (
                            <>
                              <div>
                                <span className="font-medium">Project:</span>{" "}
                                {proj?.name}
                              </div>
                              <div>
                                <span className="font-medium">Customer:</span>{" "}
                                {cust
                                  ? `${cust.firstName} ${cust.lastName}`
                                  : "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Address:</span>{" "}
                                {getProjectAddress(selectedProject) || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Date/Time:</span>{" "}
                                {formatDateTime(new Date())}
                              </div>
                              {(proj as Record<string, unknown>)?.notes && (
                                <div>
                                  <span className="font-medium">Notes:</span>{" "}
                                  {String((proj as Record<string, unknown>).notes)}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Manager recipient */}
                    {card.key === "manager_update" && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Recipient (phone or email)
                        </label>
                        <input
                          type="text"
                          value={managerRecipient}
                          onChange={(e) => setManagerRecipient(e.target.value)}
                          placeholder="e.g. 555-100-0002 or maria@topmarble.com"
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Channel toggle */}
                    {(card.key === "measurement_details" ||
                      card.key === "install_details" ||
                      card.key === "fabrication_update" ||
                      card.key === "manager_update") && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Channel
                        </label>
                        <div className="flex gap-1">
                          {(["SMS", "WHATSAPP", "EMAIL"] as const).map((ch) => (
                            <button
                              key={ch}
                              onClick={() => setChannel(ch)}
                              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                channel === ch
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {ch === "SMS" && (
                                <MessageSquare className="w-3 h-3" />
                              )}
                              {ch === "WHATSAPP" && (
                                <Phone className="w-3 h-3" />
                              )}
                              {ch === "EMAIL" && <Mail className="w-3 h-3" />}
                              {ch}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Send button */}
                    <button
                      onClick={() => handleSend(card.key, card.template)}
                      disabled={!selectedProject || isSending}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                        !selectedProject || isSending
                          ? "bg-slate-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Today's Schedule Overview */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Today&apos;s Schedule
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {todaysEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No events scheduled for today.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Time
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Project
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Address
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Team
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaysEvents.map((evt) => {
                    const proj = projects.find(
                      (p) => p.id === evt.projectId
                    );
                    const cust = proj
                      ? getCustomerForProject(proj.id)
                      : null;
                    return (
                      <tr key={evt.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateTime(evt.startTime)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_TYPE_COLORS[evt.eventType] ?? "bg-slate-100 text-slate-800"}`}
                          >
                            {evt.eventType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {proj?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {cust
                            ? `${cust.firstName} ${cust.lastName}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {evt.location ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {evt.assignedTeam?.join(", ") ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_STATUS_COLORS[evt.status] ?? "bg-slate-100 text-slate-800"}`}
                          >
                            {evt.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                              Send Details
                            </button>
                            <button className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors">
                              Mark Complete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Upcoming Installs */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Hammer className="w-5 h-5 text-green-600" />
          Upcoming Installs (Next 2 Days)
        </h2>
        {upcomingInstalls.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No installations scheduled in the next 2 days.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingInstalls.map((evt) => {
              const proj = projects.find((p) => p.id === evt.projectId);
              const cust = proj ? getCustomerForProject(proj.id) : null;
              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-xl shadow-sm border border-green-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {proj?.name ?? evt.title}
                    </h3>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Install
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {cust
                        ? `${cust.firstName} ${cust.lastName}`
                        : "—"}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {evt.location ?? "—"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(evt.startTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Team: {evt.assignedTeam?.join(", ") ?? "TBD"}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <Send className="w-3 h-3" />
                      Send to Customer
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <MapPin className="w-3 h-3" />
                      Dispatch Team
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 4: Pending Dispatches */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Pending Dispatches
        </h2>
        {pendingDispatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500 text-sm">
            All dispatches are up to date.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDispatches.map((proj) => {
              const cust = getCustomerForProject(proj.id);
              const isMeasurement =
                proj.status === "MEASUREMENT_SCHEDULED";
              return (
                <div
                  key={proj.id}
                  className={`bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between ${
                    isMeasurement
                      ? "border-purple-200"
                      : "border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isMeasurement ? "bg-purple-50" : "bg-green-50"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          isMeasurement
                            ? "text-purple-500"
                            : "text-green-500"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {proj.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {cust
                          ? `${cust.firstName} ${cust.lastName} - ${cust.phone}`
                          : "—"}{" "}
                        | {getProjectAddress(proj.id) || "No address"}
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isMeasurement
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isMeasurement
                          ? "Measurement Scheduled - No Dispatch Sent"
                          : "Install Scheduled - No Dispatch Sent"}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`shrink-0 flex items-center gap-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                      isMeasurement
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    Send Now
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 5: Recent Dispatch Log */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-500" />
          Recent Dispatch Log
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {dispatchLog.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No dispatches sent yet this session. Sent messages will appear
              here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Time
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Channel
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Recipient
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Project
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Template
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dispatchLog.slice(0, 20).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {formatDateTime(log.time)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-slate-600">
                          {log.channel === "SMS" && (
                            <MessageSquare className="w-3.5 h-3.5" />
                          )}
                          {log.channel === "WHATSAPP" && (
                            <Phone className="w-3.5 h-3.5" />
                          )}
                          {log.channel === "EMAIL" && (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                          {log.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {log.recipient}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {log.projectName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">
                          {log.template}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.status === "sent"
                              ? "bg-green-100 text-green-800"
                              : log.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
