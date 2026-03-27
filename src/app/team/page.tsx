"use client";

import { useState } from "react";
import { users } from "@/lib/seed-data";
import { scheduleEvents, projects } from "@/lib/seed-data";
import {
  UserCog,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Shield,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  STAFF: "Staff",
  FABRICATOR: "Fabricator",
  INSTALLER: "Installer",
  MEASUREMENT_TECH: "Measurement Tech",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  MANAGER: "bg-blue-100 text-blue-800",
  STAFF: "bg-slate-100 text-slate-800",
  FABRICATOR: "bg-purple-100 text-purple-800",
  INSTALLER: "bg-green-100 text-green-800",
  MEASUREMENT_TECH: "bg-amber-100 text-amber-800",
};

export default function TeamPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const getUserStats = (userId: string) => {
    const assignedProjects = projects.filter((p) => p.assignedToId === userId);
    const upcomingEvents = scheduleEvents.filter((e) => e.assignedToId === userId);
    return {
      activeProjects: assignedProjects.filter((p) => p.status !== "CLOSED").length,
      totalProjects: assignedProjects.length,
      upcomingEvents: upcomingEvents.length,
    };
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCog className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Team</h1>
            <p className="text-sm text-slate-500">{users.length} team members</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user.id);
          return (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{user.name}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        ROLE_COLORS[user.role] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.active
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {user.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {user.phone}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    <span className="text-lg font-semibold text-slate-800">
                      {stats.activeProjects}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span className="text-lg font-semibold text-slate-800">
                      {stats.totalProjects}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-lg font-semibold text-slate-800">
                      {stats.upcomingEvents}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Events</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Team Roles</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <span
              key={key}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                ROLE_COLORS[key]
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
