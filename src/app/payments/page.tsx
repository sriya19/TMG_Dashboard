"use client";

import { payments, projects, customers } from "@/lib/seed-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  DollarSign,
  CreditCard,
  Clock,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  function getProject(projectId: string) {
    return projects.find((p) => p.id === projectId);
  }

  function getCustomerName(projectId: string) {
    const project = getProject(projectId);
    if (!project) return "Unknown";
    const customer = customers.find((c) => c.id === project.customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  }

  function getProjectName(projectId: string) {
    const project = getProject(projectId);
    return project?.name ?? "Unknown";
  }

  function getProjectId(projectId: string) {
    return projectId;
  }

  function getDaysOverdue(dueDate: Date | null) {
    if (!dueDate) return 0;
    const now = new Date();
    const diff = now.getTime() - new Date(dueDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  // Stats
  const totalOutstanding = payments
    .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount, 0);

  const depositsPending = payments
    .filter((p) => p.paymentType === "DEPOSIT" && p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const revenueCollected = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = payments
    .filter((p) => p.status === "OVERDUE")
    .reduce((sum, p) => sum + p.amount, 0);

  // Filtered payments
  const filteredPayments = payments.filter((payment) => {
    const projectName = getProjectName(payment.projectId).toLowerCase();
    const customerName = getCustomerName(payment.projectId).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      projectName.includes(query) ||
      customerName.includes(query) ||
      (payment.invoiceNumber ?? "").toLowerCase().includes(query);
    const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;
    const matchesType = typeFilter === "ALL" || payment.paymentType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Overdue & Recent
  const overduePayments = payments.filter((p) => p.status === "OVERDUE");
  const recentPaidPayments = payments
    .filter((p) => p.status === "PAID" && p.paidDate)
    .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
    .slice(0, 5);

  const statusBadgeColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    PARTIAL: "bg-amber-100 text-amber-800",
    REFUNDED: "bg-gray-100 text-gray-800",
  };

  const typeBadgeColors: Record<string, string> = {
    DEPOSIT: "bg-blue-100 text-blue-700",
    FINAL: "bg-indigo-100 text-indigo-700",
    PROGRESS: "bg-teal-100 text-teal-700",
    REFUND: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments & Finance</h1>
            <p className="text-sm text-slate-500">Track invoices, deposits, and revenue</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Outstanding</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Deposits Pending</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(depositsPending)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Revenue Collected</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(revenueCollected)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Overdue Amount</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(overdueAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <option value="ALL">All Types</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="FINAL">Final</option>
          <option value="PROGRESS">Progress</option>
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 font-medium text-slate-600">Invoice #</th>
                <th className="px-4 py-3 font-medium text-slate-600">Project</th>
                <th className="px-4 py-3 font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Method</th>
                <th className="px-4 py-3 font-medium text-slate-600">Due Date</th>
                <th className="px-4 py-3 font-medium text-slate-600">Paid Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {payment.invoiceNumber ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${payment.projectId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {getProjectName(payment.projectId)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {getCustomerName(payment.projectId)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColors[payment.paymentType] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {payment.paymentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeColors[payment.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {payment.paymentMethod ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(payment.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(payment.paidDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Overdue Payments */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-900">Overdue Payments</h2>
            </div>
          </div>
          <div className="p-4">
            {overduePayments.length === 0 ? (
              <p className="text-sm text-slate-500">No overdue payments</p>
            ) : (
              <div className="space-y-3">
                {overduePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {getProjectName(payment.projectId)}
                      </p>
                      <p className="text-xs text-red-600">
                        {getDaysOverdue(payment.dueDate)} days overdue
                      </p>
                    </div>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-slate-900">Recent Payments</h2>
            </div>
          </div>
          <div className="p-4">
            {recentPaidPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No recent payments</p>
            ) : (
              <div className="space-y-3">
                {recentPaidPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {getProjectName(payment.projectId)}
                      </p>
                      <p className="text-xs text-green-600">
                        Paid {formatDate(payment.paidDate)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
