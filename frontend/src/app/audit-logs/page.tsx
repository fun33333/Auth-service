"use client";

import React, { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';
import { 
  Activity, Clock, ChevronLeft, Search, Filter,
  ArrowRight, Download, RefreshCcw
} from 'lucide-react';
import { fetchWithAuth } from '@/utils/api';
import Skeleton from '@/components/Skeleton';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  model: string;
  detail: string;
  time: string;
  type: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/audit-logs?limit=50');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.detail.toLowerCase().includes(search.toLowerCase()) ||
    log.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedLayout>
      <div className="p-4 sm:p-6 lg:p-10 max-w-350 mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="h-12 w-12 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 leading-none">Security Audit</h1>
              <p className="mt-2 text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest italic">Immutable System Trace Logs</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={loadLogs}
               className="h-12 px-6 bg-white border border-zinc-100 rounded-2xl flex items-center gap-2 text-xs font-black text-zinc-600 uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm"
             >
               <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
             </button>
             <button className="h-12 px-6 bg-zinc-900 rounded-2xl flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10">
               <Download size={14} /> Export CSV
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 sm:p-8 rounded-4xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by user, action or resource..."
              className="w-full pl-12 pr-6 py-4 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-sm font-bold text-zinc-700 outline-none transition-all placeholder:text-zinc-300 shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
             <button className="h-14 px-8 bg-zinc-50 rounded-2xl flex items-center gap-3 text-xs font-black text-zinc-500 uppercase tracking-widest hover:bg-zinc-100 transition-all">
                <Filter size={16} /> All Events
             </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-50">
                  <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] w-20">Type</th>
                  <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Initiator</th>
                  <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Operation Detail</th>
                  <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Resource</th>
                  <th className="p-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50/50">
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="p-8"><Skeleton height={20} width="80%" className="rounded-lg" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No activity records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/40 transition-colors group">
                      <td className="p-8">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all ${
                          log.type === 'create' ? 'bg-emerald-50 text-emerald-600' :
                          log.type === 'delete' ? 'bg-rose-50 text-rose-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          <Activity size={18} strokeWidth={2.5} />
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-800">{log.user}</span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">System ID: {log.id.substring(0,6)}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                              log.type === 'create' ? 'bg-emerald-100 text-emerald-700' :
                              log.type === 'delete' ? 'bg-rose-100 text-rose-700' :
                              'bg-blue-100 text-blue-700'
                           }`}>
                              {log.action}
                           </span>
                           <span className="text-xs font-bold text-zinc-600">{log.detail}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="text-[10px] font-black text-zinc-900 bg-zinc-100 px-2 py-1 rounded uppercase tracking-[0.1em]">
                          {log.model}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-zinc-800">{new Date(log.time).toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-zinc-400">{new Date(log.time).toLocaleTimeString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ProtectedLayout>
  );
}
