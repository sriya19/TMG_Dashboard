"use client";

import { contractors, projects, payments, customers } from "@/lib/seed-data";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Star, Building2, Phone, Mail, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function getContractorStats(contractorId: string) {
  const contractorProjects = projects.filter((p) => p.contractorId === contractorId);
  const activeStatuses = [
    "NEW_LEAD", "CONSULTATION_PENDING", "MEASUREMENT_NEEDED", "MEASUREMENT_SCHEDULED",
    "MEASUREMENT_COMPLETE", "ESTIMATE_DRAFT", "ESTIMATE_SENT", "AWAITING_APPROVAL",
    "INVOICE_CREATED", "INVOICE_SENT", "DEPOSIT_PENDING", "DEPOSIT_PAID",
    "MATERIAL_ORDERED", "WAITING_FOR_STONE", "READY_FOR_FABRICATION",
    "IN_FABRICATION", "FABRICATION_COMPLETE", "INSTALL_SCHEDULING_PENDING",
    "INSTALL_SCHEDULED", "FINAL_PAYMENT_PENDING",
  ];
  const activeProjects = contractorProjects.filter((p) => activeStatuses.includes(p.status)).length;
  const completedProjects = contractorProjects.filter((p) => p.status === "CLOSED" || p.status === "INSTALLED").length;
  const totalRevenue = contractorProjects.reduce((sum, p) => sum + (p.totalEstimate ?? 0), 0);

  return { activeProjects, completedProjects, totalRevenue, totalProjects: contractorProjects.length };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ContractorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContractors = contractors.filter((contractor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contractor.companyName.toLowerCase().includes(query) ||
      contractor.contactName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Contractors</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
            />
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Contractor
          </button>
        </div>
      </div>

      {/* Contractor Cards Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContractors.map((contractor) => {
          const stats = getContractorStats(contractor.id);

          return (
            <div
              key={contractor.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <Link
                    href={`/contractors/${contractor.id}`}
                    className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {contractor.companyName}
                  </Link>
                  <p className="text-sm text-slate-500">{contractor.contactName}</p>
                </div>
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

              <div className="mb-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {contractor.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {contractor.email}
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {contractor.specialty}
                </span>
                <StarRating rating={contractor.rating} />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{stats.activeProjects}</p>
                    <p className="text-xs text-slate-500">Active</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{stats.completedProjects}</p>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredContractors.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            No contractors found matching your search.
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">All Contractors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Company</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Contact</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Specialty</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Active Projects</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Total Revenue</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Rating</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContractors.map((contractor) => {
                const stats = getContractorStats(contractor.id);

                return (
                  <tr
                    key={contractor.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/contractors/${contractor.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600"
                      >
                        {contractor.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{contractor.contactName}</td>
                    <td className="px-4 py-3 text-slate-600">{contractor.phone}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {contractor.specialty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {stats.activeProjects}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(stats.totalRevenue)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <StarRating rating={contractor.rating} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          contractor.active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {contractor.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
