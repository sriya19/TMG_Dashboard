"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Calendar,
  Wrench,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Users,
  ChevronRight,
  ChevronDown,
  Hammer,
  UserPlus,
  Ruler,
  FileText,
  Receipt,
  Package,
  Factory,
  HardHat,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { projects, customers, contractors, payments, scheduleEvents, monthlyRevenue } from "@/lib/seed-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, type ProjectStatus } from "@/lib/types";

// ─── Helper Components ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status as ProjectStatus] || "bg-gray-100 text-gray-800";
  const label = STATUS_LABELS[status as ProjectStatus] || status;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {label}
    </span>
  );
}

function getEventColor(type: string) {
  const map: Record<string, string> = {
    MEASUREMENT: "bg-purple-100 text-purple-800",
    INSTALLATION: "bg-green-100 text-green-800",
    FABRICATION: "bg-blue-100 text-blue-800",
    REPAIR_VISIT: "bg-orange-100 text-orange-800",
    CONSULTATION: "bg-yellow-100 text-yellow-800",
    CABINET_INSTALL: "bg-teal-100 text-teal-800",
  };
  return map[type] || "bg-gray-100 text-gray-800";
}

function JobTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    COUNTERTOP: "bg-blue-50 text-blue-700",
    REPAIR: "bg-orange-50 text-orange-700",
    CABINET_INSTALL: "bg-teal-50 text-teal-700",
    COMMERCIAL: "bg-indigo-50 text-indigo-700",
  };
  const colors = map[type] || "bg-gray-100 text-gray-800";
  const label = type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {label}
    </span>
  );
}

// ─── Pipeline Stage Configuration ───────────────────────────────────────────

interface PipelineStage {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  statuses: ProjectStatus[];
  barColor: string;
  barGradientFrom: string;
  barGradientTo: string;
  bgColor: string;
  textColor: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  dotColor: string;
  ringColor: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    name: "Leads & Consultation",
    icon: UserPlus,
    statuses: ["NEW_LEAD", "CONSULTATION_PENDING"],
    barColor: "bg-blue-500",
    barGradientFrom: "from-blue-400",
    barGradientTo: "to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
    ringColor: "ring-blue-200",
  },
  {
    name: "Measurement",
    icon: Ruler,
    statuses: ["MEASUREMENT_NEEDED", "MEASUREMENT_SCHEDULED", "MEASUREMENT_COMPLETE"],
    barColor: "bg-purple-500",
    barGradientFrom: "from-purple-400",
    barGradientTo: "to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    dotColor: "bg-purple-500",
    ringColor: "ring-purple-200",
  },
  {
    name: "Estimating",
    icon: FileText,
    statuses: ["ESTIMATE_DRAFT", "ESTIMATE_SENT", "AWAITING_APPROVAL"],
    barColor: "bg-indigo-500",
    barGradientFrom: "from-indigo-400",
    barGradientTo: "to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    dotColor: "bg-indigo-500",
    ringColor: "ring-indigo-200",
  },
  {
    name: "Invoicing & Deposit",
    icon: Receipt,
    statuses: ["INVOICE_CREATED", "INVOICE_SENT", "DEPOSIT_PENDING", "DEPOSIT_PAID"],
    barColor: "bg-orange-500",
    barGradientFrom: "from-orange-400",
    barGradientTo: "to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    borderColor: "border-orange-200",
    dotColor: "bg-orange-500",
    ringColor: "ring-orange-200",
  },
  {
    name: "Materials",
    icon: Package,
    statuses: ["MATERIAL_ORDERED", "WAITING_FOR_STONE", "READY_FOR_FABRICATION"],
    barColor: "bg-cyan-500",
    barGradientFrom: "from-cyan-400",
    barGradientTo: "to-cyan-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    dotColor: "bg-cyan-500",
    ringColor: "ring-cyan-200",
  },
  {
    name: "Fabrication",
    icon: Factory,
    statuses: ["IN_FABRICATION", "FABRICATION_COMPLETE"],
    barColor: "bg-teal-500",
    barGradientFrom: "from-teal-400",
    barGradientTo: "to-teal-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    borderColor: "border-teal-200",
    dotColor: "bg-teal-500",
    ringColor: "ring-teal-200",
  },
  {
    name: "Installation",
    icon: HardHat,
    statuses: ["INSTALL_SCHEDULING_PENDING", "INSTALL_SCHEDULED", "INSTALLED"],
    barColor: "bg-green-500",
    barGradientFrom: "from-green-400",
    barGradientTo: "to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
    dotColor: "bg-green-500",
    ringColor: "ring-green-200",
  },
  {
    name: "Closeout",
    icon: CheckCircle2,
    statuses: ["FINAL_PAYMENT_PENDING", "CLOSED"],
    barColor: "bg-emerald-500",
    barGradientFrom: "from-emerald-400",
    barGradientTo: "to-emerald-600",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    borderColor: "border-gray-200",
    dotColor: "bg-emerald-500",
    ringColor: "ring-emerald-200",
  },
];

