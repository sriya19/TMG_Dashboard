"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  HardHat,
  ClipboardList,
  Calendar,
  Wrench,
  Building2,
  CreditCard,
  BarChart3,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Gem,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Contractors", icon: HardHat, href: "/contractors" },
  { label: "Consultation", icon: ClipboardList, href: "/consultation" },
  { label: "Calendar", icon: Calendar, href: "/calendar" },
  { label: "Repairs", icon: Wrench, href: "/repairs" },
  { label: "Commercial", icon: Building2, href: "/commercial" },
  { label: "Payments", icon: CreditCard, href: "/payments" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Team", icon: UserCog, href: "/team" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 z-40 h-screen flex flex-col bg-slate-900 text-white transition-all duration-300",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700/50 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-600 shrink-0">
          <Gem className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold leading-tight whitespace-nowrap">
              Top Marble &amp; Granite
            </h1>
            <p className="text-[11px] text-slate-400 leading-tight">TMG Dashboard</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-700/80 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-slate-700/50 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
