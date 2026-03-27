"use client";

import { use, useState } from "react";
import { contractors, projects, customers, payments } from "@/lib/seed-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, type ProjectStatus } from "@/lib/types";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ContractorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const contractor = contractors.find((c) => c.id === id);

  if (!contractor) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/contractors"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contractors
          </Link>
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-900">Contractor Not Found</h2>
            <p className="mt-1 text-sm text-slate-500">
              The contractor you are looking for does not exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const contractorProjects = projects.filter((p) => p.contractorId === contractor.id);
  const activeStatuses = [
    "NEW_LEAD", "CONSULTATION_PENDING", "MEASUREMENT_NEEDED", "MEASUREMENT_SCHEDULED",
    "MEASUREMENT_COMPLETE", "ESTIMATE_DRAFT", "ESTIMATE_SENT", "AWAITING_APPROVAL",
    "INVOICE_CREATED", "INVOICE_SENT", "DEPOSIT_PENDING", "DEPOSIT_PAID",
    "MATERIAL_ORDERED", "WAITING_FOR_STONE", "READY_FOR_FABRICATION",
    "IN_FABRICATION", "FABRICATION_COMPLETE", "INSTALL_SCHEDULING_PENDING",
    "INSTALL_SCHEDULED", "FINAL_PAYMENT_PENDING",
  ];
  const activeProjects = contractorProjects.filter((p) => activeStatuses.includes(p.status)).length;
  const totalRevenue = contractorProjects.reduce((sum, p) => sum + (p.totalEstimate ?? 0), 0);
  const avgProjectValue = contractorProjects.length > 0
    ? totalRevenue / contractorProjects.length
    : 0;

  const contractorProjectIds = contractorProjects.map((p) => p.id);
  const contractorPayments = payments.filter((pay) => contractorProjectIds.includes(pay.projectId));
  const totalPaid = contractorPayments
    .filter((pay) => pay.status === "PAID")
    .reduce((sum, pay) => sum + pay.amount, 0);

  function getCustomerName(customerId: string) {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return "Unknown";
    return `${customer.firstName} ${customer.lastName}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <Link
          href="/contractors"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contractors
        </Link>

        {/* Contractor Header */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{contractor.companyName}</h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    contractor.active
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {contractor.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{contractor.contactName}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {contractor.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {contractor.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {contractor.city}, {contractor.state}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {contractor.specialty}
              </span>
              <StarRating rating={contractor.rating} />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-500">Total Projects</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{contractorProjects.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-slate-500">Active Projects</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeProjects}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm text-slate-500">Total Revenue</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-slate-500">Avg Project Value</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(avgProjectValue)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-slate-500">Total Paid</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(totalPaid)}</p>
          </div>
        </div>

        {/* Projects Table */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Project #</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Estimate</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {contractorProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No projects found for this contractor.
                    </td>
                  </tr>
                ) : (
                  contractorProjects.map((project) => {
                    const statusColor =
                      STATUS_COLORS[project.status as ProjectStatus] ?? "bg-gray-100 text-gray-800";
                    const statusLabel =
                      STATUS_LABELS[project.status as ProjectStatus] ?? project.status;

                    return (
                      <tr
                        key={project.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-sm text-slate-600">
                          {project.projectNumber}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{project.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {getCustomerName(project.customerId)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {project.jobType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatCurrency(project.totalEstimate)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(project.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Payment Summary</h2>
          </div>
          {contractorPayments.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-400">
              No payments recorded for this contractor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Project</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-center font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contractorPayments.map((payment) => {
                    const project = projects.find((p) => p.id === payment.projectId);
                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-sm text-slate-600">
                          {payment.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-900">
                          {project?.name ?? "Unknown"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {payment.paymentType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              payment.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : payment.status === "OVERDUE"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {payment.paidDate ? formatDate(payment.paidDate) : <span className="text-slate-300">&mdash;</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