// ─── Dashboard Page ─────────────────────────────────────────────────────────

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────

  const activeProjects = projects.filter((p) => p.status !== "CLOSED");
  const installsThisWeek = scheduleEvents.filter((e) => e.eventType === "INSTALLATION");
  const measurementsComing = scheduleEvents.filter((e) => e.eventType === "MEASUREMENT");
  const depositsPending = payments
    .filter((p) => p.status === "PENDING" && p.paymentType === "DEPOSIT")
    .reduce((sum, p) => sum + p.amount, 0);
  const monthlyRevenueTotal = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstandingBalance = projects.reduce((sum, p) => sum + (p.balanceDue || 0), 0);

  // Operations pipeline computed data
  const pipelineData = PIPELINE_STAGES.map((stage) => {
    const stageProjects = projects.filter((p) =>
      (stage.statuses as string[]).includes(p.status)
    );
    const count = stageProjects.length;
    const value = stageProjects.reduce((sum, p) => sum + (p.totalEstimate || 0), 0);
    return { stage, stageProjects, count, value };
  });

  const maxProjectsInStage = Math.max(
    ...pipelineData.map((d) => d.count),
    1
  );

  const totalPipelineValue = pipelineData.reduce((sum, d) => sum + d.value, 0);

  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});

  const toggleStage = (index: number) => {
    setExpandedStages((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Urgent actions
  const overduePayments = payments.filter((p) => p.status === "OVERDUE");
  const upcomingInstalls = scheduleEvents.filter((e) => {
    const eventDate = new Date(e.startTime);
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    return e.eventType === "INSTALLATION" && eventDate >= now && eventDate <= twoDaysFromNow;
  });
  const waitingForStone = projects.filter((p) => p.status === "WAITING_FOR_STONE");
  const pendingDeposits = payments.filter((p) => p.status === "PENDING" && p.paymentType === "DEPOSIT");

  // Upcoming schedule - next 5 sorted by startTime
  const upcomingEvents = [...scheduleEvents]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  // Recent projects - last 8 sorted by createdAt desc
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Contractor performance
  const contractorPerformance = contractors.map((c) => {
    const contractorProjects = projects.filter((p) => p.contractorId === c.id);
    const activeCount = contractorProjects.filter((p) => p.status !== "CLOSED").length;
    const totalRevenue = contractorProjects.reduce((sum, p) => sum + (p.totalEstimate || 0), 0);
    return { ...c, activeCount, totalRevenue };
  });

  // Bottom quick stats
  const repairJobs = projects.filter((p) => p.jobType === "REPAIR").length;
  const commercialProjects = projects.filter((p) => p.jobType === "COMMERCIAL").length;
  const completedThisMonth = projects.filter((p) => p.status === "CLOSED").length;
  const projectsWithEstimate = projects.filter((p) => p.totalEstimate !== null && p.totalEstimate > 0);
  const avgTicketSize =
    projectsWithEstimate.length > 0
      ? projectsWithEstimate.reduce((sum, p) => sum + (p.totalEstimate || 0), 0) / projectsWithEstimate.length
      : 0;
  const directCustomers = customers.filter((c) => c.customerType === "DIRECT").length;
  const contractorReferred = customers.filter((c) => c.customerType === "CONTRACTOR_REFERRED").length;

  // ── Customer lookup helper ──────────────────────────────────────────────

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  };

  const getProjectForEvent = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  // ── Stat card config ────────────────────────────────────────────────────

  const statCards = [
    {
      label: "Active Projects",
      value: activeProjects.length,
      icon: FolderKanban,
      borderColor: "border-blue-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Installs This Week",
      value: installsThisWeek.length,
      icon: Hammer,
      borderColor: "border-green-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Measurements Coming",
      value: measurementsComing.length,
      icon: Wrench,
      borderColor: "border-purple-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Deposits Pending",
      value: formatCurrency(depositsPending),
      icon: Clock,
      borderColor: "border-orange-500",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(monthlyRevenueTotal),
      icon: DollarSign,
      borderColor: "border-emerald-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Outstanding Balance",
      value: formatCurrency(outstandingBalance),
      icon: TrendingDown,
      borderColor: "border-red-500",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LayoutDashboard className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <p className="text-sm text-slate-500">
            Welcome back! Here is what is happening at Top Marble &amp; Granite today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-l-4 ${card.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Operations Pipeline + Urgent Actions ─────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Operations Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Operations Pipeline</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track projects flowing through each business stage
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">{projects.length} projects</p>
              <p className="text-xs text-slate-400">{formatCurrency(totalPipelineValue)} total value</p>
            </div>
          </div>

          {/* Funnel visualization */}
          <div className="relative mt-4">
            {pipelineData.map((data, index) => {
              const { stage, stageProjects, count, value } = data;
              const isExpanded = expandedStages[index] || false;
              const StageIcon = stage.icon;
              const isLast = index === pipelineData.length - 1;

              // Funnel effect: each stage gets progressively narrower padding
              // The bar width is proportional to project count
              const barWidthPercent = Math.max(
                (count / maxProjectsInStage) * 100,
                count > 0 ? 8 : 0
              );

              // Funnel taper: reduce horizontal padding as we go down
              const funnelIndentPx = Math.round(index * 6);

              return (
                <div key={stage.name} style={{ paddingLeft: funnelIndentPx, paddingRight: funnelIndentPx }}>
                  {/* Stage row */}
                  <button
                    type="button"
                    onClick={() => toggleStage(index)}
                    className={`w-full group relative rounded-lg border ${stage.borderColor} transition-all duration-200 hover:shadow-md ${
                      isExpanded ? stage.bgColor : "bg-white hover:" + stage.bgColor
                    }`}
                  >
                    {/* Connecting line on the left */}
                    {!isLast && (
                      <div
                        className="absolute left-6 top-full w-0.5 h-2 bg-slate-200 z-10"
                        style={{ marginLeft: -funnelIndentPx + 3 * (index + 1) }}
                      />
                    )}

                    <div className="flex items-center gap-3 p-3">
                      {/* Stage number + icon */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full ${stage.iconBg} flex items-center justify-center ring-2 ${stage.ringColor}`}>
                          <StageIcon className={`h-4.5 w-4.5 ${stage.iconColor}`} />
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                          {index + 1}
                        </span>
                      </div>

                      {/* Stage info + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${stage.textColor}`}>
                            {stage.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {count > 0 && (
                              <span className={`inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1.5 rounded-full text-xs font-bold text-white ${stage.barColor}`}>
                                {count}
                              </span>
                            )}
                            {count === 0 && (
                              <span className="text-xs text-slate-300 font-medium">0</span>
                            )}
                            {value > 0 && (
                              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                                {formatCurrency(value)}
                              </span>
                            )}
                            <ChevronDown
                              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Progress bar with funnel tapering */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${stage.barGradientFrom} ${stage.barGradientTo} transition-all duration-700 ease-out`}
                            style={{ width: `${barWidthPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded status breakdown */}
                  {isExpanded && count > 0 && (
                    <div
                      className="mt-1 mb-1 space-y-1 overflow-hidden"
                      style={{ paddingLeft: 52 }}
                    >
                      {stage.statuses.map((status) => {
                        const statusCount = stageProjects.filter(
                          (p) => p.status === status
                        ).length;
                        if (statusCount === 0) return null;
                        const statusValue = stageProjects
                          .filter((p) => p.status === status)
                          .reduce((sum, p) => sum + (p.totalEstimate || 0), 0);
                        const statusBarWidth = Math.max(
                          (statusCount / count) * 100,
                          10
                        );
                        return (
                          <div
                            key={status}
                            className="flex items-center gap-3 text-xs py-1.5 px-3 rounded-md bg-white border border-slate-100 hover:border-slate-200 transition-colors"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${stage.dotColor} flex-shrink-0`} />
                            <StatusBadge status={status} />
                            <div className="flex-1 min-w-0">
                              <div className="w-full bg-slate-50 rounded-full h-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${stage.barColor} opacity-40`}
                                  style={{ width: `${statusBarWidth}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-slate-700 font-semibold">
                                {statusCount}
                              </span>
                              {statusValue > 0 && (
                                <span className="text-slate-400">
                                  {formatCurrency(statusValue)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isExpanded && count === 0 && (
                    <div
                      className="mt-1 mb-1 text-xs text-slate-400 italic py-2"
                      style={{ paddingLeft: 52 }}
                    >
                      No projects in this stage
                    </div>
                  )}

                  {/* Flow connector arrow between stages */}
                  {!isLast && (
                    <div className="flex justify-center py-0.5">
                      <ArrowRight className="h-3 w-3 text-slate-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgent Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Urgent Actions</h2>
          <div className="space-y-3">
            {overduePayments.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer transition-colors">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800">
                    {overduePayments.length} overdue payment{overduePayments.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-red-600">
                    {formatCurrency(overduePayments.reduce((s, p) => s + p.amount, 0))} total
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-red-400" />
              </div>
            )}

            {upcomingInstalls.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors">
                <Hammer className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">
                    {upcomingInstalls.length} install{upcomingInstalls.length !== 1 ? "s" : ""} next 2 days
                  </p>
                  <p className="text-xs text-green-600">Confirm teams and materials</p>
                </div>
                <ChevronRight className="h-4 w-4 text-green-400" />
              </div>
            )}

            {waitingForStone.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 cursor-pointer transition-colors">
                <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-800">
                    {waitingForStone.length} project{waitingForStone.length !== 1 ? "s" : ""} waiting for stone
                  </p>
                  <p className="text-xs text-amber-600">Follow up with suppliers</p>
                </div>
                <ChevronRight className="h-4 w-4 text-amber-400" />
              </div>
            )}

            {pendingDeposits.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors">
                <DollarSign className="h-5 w-5 text-orange-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-orange-800">
                    {pendingDeposits.length} pending deposit{pendingDeposits.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-orange-600">
                    {formatCurrency(pendingDeposits.reduce((s, p) => s + p.amount, 0))} awaiting
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-orange-400" />
              </div>
            )}

            {overduePayments.length === 0 &&
              upcomingInstalls.length === 0 &&
              waitingForStone.length === 0 &&
              pendingDeposits.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No urgent actions right now.</p>
              )}
          </div>
        </div>
      </div>

      {/* ── Upcoming Schedule + Revenue Trend ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Date/Time</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Type</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Project</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Location</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingEvents.map((event) => {
                  const project = getProjectForEvent(event.projectId);
                  return (
                    <tr key={event.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 whitespace-nowrap text-slate-700">
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        <span className="text-slate-400">
                          {new Date(event.startTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventColor(event.eventType)}`}
                        >
                          {event.eventType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-700">{project?.name || "Unknown"}</td>
                      <td className="py-2 px-2 text-slate-500 text-xs">{event.location}</td>
                      <td className="py-2 px-2 text-slate-500 text-xs">
                        {event.assignedTeam?.join(", ") || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue Trend</h2>
          {isMounted ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="costsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="costs"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#costsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 300 }} className="flex items-center justify-center text-slate-400">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Projects + Contractor Performance ─────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Project #</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Name</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Customer</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Status</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Type</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2 text-slate-500 text-xs font-mono">{project.projectNumber}</td>
                    <td className="py-2 px-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-2 px-2 text-slate-700">{getCustomerName(project.customerId)}</td>
                    <td className="py-2 px-2">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="py-2 px-2">
                      <JobTypeBadge type={project.jobType} />
                    </td>
                    <td className="py-2 px-2 text-right text-slate-700 font-medium">
                      {project.totalEstimate ? formatCurrency(project.totalEstimate) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contractor Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Contractor Performance</h2>
          <div className="space-y-4">
            {contractorPerformance.map((contractor) => {
              const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
              const colorIndex = contractors.indexOf(
                contractors.find((c) => c.id === contractor.id)!
              );
              return (
                <div key={contractor.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${colors[colorIndex % colors.length]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{contractor.companyName}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500">
                        {contractor.activeCount} active project{contractor.activeCount !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {formatCurrency(contractor.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Quick Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <Wrench className="h-5 w-5 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{repairJobs}</p>
          <p className="text-sm text-slate-500">Repair Jobs</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <Building2 className="h-5 w-5 text-indigo-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{commercialProjects}</p>
          <p className="text-sm text-slate-500">Commercial Projects</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <FolderKanban className="h-5 w-5 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{completedThisMonth}</p>
          <p className="text-sm text-slate-500">Completed This Month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <TrendingUp className="h-5 w-5 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(avgTicketSize)}</p>
          <p className="text-sm text-slate-500">Avg Ticket Size</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <Users className="h-5 w-5 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">
            {directCustomers} / {contractorReferred}
          </p>
          <p className="text-sm text-slate-500">Direct vs Contractor</p>
        </div>
      </div>
    </div>
  );
}
