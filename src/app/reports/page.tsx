"use client";

import { projects, customers, contractors, payments, monthlyRevenue } from "@/lib/seed-data";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, type ProjectStatus } from "@/lib/types";
import { BarChart3, TrendingUp, DollarSign, Users, Clock, Target } from "lucide-react";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Overview stats
  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalProjects = projects.length;
  const avgProjectValue =
    totalProjects > 0
      ? projects.reduce((sum, p) => sum + (p.totalEstimate ?? 0), 0) / totalProjects
      : 0;
  const activeProjects = projects.filter(
    (p) => p.status !== "CLOSED" && p.status !== "NEW_LEAD"
  ).length;
  const repairJobs = projects.filter((p) => p.jobType === "REPAIR").length;

  // Projects by Job Type
  const jobTypeCounts: Record<string, number> = {};
  projects.forEach((p) => {
    jobTypeCounts[p.jobType] = (jobTypeCounts[p.jobType] ?? 0) + 1;
  });
  const jobTypeData = Object.entries(jobTypeCounts).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }));

  // Projects by Status (top 8)
  const statusCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const label = STATUS_LABELS[p.status as ProjectStatus] ?? p.status;
    statusCounts[label] = (statusCounts[label] ?? 0) + 1;
  });
  const statusData = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Top Contractors
  const contractorStats = contractors.map((contractor) => {
    const contractorProjects = projects.filter(
      (p) => p.contractorId === contractor.id
    );
    const projectCount = contractorProjects.length;
    const totalRev = contractorProjects.reduce(
      (sum, p) => sum + (p.totalEstimate ?? 0),
      0
    );
    const avgVal = projectCount > 0 ? totalRev / projectCount : 0;
    return {
      id: contractor.id,
      companyName: contractor.companyName,
      projectCount,
      totalRevenue: totalRev,
      avgProjectValue: avgVal,
      rating: contractor.rating,
    };
  });
  contractorStats.sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Project Metrics
  const mostCommonJobType = Object.entries(jobTypeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] ?? "N/A";
  const highestValueProject = projects.reduce(
    (best, p) =>
      (p.totalEstimate ?? 0) > (best.totalEstimate ?? 0) ? p : best,
    projects[0]
  );
  const directProjects = projects.filter((p) => !p.contractorId).length;
  const contractorProjects = projects.filter((p) => p.contractorId).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
          <BarChart3 className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Business insights and performance metrics</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Projects</p>
              <p className="text-xl font-bold text-slate-900">{totalProjects}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Project Value</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(avgProjectValue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Projects</p>
              <p className="text-xl font-bold text-slate-900">{activeProjects}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Repair Jobs</p>
              <p className="text-xl font-bold text-slate-900">{repairJobs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1 - Revenue Chart */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Revenue</h2>
        {isMounted ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" name="Costs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-slate-400">
            Loading chart...
          </div>
        )}
      </div>

      {/* Section 2 - Two Charts Side by Side */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Projects by Job Type */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Projects by Job Type</h2>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                >
                  {jobTypeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-slate-400">
              Loading chart...
            </div>
          )}
        </div>

        {/* Projects by Status */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Projects by Status</h2>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={140}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="count" name="Projects" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-slate-400">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* Section 3 - Top Contractors */}
      <div className="mb-8 rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Top Contractors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 font-medium text-slate-600">Company Name</th>
                <th className="px-6 py-3 font-medium text-slate-600">Projects</th>
                <th className="px-6 py-3 font-medium text-slate-600 text-right">Total Revenue</th>
                <th className="px-6 py-3 font-medium text-slate-600 text-right">Avg Project Value</th>
                <th className="px-6 py-3 font-medium text-slate-600">Rating</th>
              </tr>
            </thead>
            <tbody>
              {contractorStats.map((contractor) => (
                <tr
                  key={contractor.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {contractor.companyName}
                  </td>
                  <td className="px-6 py-3 text-slate-700">{contractor.projectCount}</td>
                  <td className="px-6 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(contractor.totalRevenue)}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-700">
                    {formatCurrency(contractor.avgProjectValue)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < (contractor.rating ?? 0)
                              ? "text-amber-400"
                              : "text-slate-200"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4 - Project Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Avg Time to Close</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">18 days</p>
          <p className="mt-1 text-xs text-slate-400">From creation to close</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Most Common Job Type</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {mostCommonJobType.replace("_", " ")}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {jobTypeCounts[mostCommonJobType] ?? 0} projects
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Highest Value Project</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(highestValueProject?.totalEstimate)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {highestValueProject?.name ?? "N/A"}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Direct vs Contractor</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {directProjects} / {contractorProjects}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {totalProjects > 0
              ? `${Math.round((directProjects / totalProjects) * 100)}% direct`
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
