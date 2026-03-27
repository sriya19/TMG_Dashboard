"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Filter,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { projects, customers, contractors, users } from "@/lib/seed-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type ProjectStatus,
} from "@/lib/types";

const JOB_TYPE_COLORS: Record<string, string> = {
  COUNTERTOP: "bg-blue-100 text-blue-800",
  REPAIR: "bg-orange-100 text-orange-800",
  CABINET_INSTALL: "bg-teal-100 text-teal-800",
  COMMERCIAL: "bg-purple-100 text-purple-800",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  COUNTERTOP: "Countertop",
  REPAIR: "Repair",
  CABINET_INSTALL: "Cabinet Install",
  COMMERCIAL: "Commercial",
};

const PRIORITY_DOT: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-slate-400",
};

const PRIORITY_BORDER: Record<string, string> = {
  URGENT: "border-red-500",
  HIGH: "border-orange-500",
  MEDIUM: "border-blue-500",
  LOW: "border-slate-300",
};

const BOARD_COLUMNS = [
  { title: "Leads", statuses: ["NEW_LEAD", "CONSULTATION_PENDING"] },
  {
    title: "Measurement",
    statuses: [
      "MEASUREMENT_NEEDED",
      "MEASUREMENT_SCHEDULED",
      "MEASUREMENT_COMPLETE",
    ],
  },
  {
    title: "Estimate",
    statuses: ["ESTIMATE_DRAFT", "ESTIMATE_SENT", "AWAITING_APPROVAL"],
  },
  {
    title: "Payment",
    statuses: [
      "INVOICE_CREATED",
      "INVOICE_SENT",
      "DEPOSIT_PENDING",
      "DEPOSIT_PAID",
    ],
  },
  {
    title: "Production",
    statuses: [
      "MATERIAL_ORDERED",
      "WAITING_FOR_STONE",
      "READY_FOR_FABRICATION",
      "IN_FABRICATION",
      "FABRICATION_COMPLETE",
    ],
  },
  {
    title: "Install",
    statuses: [
      "INSTALL_SCHEDULING_PENDING",
      "INSTALL_SCHEDULED",
      "INSTALLED",
    ],
  },
  { title: "Closing", statuses: ["FINAL_PAYMENT_PENDING", "CLOSED"] },
];

function getCustomerName(customerId: string): string {
  const c = customers.find((cu) => cu.id === customerId);
  return c ? `${c.firstName} ${c.lastName}` : "Unknown";
}

function getUserName(userId: string | null): string | null {
  if (!userId) return null;
  const u = users.find((us) => us.id === userId);
  return u ? u.name : null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function ProjectsPage() {
  const [view, setView] = useState<"list" | "board">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const customerName = getCustomerName(p.customerId).toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.projectNumber.toLowerCase().includes(q) ||
          customerName.includes(q)
        );
      });
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter) {
      result = result.filter((p) => p.jobType === typeFilter);
    }

    // Priority filter
    if (priorityFilter) {
      result = result.filter((p) => p.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = (a as any)[sortField];
      let bVal: any = (b as any)[sortField];

      if (aVal instanceof Date && bVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = bVal.getTime();
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [search, statusFilter, typeFilter, priorityFilter, sortField, sortDir]);

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  return (
    <div className="p-6 space-y-4 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <span className="text-sm text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {filteredProjects.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-slate-200 rounded-full p-0.5">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                view === "board"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
          </div>

          <Link
            href="/projects/new"
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Job Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="COUNTERTOP">Countertop</option>
            <option value="REPAIR">Repair</option>
            <option value="CABINET_INSTALL">Cabinet Install</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("projectNumber")}
                  >
                    <div className="flex items-center gap-1">
                      Project #
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("customerId")}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("jobType")}
                  >
                    <div className="flex items-center gap-1">
                      Job Type
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center gap-1">
                      Priority
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("totalEstimate")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Estimate
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, idx) => (
                  <tr
                    key={project.id}
                    className={`border-b border-slate-100 hover:bg-blue-50 transition-colors ${
                      idx % 2 === 1 ? "bg-slate-50/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {project.projectNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                      {project.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {getCustomerName(project.customerId)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          JOB_TYPE_COLORS[project.jobType] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {JOB_TYPE_LABELS[project.jobType] || project.jobType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[project.status as ProjectStatus] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_LABELS[project.status as ProjectStatus] ||
                          project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            PRIORITY_DOT[project.priority] || "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm text-slate-600">
                          {project.priority.charAt(0) +
                            project.priority.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">
                      {project.totalEstimate
                        ? formatCurrency(project.totalEstimate)
                        : "--"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(project.createdAt)}
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No projects found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Board View */}
      {view === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((column) => {
            const columnProjects = filteredProjects.filter((p) =>
              column.statuses.includes(p.status)
            );
            return (
              <div
                key={column.title}
                className="bg-slate-100 rounded-lg p-3 min-w-[280px] flex-shrink-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {column.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    {columnProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-2">
                  {columnProjects.map((project) => {
                    const assignedName = getUserName(project.assignedToId);
                    return (
                      <div
                        key={project.id}
                        className={`bg-white rounded-lg shadow-sm p-3 border-l-4 ${
                          PRIORITY_BORDER[project.priority] ||
                          "border-slate-300"
                        }`}
                      >
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {getCustomerName(project.customerId)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              JOB_TYPE_COLORS[project.jobType] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {JOB_TYPE_LABELS[project.jobType] ||
                              project.jobType}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {project.totalEstimate
                              ? formatCurrency(project.totalEstimate)
                              : "--"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                          {STATUS_LABELS[project.status as ProjectStatus] ||
                            project.status}
                        </p>
                        {assignedName && (
                          <div className="flex justify-end mt-2">
                            <div
                              className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium"
                              title={assignedName}
                            >
                              {getInitials(assignedName)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {columnProjects.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No projects
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
