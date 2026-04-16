"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  LayoutDashboard,
  LogOut,
  Building2,
  Menu,
  X,
  Bell,
  Search,
  LayoutGrid,
  Briefcase,
  ChevronDown,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  const navLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Institutions", icon: Building2, href: "/institutions" },
    { name: "Branches", icon: GitBranch, href: "/branches" },
    { name: "Departments", icon: LayoutGrid, href: "/departments" },
    { name: "Designations", icon: Briefcase, href: "/designations" },
    { name: "Employees", icon: Users, href: "/employees" },
  ];

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none blur-[150px] opacity-30">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#BDA6CE]" />
        <div className="absolute top-[50%] -right-[15%] w-[50%] h-[50%] rounded-full bg-[#BDA6CE]" />
      </div>

      <div className="flex h-screen w-full relative z-10">
        {/* Sidebar Backdrop (mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 bg-white/90 backdrop-blur-md border-r border-slate-100 shadow-sm flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <span className="font-black text-slate-800 text-sm tracking-wide">
                EMS Portal
              </span>
            </Link>
            <button
              className="lg:hidden text-slate-400 hover:text-slate-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* User Card */}
          <div className="px-4 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-full text-sm font-black shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-black text-xs text-slate-800 truncate">
                  {user?.full_name || "User"}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 truncate">
                  {user?.designation || user?.department || "Admin"}
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="px-3 pb-5 shrink-0 border-t border-slate-100 pt-3">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ─── Main Area ───────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-5 shrink-0 shadow-sm">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-64">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Bell */}
              <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell size={18} className="text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl pl-1 pr-3 py-1 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => setProfileOpen(!isProfileOpen)}
                >
                  <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center rounded-lg text-xs font-black">
                    {initials}
                  </div>
                  <span className="text-xs font-bold text-slate-700 hidden sm:block max-w-[120px] truncate">
                    {user?.full_name}
                  </span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-800 truncate">
                          {user?.full_name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}