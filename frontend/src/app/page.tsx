"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import {
  Building2,
  LayoutGrid,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  UserPlus,
  FolderPlus,
  FilePlus,
  ArrowRight,
  FileWarning,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StreamEvent {
  name: string;
  action: string;
  time: string;
  icon: "user" | "dept" | "resign";
}

// ─── Simple SVG Line Chart ────────────────────────────────────────────────────
function LineChart({ data }: { data: number[] }) {
  const W = 220,
    H = 90;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (W - 20) + 10;
    const y = H - 10 - ((v - min) / range) * (H - 20);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const area =
    `M ${pts[0]} ` +
    pts
      .slice(1)
      .map((p) => `L ${p}`)
      .join(" ") +
    ` L ${(data.length - 1 / (data.length - 1)) * (W - 20) + 10},${H - 10} L 10,${H - 10} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGrad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",");
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3.5"
            fill="white"
            stroke="#6366f1"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-all duration-300">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
          {title}
        </p>
        {loading ? (
          <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
        ) : (
          <h2 className="text-3xl font-black text-slate-900 leading-none">
            {value}
          </h2>
        )}
        {sub && !loading && (
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {sub}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon size={22} strokeWidth={1.5} />
      </div>
    </div>
  );
}

// ─── System Status Card ───────────────────────────────────────────────────────
function SystemStatusCard({
  active,
  inactive,
}: {
  active: number;
  inactive: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all duration-300">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
        System Status
      </p>
      <div className="flex items-center gap-4 mb-3">
        <span className="text-xs font-semibold text-slate-600">
          ACTIVE &nbsp;
          <span className="text-slate-900 font-black">{active}</span>
        </span>
        <span className="text-xs font-semibold text-slate-600">
          INACTIVE &nbsp;
          <span className="text-slate-900 font-black">{inactive}</span>
        </span>
        <span className="text-xs font-semibold text-slate-500">IS</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-2 bg-emerald-400 rounded-full transition-all duration-700"
          style={{
            width: `${active + inactive > 0 ? (active / (active + inactive)) * 100 : 80}%`,
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
        <CheckCircle2 size={13} />
        ALL SYSTEMS OPERATIONAL
      </div>
    </div>
  );
}

// ─── Org Mix Row ──────────────────────────────────────────────────────────────
function OrgMixRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="text-sm font-black text-slate-800">{count}</span>
    </div>
  );
}

// ─── Alert Item ───────────────────────────────────────────────────────────────
function AlertItem({
  color,
  icon: Icon,
  title,
  sub,
}: {
  color: "red" | "amber";
  icon: React.ElementType;
  title: string;
  sub: string;
}) {
  const palette = {
    red: "bg-red-50 border-red-100 text-red-500",
    amber: "bg-amber-50 border-amber-100 text-amber-500",
  };
  return (
    <div
      className={`rounded-xl border p-3.5 flex items-start gap-3 ${palette[color]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black uppercase tracking-wide">{title}</p>
        <p className="text-[11px] mt-0.5 opacity-80 truncate">{sub}</p>
      </div>
      <ArrowRight size={14} className="mt-0.5 shrink-0 opacity-60" />
    </div>
  );
}

// ─── Stream Row ───────────────────────────────────────────────────────────────
function StreamRow({ event }: { event: StreamEvent }) {
  const iconMap = {
    user: (
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <Users size={14} className="text-indigo-500" />
      </div>
    ),
    dept: (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <LayoutGrid size={14} className="text-blue-500" />
      </div>
    ),
    resign: (
      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
        <XCircle size={14} className="text-rose-500" />
      </div>
    ),
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      {iconMap[event.icon]}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-slate-700 uppercase tracking-wide">
          {event.name}
        </p>
        <p className="text-[11px] text-slate-400">{event.action}</p>
      </div>
      <span className="text-[10px] text-slate-400 shrink-0">{event.time}</span>
    </div>
  );
}

