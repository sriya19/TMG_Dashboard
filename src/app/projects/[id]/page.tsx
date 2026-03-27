"use client";

import { use, useState } from "react";
import Link from "next/link";
import { projects, customers, contractors, payments, scheduleEvents, users } from "@/lib/seed-data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, type ProjectStatus } from "@/lib/types";
import {
  ArrowLeft, Edit, Send, Clock, DollarSign, Calendar, FileText,
  MessageSquare, Bot, User, Phone, Mail, MapPin, CheckCircle2,
  AlertCircle, Package, Hammer, Camera, Upload,
} from "lucide-react";

const TABS = [
  "Overview",
  "Scope & Materials",
  "Payments",
  "Schedule",
  "Files",
  "Communications",
  "AI Assistant",
] as const;

type Tab = (typeof TABS)[number];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
          <p className="text-slate-500 mb-6">The project you are looking for does not exist or has been removed.</p>
          <Link href="/projects" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === project.customerId);
  const contractor = project.contractorId ? contractors.find((c) => c.id === project.contractorId) : null;
  const projectPayments = payments.filter((p) => p.projectId === project.id);
  const projectEvents = scheduleEvents.filter((e) => e.projectId === project.id);
  const assignedUser = project.assignedToId ? users.find((u) => u.id === project.assignedToId) : null;

  const statusLabel = STATUS_LABELS[project.status as ProjectStatus] ?? project.status;
  const statusColor = STATUS_COLORS[project.status as ProjectStatus] ?? "bg-gray-100 text-gray-800";

  const totalPaid = projectPayments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = (project.totalEstimate ?? 0) - totalPaid;

  // Mock timeline entries
  const timelineEntries = [
    { label: "Project created", date: project.createdAt, user: "Maria Torres" },
    { label: "Measurement scheduled", date: new Date(new Date(project.createdAt).getTime() + 2 * 86400000), user: "Mike Johnson" },
    { label: "Estimate sent", date: new Date(new Date(project.createdAt).getTime() + 5 * 86400000), user: "Maria Torres" },
    { label: statusLabel, date: new Date(new Date(project.createdAt).getTime() + 7 * 86400000), user: assignedUser?.name ?? "System" },
  ];

  // Mock communications
  const mockComms = [
    { channel: "EMAIL" as const, direction: "OUTBOUND" as const, recipient: customer ? `${customer.firstName} ${customer.lastName}` : "Customer", subject: "Estimate for your project", date: new Date(new Date(project.createdAt).getTime() + 5 * 86400000) },
    { channel: "SMS" as const, direction: "INBOUND" as const, recipient: customer ? `${customer.firstName} ${customer.lastName}` : "Customer", subject: "Sounds good, let me review the estimate.", date: new Date(new Date(project.createdAt).getTime() + 6 * 86400000) },
    { channel: "PHONE" as const, direction: "OUTBOUND" as const, recipient: customer ? `${customer.firstName} ${customer.lastName}` : "Customer", subject: "Follow-up call regarding project timeline", date: new Date(new Date(project.createdAt).getTime() + 8 * 86400000) },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {project.projectNumber} &mdash; {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {project.jobType.replace(/_/g, " ")}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.priority === "URGENT" ? "bg-red-100 text-red-700" :
                  project.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                  project.priority === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-700"
                }`}>
                  {project.priority}
                </span>
                {project.secondaryStatus && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {String(project.secondaryStatus).replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                <Clock className="w-4 h-4" />
                Update Status
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                <Send className="w-4 h-4" />
                Send Update
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <Edit className="w-4 h-4" />
                Edit Project
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Customer Information
                </h3>
                {customer ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-slate-900">{customer.firstName} {customer.lastName}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        customer.customerType === "DIRECT" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {customer.customerType === "DIRECT" ? "Direct" : "Contractor Referred"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {customer.address}, {customer.city}, {customer.state} {customer.zip}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No customer information available.</p>
                )}
              </div>

              {/* Contractor Info */}
              {contractor && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-slate-400" />
                    Contractor Information
                  </h3>
                  <div className="space-y-3">
                    <p className="text-lg font-medium text-slate-900">{contractor.companyName}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        {contractor.contactName}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {contractor.phone}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {contractor.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Project Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />
                  <div className="space-y-6">
                    {timelineEntries.map((entry, i) => (
                      <div key={i} className="relative flex items-start gap-4 pl-8">
                        <div className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 ${
                          i === timelineEntries.length - 1
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-slate-300"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(entry.date)} &middot; {entry.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Internal Notes
                </h3>
                <textarea
                  className="w-full h-32 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Add internal notes about this project..."
                  defaultValue=""
                />
              </div>

              {/* AI Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-slate-400" />
                  AI Summary
                </h3>
                <div className="text-center py-6">
                  <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-4">No AI summary has been generated for this project yet.</p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    <Bot className="w-4 h-4" />
                    Generate AI Summary
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Current Status</h3>
                <div className="text-center mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
                <button className="w-full mt-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-center">
                  Update Status
                </button>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  Financial Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Estimate</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(project.totalEstimate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Deposit</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(project.deposit)}</span>
                      {totalPaid > 0 ? (
                        <span className="ml-2 text-xs text-green-600 font-medium">Paid</span>
                      ) : project.deposit ? (
                        <span className="ml-2 text-xs text-amber-600 font-medium">Pending</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Balance Due</span>
                    <span className={`text-sm font-bold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Dates */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Key Dates
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Created", value: formatDate(project.createdAt) },
                    { label: "Estimate Date", value: "Not set" },
                    { label: "Approval", value: "Not set" },
                    { label: "Deposit Paid", value: totalPaid > 0 ? formatDate(projectPayments.find(p => p.status === "PAID")?.paidDate) || "Not set" : "Not set" },
                    { label: "Install Date", value: projectEvents.find(e => e.eventType === "INSTALLATION")?.startTime ? formatDate(projectEvents.find(e => e.eventType === "INSTALLATION")!.startTime) : "Not set" },
                    { label: "Completion", value: "Not set" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-slate-500">{item.label}</span>
                      <span className={`font-medium ${item.value === "Not set" ? "text-slate-400" : "text-slate-900"}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Staff */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Assigned Staff
                </h3>
                {assignedUser ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                      {assignedUser.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{assignedUser.name}</p>
                      <p className="text-xs text-slate-500">{assignedUser.role.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Unassigned</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Scope & Materials" && (
          <div className="space-y-6">
            {/* Scope Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                Scope Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Areas of Work</h4>
                  <ul className="space-y-2">
                    {[
                      { label: "Kitchen", checked: project.name.toLowerCase().includes("kitchen") },
                      { label: "Vanity / Bathroom", checked: project.name.toLowerCase().includes("bath") || project.name.toLowerCase().includes("vanity") },
                      { label: "Fireplace", checked: project.name.toLowerCase().includes("fireplace") },
                      { label: "Bar", checked: project.name.toLowerCase().includes("bar") },
                      { label: "Outdoor", checked: project.name.toLowerCase().includes("outdoor") },
                      { label: "Cabinets", checked: project.jobType === "CABINET_INSTALL" },
                    ].map((area) => (
                      <li key={area.label} className="flex items-center gap-2 text-sm">
                        {area.checked ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        <span className={area.checked ? "text-slate-900" : "text-slate-400"}>{area.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Stone Details</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: "Material", value: project.name.toLowerCase().includes("granite") ? "Granite" : project.name.toLowerCase().includes("quartz") ? "Quartz" : project.name.toLowerCase().includes("marble") ? "Marble" : "TBD" },
                        { label: "Color", value: "To be selected" },
                        { label: "Vendor", value: "To be assigned" },
                        { label: "Edge Profile", value: "Bullnose" },
                        { label: "Backsplash", value: "Standard 4\"" },
                        { label: "Waterfall", value: "No" },
                        { label: "Miter", value: "No" },
                        { label: "Sink Details", value: "Undermount" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-medium text-slate-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                Materials
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-3 font-medium text-slate-500">Material Name</th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">Vendor</th>
                      <th className="text-right py-3 px-3 font-medium text-slate-500">Cost</th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">Delivery Status</th>
                      <th className="text-left py-3 px-3 font-medium text-slate-500">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3 text-slate-900">
                        {project.name.toLowerCase().includes("granite") ? "Granite Slab" : project.name.toLowerCase().includes("quartz") ? "Quartz Slab" : project.name.toLowerCase().includes("marble") ? "Marble Slab" : "Stone Slab"}
                      </td>
                      <td className="py-3 px-3 text-slate-600">MSI Surfaces</td>
                      <td className="py-3 px-3 text-right text-slate-900">{formatCurrency((project.totalEstimate ?? 0) * 0.4)}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                          Ordered
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">Standard thickness</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3 text-slate-900">Undermount Sink</td>
                      <td className="py-3 px-3 text-slate-600">Kohler</td>
                      <td className="py-3 px-3 text-right text-slate-900">{formatCurrency(350)}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Delivered
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">Customer supplied</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Total Estimate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(project.totalEstimate)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <p className="text-sm text-slate-500">Balance Due</p>
                <p className={`text-2xl font-bold mt-1 ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(balanceDue)}
                </p>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  Payment History
                </h3>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  <DollarSign className="w-4 h-4" />
                  Record Payment
                </button>
              </div>
              {projectPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Invoice #</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Type</th>
                        <th className="text-right py-3 px-3 font-medium text-slate-500">Amount</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Status</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Method</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Due Date</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-100">
                          <td className="py-3 px-3 font-medium text-slate-900">{payment.invoiceNumber}</td>
                          <td className="py-3 px-3 text-slate-600">{payment.paymentType}</td>
                          <td className="py-3 px-3 text-right font-medium text-slate-900">{formatCurrency(payment.amount)}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === "PAID" ? "bg-green-100 text-green-800" :
                              payment.status === "OVERDUE" ? "bg-red-100 text-red-800" :
                              payment.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                              "bg-slate-100 text-slate-800"
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{payment.paymentMethod ?? "\u2014"}</td>
                          <td className="py-3 px-3 text-slate-600">{formatDate(payment.dueDate)}</td>
                          <td className="py-3 px-3 text-slate-600">{payment.paidDate ? formatDate(payment.paidDate) : "\u2014"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No payments recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Schedule" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Scheduled Events</h3>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <Calendar className="w-4 h-4" />
                Schedule Event
              </button>
            </div>
            {projectEvents.length > 0 ? (
              <div className="space-y-4">
                {projectEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            event.eventType === "INSTALLATION" ? "bg-green-100 text-green-800" :
                            event.eventType === "MEASUREMENT" ? "bg-purple-100 text-purple-800" :
                            event.eventType === "FABRICATION" ? "bg-teal-100 text-teal-800" :
                            event.eventType === "REPAIR_VISIT" ? "bg-orange-100 text-orange-800" :
                            event.eventType === "CONSULTATION" ? "bg-blue-100 text-blue-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            {event.eventType.replace(/_/g, " ")}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            event.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                            event.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                            event.status === "SCHEDULED" ? "bg-amber-100 text-amber-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-900">{event.title}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateTime(event.startTime)} &mdash; {formatDateTime(event.endTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <User className="w-3.5 h-3.5" />
                          Team: {event.assignedTeam.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No events scheduled for this project.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Files" && (
          <div className="space-y-6">
            {["Before Photos", "Site Photos", "Slab Photos", "Receipts", "Documents"].map((category) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  {category === "Before Photos" || category === "Site Photos" || category === "Slab Photos" ? (
                    <Camera className="w-4 h-4 text-slate-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400" />
                  )}
                  {category}
                </h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 mb-1">Upload files</p>
                  <p className="text-xs text-slate-400">No files uploaded yet</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Communications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Communication Log</h3>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
            <div className="space-y-4">
              {mockComms.map((comm, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      comm.channel === "EMAIL" ? "bg-blue-100" :
                      comm.channel === "SMS" ? "bg-green-100" :
                      "bg-amber-100"
                    }`}>
                      {comm.channel === "EMAIL" ? <Mail className="w-4 h-4 text-blue-600" /> :
                       comm.channel === "SMS" ? <MessageSquare className="w-4 h-4 text-green-600" /> :
                       <Phone className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          comm.direction === "OUTBOUND" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                        }`}>
                          {comm.direction === "OUTBOUND" ? "Sent" : "Received"}
                        </span>
                        <span className="text-xs text-slate-500">{comm.channel}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{comm.recipient}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{comm.subject}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(comm.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "AI Assistant" && (
          <div className="space-y-6">
            {/* AI Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-slate-400" />
                AI Summary
              </h3>
              <div className="text-center py-6">
                <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">Generate an AI-powered summary of this project.</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  <Bot className="w-4 h-4" />
                  Generate Summary
                </button>
              </div>
            </div>

            {/* AI Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                AI Next Steps
              </h3>
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">Get AI-suggested next steps for this project.</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Get Suggestions
                </button>
              </div>
            </div>

            {/* AI Message Draft */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                AI Message Draft
              </h3>
              <div className="text-center py-6">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">Draft a customer update message with AI assistance.</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  <MessageSquare className="w-4 h-4" />
                  Draft Customer Update
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-slate-400" />
                AI Chat
              </h3>
              <div className="h-48 border border-slate-200 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-sm text-slate-400">Ask the AI assistant about this project...</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
