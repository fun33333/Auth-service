"use client";

import React, { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';
import { 
  Users, Building2, LayoutGrid, Calendar, TrendingUp, 
  Plus, AlertTriangle, ArrowRight, UserPlus, 
  UserMinus, Settings, Activity, FileText,
  Clock, Briefcase, Landmark
} from 'lucide-react';

// --- Types ---
interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalInstitutions: number;
  activeCount: number;
  inactiveCount: number;
  deptDistribution: { name: string; count: number }[];
  hiringTrend: { month: string; count: number }[];
  recentActivity: any[];
}

// --- Components ---

const MetricCard = ({ title, value, subtext, icon: Icon, color, bgColor }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
    <div className={`absolute top-6 right-6 p-3 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{value}</h3>
      <span className="text-[10px] font-bold text-emerald-500">{subtext}</span>
    </div>
  </div>
);

// Simple SVG Bar Chart Component
const SimpleBarChart = ({ data }: { data: { name: string; count: number }[] }) => {
  const max = Math.max(...data.map(d => d.count)) || 1;
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            <span>{d.name}</span>
            <span className="text-zinc-900">{d.count}</span>
          </div>
          <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple SVG Line Chart Component
const SimpleLineChart = ({ data }: { data: { month: string; count: number }[] }) => {
  const max = Math.max(...data.map(d => d.count)) || 1;
  const height = 100;
  const width = 300;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.count / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative h-32 w-full mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="animate-in slide-in-from-left duration-1000"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * width}
            cy={height - (d.count / max) * height}
            r="4"
            fill="white"
            stroke="#2563eb"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-zinc-400 uppercase">{d.month}</span>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats({
          totalEmployees: 560,
          totalDepartments: 12,
          totalInstitutions: 4,
          activeCount: 545,
          inactiveCount: 15,
          deptDistribution: [
            { name: "Engineering", count: 145 },
            { name: "Marketing", count: 85 },
            { name: "Sales", count: 120 },
            { name: "Administration", count: 110 },
            { name: "Strategy", count: 100 },
          ],
          hiringTrend: [
            { month: "Jan", count: 12 },
            { month: "Feb", count: 18 },
            { month: "Mar", count: 15 },
            { month: "Apr", count: 28 },
            { month: "May", count: 22 },
            { month: "Jun", count: 35 },
          ],
          recentActivity: [
            { id: 1, type: 'join', user: 'James Smith', detail: 'joined Engineering', time: '2 hours ago' },
            { id: 2, type: 'dept', user: 'Sarah Doe', detail: 'moved to Marketing', time: '5 hours ago' },
            { id: 3, type: 'resign', user: 'Mark Wilson', detail: 'resigned from Sales', time: '1 day ago' },
            { id: 4, type: 'join', user: 'Elena Gilbert', detail: 'joined Admin', time: '2 days ago' },
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 leading-none">Dashboard</h1>
            <p className="mt-2 text-sm font-bold text-zinc-400 uppercase tracking-widest italic">Organizational Overview & Intelligence</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3">
              <div className="h-8 w-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Current Date</p>
                <p className="text-xs font-bold text-zinc-900">31 March, 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Section - Key Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Institutions" 
            value={stats?.totalInstitutions || 0} 
            subtext="+0 this month"
            icon={Landmark} 
            color="text-indigo-600" 
            bgColor="bg-indigo-50" 
          />
          <MetricCard 
            title="Total Departments" 
            value={stats?.totalDepartments || 0} 
            subtext="+1 this week"
            icon={LayoutGrid} 
            color="text-blue-600" 
            bgColor="bg-blue-50" 
          />
          <MetricCard 
            title="Total Employees" 
            value={stats?.totalEmployees || 0} 
            subtext="+12% growth"
            icon={Users} 
            color="text-emerald-600" 
            bgColor="bg-emerald-50" 
          />
          <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">System Status</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase">
                    <span>Active</span>
                    <span>{stats?.activeCount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[95%]" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-rose-500 uppercase">
                    <span>Inactive</span>
                    <span>{stats?.inactiveCount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[5%]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>

        {/* Main Grid View */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Charts Column */}
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Dept Distribution */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight">Organization Mix</h3>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Employees per Dept</button>
                </div>
                {stats ? <SimpleBarChart data={stats.deptDistribution} /> : <div className="h-40 bg-zinc-50 rounded-2xl animate-pulse" />}
              </div>

              {/* Hiring Trend */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight">Monthly Growth</h3>
                  <TrendingUp className="text-blue-500" size={20} />
                </div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Hiring Trend (2026)</p>
                {stats ? <SimpleLineChart data={stats.hiringTrend} /> : <div className="h-40 bg-zinc-50 rounded-2xl animate-pulse" />}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-black tracking-tight">Intelligence Hub</h3>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">Manage your organization's core</p>
                  </div>
                  <Settings className="text-zinc-700" size={24} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link href="/employees/new" className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group/btn">
                    <div className="h-12 w-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all">
                      <UserPlus size={20} />
                    </div>
                    <div>
                      <p className="text-black text-sm font-black uppercase tracking-widest">Add Employee</p>
                      <p className="text-zinc-500 text-[10px] font-bold">New personnel profile</p>
                    </div>
                  </Link>
                  <Link href="/departments" className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group/btn">
                    <div className="h-12 w-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover/btn:bg-emerald-600 group-hover/btn:text-white transition-all">
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <p className="text-black text-sm font-black uppercase tracking-widest">Add Dept</p>
                      <p className="text-zinc-500 text-[10px] font-bold">Register department</p>
                    </div>
                  </Link>
                  <Link href="/institutions" className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group/btn">
                    <div className="h-12 w-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500 group-hover/btn:bg-indigo-600 group-hover/btn:text-white transition-all">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <p className="text-black text-sm font-black uppercase tracking-widest">Add Institution</p>
                      <p className="text-zinc-500 text-[10px] font-bold">Register organization</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Alerts Column */}
          <div className="space-y-8">
            {/* Alerts Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">Organization Alerts</h3>
                <AlertTriangle className="text-amber-500" size={20} />
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 group hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-rose-900 text-xs font-black uppercase tracking-widest">Missing Data</p>
                      <p className="text-rose-600/60 text-[10px] font-bold">12 Employees missing CNICs</p>
                    </div>
                    <ArrowRight size={16} className="text-rose-300" />
                  </div>
                </div>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 group hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-amber-900 text-xs font-black uppercase tracking-widest">Expiring Contracts</p>
                      <p className="text-amber-600/60 text-[10px] font-bold">5 Contracts end this month</p>
                    </div>
                    <ArrowRight size={16} className="text-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stream */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col h-full max-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">Real-time Stream</h3>
                <Activity className="text-blue-500" size={20} />
              </div>
              <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {stats?.recentActivity.map((act) => (
                  <div key={act.id} className="flex gap-4 group">
                    <div className="relative">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${
                        act.type === 'join' ? 'bg-emerald-50 text-emerald-600' :
                        act.type === 'resign' ? 'bg-rose-50 text-rose-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {act.type === 'join' ? <UserPlus size={16} /> :
                         act.type === 'resign' ? <UserMinus size={16} /> :
                         <Briefcase size={16} />}
                      </div>
                      {act.id !== stats.recentActivity.length && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-8 bg-zinc-100" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start">
                        <h5 className="text-xs font-black text-zinc-900 uppercase tracking-widest">{act.user}</h5>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{act.time}</span>
                      </div>
                      <p className="text-[11px] font-bold text-zinc-500 mt-0.5">{act.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-8 w-full py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors bg-zinc-50 rounded-2xl hover:bg-blue-50">
                View Full Audit History
              </button>
            </div>
          </div>

        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e1e1e1;
        }
      `}</style>
    </ProtectedLayout>
  );
}