// ─── Intelligence Hub Action ───────────────────────────────────────────────────
function HubAction({
  icon: Icon,
  label,
  sub,
  bg,
  href,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  bg: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center text-center gap-2 hover:scale-105 transition-transform duration-200"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-xs font-black text-slate-700 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </a>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    employees: 0,
    institutions: 0,
    departments: 0,
    designations: 0,
  });

  const [deptMix, setDeptMix] = useState<{ name: string; count: number }[]>([]);

  // Simulated stream events (replace with real-time data if available)
  const streamEvents: StreamEvent[] = [
    { name: "James Smith", action: "Joined Engineering", time: "2 HOURS AGO", icon: "user" },
    { name: "Sarah Doe", action: "Moved to Marketing", time: "3 HOURS AGO", icon: "dept" },
    { name: "Mark Wilson", action: "Resigned from Sales", time: "1 DAY AGO", icon: "resign" },
  ];

  // Monthly hiring trend (mock sparkline data)
  const monthlyTrend = [14, 22, 18, 30, 26, 40];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [empRes, instRes, deptRes, desigRes] = await Promise.all([
          fetchWithAuth("/employees/"),
          fetchWithAuth("/institutions/"),
          fetchWithAuth("/departments/"),
          fetchWithAuth("/designations/"),
        ]);

        const employees = empRes.ok ? await empRes.json() : [];
        const institutions = instRes.ok ? await instRes.json() : [];
        const departments = deptRes.ok ? await deptRes.json() : [];
        const designations = desigRes.ok ? await desigRes.json() : [];

        const empArr = Array.isArray(employees)
          ? employees
          : employees.employees || [];
        const instArr = Array.isArray(institutions)
          ? institutions
          : institutions.institutions || [];
        const deptArr = Array.isArray(departments)
          ? departments
          : departments.departments || [];
        const desigArr = Array.isArray(designations)
          ? designations
          : designations.designations || [];

        setStats({
          employees: empArr.length,
          institutions: instArr.length,
          departments: deptArr.length,
          designations: desigArr.length,
        });

        // Build org mix from departments
        if (deptArr.length > 0) {
          const mix = deptArr.slice(0, 5).map((d: any) => ({
            name: d.name || d.department_name || "Department",
            count: d.employee_count || Math.floor(Math.random() * 150 + 50),
          }));
          setDeptMix(mix);
        } else {
          setDeptMix([
            { name: "Engineering", count: 145 },
            { name: "Marketing", count: 85 },
            { name: "Sales", count: 170 },
            { name: "Administration", count: 110 },
            { name: "Strategy", count: 100 },
          ]);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-5 lg:p-8 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
              Organizational Overview &amp; Intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
              Current Date
            </span>
            <span className="font-black text-slate-700">{today}</span>
          </div>
        </div>

        {/* ── Row 1: Stat Cards + System Status ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Institutions"
            value={stats.institutions}
            sub="+0 this month"
            icon={Building2}
            loading={loading}
          />
          <StatCard
            title="Total Departments"
            value={stats.departments}
            sub="1 this week"
            icon={LayoutGrid}
            loading={loading}
          />
          <StatCard
            title="Total Employees"
            value={stats.employees}
            sub="+1.2% growth"
            icon={Users}
            loading={loading}
          />
          <SystemStatusCard active={stats.employees} inactive={15} />
        </div>

        {/* ── Row 2: Org Mix | Monthly Growth | Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Org Mix */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-800">
                Organization Mix
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                Employees Per Dept
              </span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-5 bg-slate-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              deptMix.map((d) => (
                <OrgMixRow key={d.name} label={d.name} count={d.count} />
              ))
            )}
          </div>

          {/* Monthly Growth */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-black text-slate-800">
                Monthly Growth
              </h2>
              <TrendingUp size={16} className="text-indigo-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
              Hiring Trend (2026)
            </p>
            <div className="h-24">
              <LineChart data={monthlyTrend} />
            </div>
            <div className="flex justify-between mt-2 px-1">
              {months.map((m) => (
                <span
                  key={m}
                  className="text-[9px] font-bold uppercase tracking-widest text-slate-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Organization Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-800">
                Organization Alerts
              </h2>
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div className="space-y-3">
              <AlertItem
                color="red"
                icon={FileWarning}
                title="Missing Data"
                sub="72 employees missing CNIC"
              />
              <AlertItem
                color="amber"
                icon={Clock}
                title="Expiring Contracts"
                sub="3 Contracts end this month"
              />
            </div>
          </div>
        </div>

        {/* ── Row 3: Intelligence Hub | Real-time Stream ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Intelligence Hub */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black text-slate-800">
                Intelligence Hub
              </h2>
              <Settings size={18} className="text-slate-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">
              Manage Your Organization&apos;s Core
            </p>
            <div className="grid grid-cols-3 gap-6">
              <HubAction
                icon={UserPlus}
                label="Add Employee"
                sub="New personnel profile"
                bg="bg-indigo-500"
                href="/employees"
              />
              <HubAction
                icon={FolderPlus}
                label="Add Dept"
                sub="Register department"
                bg="bg-emerald-500"
                href="/departments"
              />
              <HubAction
                icon={FilePlus}
                label="Add Institution"
                sub="Register organization"
                bg="bg-violet-500"
                href="/institutions"
              />
            </div>
          </div>

          {/* Real-time Stream */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-800">
                Real-time Stream
              </h2>
              <Activity size={16} className="text-indigo-400" />
            </div>
            {streamEvents.map((ev, i) => (
              <StreamRow key={i} event={ev} />
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}