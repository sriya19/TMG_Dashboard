"use client";

import { projects, customers, scheduleEvents, payments } from "@/lib/seed-data";
import { users } from "@/lib/seed-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, type ProjectStatus } from "@/lib/types";
import Link from "next/link";
import { Wrench, Search, Plus, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { useState } from "react";

export default function RepairsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const repairProjects = projects.filter((p) => p.jobType === "REPAIR");

  const filteredRepairs = repairProjects.filter((p) => {
    const customer = customers.find((c) => c.id === p.customerId);
    const customerName = customer
      ? `${customer.firstName} ${customer.lastName}`.toLowerCase()
      : "";
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(query) ||
      p.projectNumber.toLowerCase().includes(query) ||
      customerName.includes(query);
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeRepairs = repairProjects.filter((p) => p.status !== "CLOSED").length;
  const completedRepairs = repairProjects.filter((p) => p.status === "CLOSED").length;
  const avgRepairValue =
    repairProjects.length > 0
      ? repairProjects.reduce((sum, p) => sum + (p.totalEstimate ?? 0), 0) /
        repairProjects.length
      : 0;
  const pendingSchedule = scheduleEvents.filter((e) => {
    const proj = repairProjects.find((p) => p.id === e.projectId);
    return proj && e.status === "SCHEDULED";
  }).length;

  const repairStatuses = Array.from(new Set(repairProjects.map((p) => p.status)));

  function getCustomerName(customerId: string) {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  }

  function getAssignedUser(userId: string | null) {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);
    return user?.name ?? "Unknown";
  }

  function getScheduledDate(projectId: string) {
    const event = scheduleEvents.find((e) => e.projectId === projectId);
    return event ? formatDate(event.startTime) : "-";
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Wrench className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Repair Jobs</h1>
            <p className="text-sm text-slate-500">Manage and track all repair projects</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search repairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
            <Plus className="h-4 w-4" />
            New Repair Job
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Repairs</p>
              <p className="text-2xl font-bold text-slate-900">{activeRepairs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{completedRepairs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Repair Value</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(avgRepairValue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Schedule</p>
              <p className="text-2xl font-bold text-slate-900">{pendingSchedule}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        >
          <option value="ALL">All Statuses</option>
          {repairStatuses.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status as ProjectStatus] ?? status}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredRepairs.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <Wrench className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700">No repair jobs found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 font-medium text-slate-600">Project #</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Description</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Priority</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Scheduled Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Assigned To</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepairs.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {project.projectNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {getCustomerName(project.customerId)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{project.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status as ProjectStatus] ?? "bg-gray-100 text-gray-800"}`}
                      >
                        {STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.priority === "URGENT"
                            ? "bg-red-100 text-red-700"
                            : project.priority === "HIGH"
                              ? "bg-orange-100 text-orange-700"
                              : project.priority === "MEDIUM"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {getScheduledDate(project.id)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {getAssignedUser(project.assignedToId)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(project.totalEstimate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
