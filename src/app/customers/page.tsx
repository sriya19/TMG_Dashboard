"use client";

import { customers, contractors, projects } from "@/lib/seed-data";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Users, Phone, Mail, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DIRECT" | "CONTRACTOR_REFERRED">("ALL");

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      fullName.includes(query) ||
      customer.phone.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query);

    const matchesType = typeFilter === "ALL" || customer.customerType === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalCustomers = customers.length;
  const directCustomers = customers.filter((c) => c.customerType === "DIRECT").length;
  const referredCustomers = customers.filter((c) => c.customerType === "CONTRACTOR_REFERRED").length;

  function getContractorName(contractorId: string | null) {
    if (!contractorId) return null;
    const contractor = contractors.find((c) => c.id === contractorId);
    return contractor?.companyName ?? null;
  }

  function getCustomerProjectCount(customerId: string) {
    return projects.filter((p) => p.customerId === customerId).length;
  }

  function getCustomerTotalValue(customerId: string) {
    return projects
      .filter((p) => p.customerId === customerId)
      .reduce((sum, p) => sum + (p.totalEstimate ?? 0), 0);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "ALL" | "DIRECT" | "CONTRACTOR_REFERRED")}
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All</option>
              <option value="DIRECT">Direct</option>
              <option value="CONTRACTOR_REFERRED">Contractor-Referred</option>
            </select>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Customers</p>
              <p className="text-2xl font-bold text-slate-900">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Direct Customers</p>
              <p className="text-2xl font-bold text-slate-900">{directCustomers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Contractor Referred</p>
              <p className="text-2xl font-bold text-slate-900">{referredCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Contractor</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Projects</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const contractorName = getContractorName(customer.contractorId);
                const projectCount = getCustomerProjectCount(customer.id);
                const totalValue = getCustomerTotalValue(customer.id);

                return (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href="#" className="font-medium text-slate-900 hover:text-blue-600">
                        {customer.firstName} {customer.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          customer.customerType === "DIRECT"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {customer.customerType === "DIRECT" ? "Direct" : "Contractor"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {contractorName ?? <span className="text-slate-300">&mdash;</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{projectCount}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(totalValue)}
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
