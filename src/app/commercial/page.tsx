"use client";

import { projects, customers, contractors, projectMilestones, payments } from "@/lib/seed-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, type ProjectStatus } from "@/lib/types";
import Link from "next/link";
import {
  Building2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  FileText,
} from "lucide-react";
import { useState } from "react";

export default function CommercialPage() {
  const commercialProjects = projects.filter((p) => p.jobType === "COMMERCIAL");

  function getCustomer(customerId: string) {
    return customers.find((c) => c.id === customerId);
  }

  function getContractor(contractorId: string | null) {
    if (!contractorId) return null;
    return contractors.find((c) => c.id === contractorId);
  }

  function getMilestones(projectId: string) {
    return projectMilestones
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function getProjectPayments(projectId: string) {
    return payments.filter((p) => p.projectId === projectId);
  }

  function getMilestoneProgress(projectId: string) {
    const milestones = getMilestones(projectId);
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.status === "completed").length;
    return Math.round((completed / milestones.length) * 100);
  }

  function getDepositPaid(projectId: string) {
    return getProjectPayments(projectId)
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Commercial Projects</h1>
            <p className="text-sm text-slate-500">Large-scale commercial marble and granite jobs</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          New Commercial Project
        </button>
      </div>

      {/* Project Cards */}
      {commercialProjects.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700">No commercial projects</h3>
          <p className="mt-1 text-sm text-slate-500">
            Create a new commercial project to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {commercialProjects.map((project) => {
            const customer = getCustomer(project.customerId);
            const contractor = getContractor(project.contractorId);
            const milestones = getMilestones(project.id);
            const progress = getMilestoneProgress(project.id);
            const depositPaid = getDepositPaid(project.id);
            const balanceDue = (project.totalEstimate ?? 0) - depositPaid;

            return (
              <div
                key={project.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                {/* Card Header */}
                <div className="border-b border-slate-100 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-xl font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {project.name}
                        </Link>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status as ProjectStatus] ?? "bg-gray-100 text-gray-800"}`}
                        >
                          {STATUS_LABELS[project.status as ProjectStatus] ?? project.status}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            project.priority === "URGENT"
                              ? "bg-red-100 text-red-700"
                              : project.priority === "HIGH"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {project.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {project.projectNumber}
                        </Link>
                        {customer && (
                          <span className="ml-3">
                            Client: {customer.firstName} {customer.lastName}
                          </span>
                        )}
                        {contractor && (
                          <span className="ml-3">
                            via {contractor.companyName}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Contract Value</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {formatCurrency(project.totalEstimate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
                  {/* Progress Section */}
                  <div className="border-b border-slate-100 p-6 lg:col-span-2 lg:border-b-0 lg:border-r">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Progress
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-600">Milestones</span>
                        <span className="font-medium text-slate-900">{progress}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestone List */}
                    <div className="space-y-2">
                      {milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          {milestone.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                          ) : milestone.status === "in_progress" ? (
                            <Clock className="h-5 w-5 flex-shrink-0 text-amber-500" />
                          ) : (
                            <Circle className="h-5 w-5 flex-shrink-0 text-slate-300" />
                          )}
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                milestone.status === "completed"
                                  ? "text-slate-500 line-through"
                                  : "text-slate-800"
                              }`}
                            >
                              {milestone.name}
                            </p>
                            <p className="text-xs text-slate-400">{milestone.phase}</p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {milestone.completedAt
                              ? formatDate(milestone.completedAt)
                              : milestone.dueDate
                                ? `Due ${formatDate(milestone.dueDate)}`
                                : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Financial Summary
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500">Total Contract</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(project.totalEstimate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Deposit Paid</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(depositPaid)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Balance Due</p>
                        <p className="text-xl font-bold text-amber-600">
                          {formatCurrency(balanceDue)}
                        </p>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                      <Link
                        href="#"
                        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Schedule
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Files
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        Payments
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
