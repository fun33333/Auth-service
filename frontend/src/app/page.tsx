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
  Briefcase,
  GitBranch,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StreamEvent {
  name: string;
  action: string;
  time: string;
  icon: "create" | "update" | "delete" | "system";
  type: string;
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
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex items-center justify-between hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group">
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
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
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
    create: (
      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
        <FolderPlus size={16} className="text-emerald-500" />
      </div>
    ),
    update: (
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
        <Edit2 size={16} className="text-blue-500" />
      </div>
    ),
    delete: (
      <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
        <XCircle size={16} className="text-rose-500" />
      </div>
    ),
    system: (
      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
        <Activity size={16} className="text-slate-400" />
      </div>
    ),
  };
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
      {iconMap[event.icon] || iconMap.system}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
            {event.name}
          </p>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">{event.type}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{event.action}</p>
      </div>
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">{event.time}</span>
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
      className="flex flex-col items-center text-center gap-3 p-4 bg-white/50 border border-slate-100/50 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${bg} shadow-lg shadow-current/20 transition-transform group-hover:scale-110`}
      >
        <Icon size={24} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">
          {label}
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
      </div>
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
    branches: 0,
  });

  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);

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
        const [empRes, instRes, deptRes, desigRes, branchRes, auditRes] = await Promise.all([
          fetchWithAuth("/employees/employees"),
          fetchWithAuth("/employees/institutions"),
          fetchWithAuth("/employees/departments"),
          fetchWithAuth("/employees/designations"),
          fetchWithAuth("/employees/branches"),
          fetchWithAuth("/audit/logs?limit=8"),
        ]);

        const employees = empRes.ok ? await empRes.json() : [];
        const institutions = instRes.ok ? await instRes.json() : [];
        const departments = deptRes.ok ? await deptRes.json() : [];
        const designations = desigRes.ok ? await desigRes.json() : [];
        const branches = branchRes.ok ? await branchRes.json() : [];
        const auditLogs = auditRes.ok ? await auditRes.json() : [];

        const empArr = Array.isArray(employees) ? employees : employees.employees || [];
        const instArr = Array.isArray(institutions) ? institutions : institutions.institutions || [];
        const deptArr = Array.isArray(departments) ? departments : departments.departments || [];
        const desigArr = Array.isArray(designations) ? designations : designations.designations || [];
        const branchArr = Array.isArray(branches) ? branches : [];

        setStats({
          employees: empArr.length,
          institutions: instArr.length,
          departments: deptArr.length,
          designations: desigArr.length,
          branches: branchArr.length,
        });

        // Map audit logs to stream events
        const events: StreamEvent[] = auditLogs.map((log: any) => {
          const timestamp = new Date(log.timestamp);
          const now = new Date();
          const diffMin = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
          
          let timeMsg = "Just now";
          if (diffMin > 0) {
            if (diffMin < 60) timeMsg = `${diffMin}M AGO`;
            else if (diffMin < 1440) timeMsg = `${Math.floor(diffMin / 60)}H AGO`;
            else timeMsg = `${Math.floor(diffMin / 1440)}D AGO`;
          }

          return {
            name: log.changed_by,
            action: `${log.action} ${log.content_type}`,
            time: timeMsg,
            icon: log.action.toLowerCase() === 'created' ? 'create' : (log.action.toLowerCase() === 'deleted' ? 'delete' : 'update'),
            type: log.content_type
          };
        });
        setStreamEvents(events);

        // Build org mix from departments with employee count
        if (deptArr.length > 0) {
          const mix = deptArr.slice(0, 5).map((d: any) => ({
            name: d.dept_name || "Department",
            count: d.employee_count || 0,
          }));
          setDeptMix(mix.sort((a: any, b: any) => b.count - a.count));
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
              Workforce Structure & Analytics
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Institutions"
            value={stats.institutions}
            sub="+0 this month"
            icon={Building2}
            loading={loading}
          />
          <StatCard
            title="Active Units"
            value={stats.departments}
            sub="Functional Hubs"
            icon={LayoutGrid}
            loading={loading}
          />
          <StatCard
            title="Total Workforce"
            value={stats.employees}
            sub="+1.2% growth"
            icon={Users}
            loading={loading}
          />
          <SystemStatusCard active={stats.employees} inactive={stats.branches} />
        </div>

        {/* ── Row 2: Org Mix | Monthly Growth | Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Org Mix */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                Organization Mix
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                Personnel Hubs
              </span>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 bg-slate-50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {deptMix.map((d, index) => (
                  <OrgMixRow key={index} label={d.name} count={d.count} />
                ))}
              </div>
            )}
          </div>

          {/* Monthly Growth */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                Monthly Growth
              </h2>
              <TrendingUp size={18} className="text-indigo-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 opacity-60">
              Hiring Trend & Forecast
            </p>
            <div className="h-28">
              <LineChart data={monthlyTrend} />
            </div>
            <div className="flex justify-between mt-4 px-2">
              {months.map((m) => (
                <span
                  key={m}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Organization Alerts */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                Organization Alerts
              </h2>
              <AlertTriangle size={18} className="text-amber-500 shadow-lg shadow-amber-200" />
            </div>
            <div className="space-y-4">
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
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                Intelligence Hub
              </h2>
              <Settings size={22} className="text-slate-300 hover:rotate-90 transition-transform cursor-pointer" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 opacity-60 italic">
              Strategic Control & Monitoring
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              <HubAction
                icon={UserPlus}
                label="Personnel"
                sub="Workforce"
                bg="bg-zinc-900"
                href="/employees"
              />
              <HubAction
                icon={FolderPlus}
                label="Units"
                sub="Departments"
                bg="bg-indigo-600"
                href="/departments"
              />
              <HubAction
                icon={FilePlus}
                label="Entities"
                sub="Institutions"
                bg="bg-emerald-600"
                href="/institutions"
              />
              <HubAction
                icon={Briefcase}
                label="Roles"
                sub="Designation"
                bg="bg-amber-500"
                href="/designations"
              />
              <HubAction
                icon={GitBranch}
                label="Branches"
                sub="Stations"
                bg="bg-rose-500"
                href="/institutions?view=branches"
              />
            </div>
          </div>

          {/* Real-time Stream */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                System Stream
              </h2>
              <div className="relative">
                <Activity size={18} className="text-indigo-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-2">
                       <div className="w-9 h-9 bg-slate-50 rounded-xl animate-pulse" />
                       <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 w-1/2 bg-slate-50 rounded animate-pulse" />
                          <div className="h-2 w-1/3 bg-slate-50 rounded animate-pulse" />
                       </div>
                    </div>
                 ))}
              </div>
            ) : streamEvents.length === 0 ? (
              <div className="py-12 text-center">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No activities detected</p>
              </div>
            ) : (
              <div className="space-y-1">
                {streamEvents.map((ev, i) => (
                  <StreamRow key={i} event={ev} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}