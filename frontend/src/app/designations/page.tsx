"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import {
  Plus, Search, Edit2, Trash2, X,
  Briefcase, CheckCircle2, XCircle, Star, Filter
} from "lucide-react";

type Designation = {
  id: string;
  position_code: string;
  position_name: string;
  department__dept_code?: string;
  department_code?: string;
  description?: string;
};

type Department = {
  dept_code: string;
  dept_name: string;
};

const Skeleton = ({ className, height, width }: any) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} style={{ height, width }} />
);

function DesignationModal({ open, onClose, onSave, initial, departments }: {
  open: boolean; onClose: () => void;
  onSave: (d: any) => void; initial?: Designation | null;
  departments: Department[];
}) {
  const empty = { position_name: "", position_code: "", department_code: "", description: "" };
  const [form, setForm] = useState(empty);

  useEffect(() => { 
  setForm(
  initial
    ? {
        position_name: initial.position_name || "",
        position_code: initial.position_code || "",
        department_code:
          initial.department__dept_code ||
          initial.department_code ||
          "",
        description: initial.description || "",
      }
    : empty
);
  }, [initial, open]);

  if (!open) return null;

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{initial ? "Update Designation" : "Establish New Position"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Define role parameters and authority levels.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Position / Title</label>
            <input type="text" placeholder="e.g. Senior Surgeon, Head Teacher" value={form.position_name} onChange={f('position_name')}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none transition uppercase shadow-inner" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Registry Code</label>
              <input type="text" placeholder="e.g. SRG, TCH" value={form.position_code} onChange={f('position_code')} disabled={!!initial}
                className={`w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none transition uppercase shadow-inner ${initial ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Unit Assignment</label>
              <select value={form.department_code} onChange={f('department_code')} disabled={!!initial}
                className={`w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-bold text-slate-900 outline-none transition bg-white appearance-none shadow-inner ${initial ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.dept_code} value={dept.dept_code}>
                    {dept.dept_name} [{dept.dept_code}]
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Role Description</label>
            <textarea placeholder="Outline key responsibilities..." value={form.description} onChange={f('description')} rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-medium text-slate-700 outline-none transition resize-none shadow-inner" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="px-8 py-2.5 text-[10px] font-black text-white bg-zinc-900 rounded-xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 uppercase tracking-widest">
            {initial ? "Apply Changes" : "Confirm Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Designation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [desigRes, deptRes] = await Promise.all([
        fetchWithAuth('/employees/designations'),
        fetchWithAuth('/employees/departments')
      ]);
      
      if (desigRes.ok) {
        const data = await desigRes.json();
        setDesignations(Array.isArray(data) ? data : (data.designations || []));
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : (data.departments || []));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setDesignations([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = (Array.isArray(designations) ? designations : []).filter(d =>
    ((d.position_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (d.position_code || '').toLowerCase().includes(search.toLowerCase()) ||
     (d.department__dept_code || d.department_code || '').toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: "Total Designations", value: designations.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Roles", value: designations.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Unit Mix", value: new Set(designations.map(d => d.department__dept_code || d.department_code)).size, icon: Filter, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "System Nodes", value: designations.length, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  ];

 async function handleSave(data: any) {
  try {
const payload = {
  department_code: data.department_code?.trim(),
  position_code: data.position_code?.trim(),
  position_name: data.position_name?.trim(),
  description: data.description?.trim() || null,
};

    const url = editTarget
      ? `/employees/designations/${editTarget.id}`
      : `/employees/designations`;

    const method = editTarget ? "PUT" : "POST";

    const res = await fetchWithAuth(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      loadData();
      setModalOpen(false);
    } else {
      const err = await res.json();
      console.error("Backend Error:", err);
      alert(err.error || err.detail || "Operation failed");
    }
  } catch (err) {
    console.error("Save failed:", err);
  }

  setEditTarget(null);
}

async function handleDelete(id: string) {
  try {
    const res = await fetchWithAuth(`/employees/designations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadData();
      setDeleteId(null);
    } else {
      const err = await res.json();
      alert(err.error || "Failed to purge node from registry.");
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

  return (
    <ProtectedLayout>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner group"><Trash2 className="group-hover:rotate-12 transition-transform" /></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Decommission Position?</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">This role will be purged from the active framework.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl hover:bg-slate-100 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200">Delete</button>
            </div>
          </div>
        </div>
      )}

      <DesignationModal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setEditTarget(null); }} 
        onSave={handleSave} 
        initial={editTarget} 
        departments={departments}
      />

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000">
        
        {/* UI Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-4xl font-black tracking-tighter text-zinc-900 leading-none uppercase">Position Registry</h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] italic opacity-60">job roles, hierarchies & functional authority</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
             <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
               className="flex-1 lg:flex-none h-16 px-10 bg-zinc-900 text-white rounded-[2rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-zinc-900/10"
             >
               <Plus size={20} strokeWidth={3} /> Add Position
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group relative overflow-hidden">
              <div className={`absolute top-6 right-6 p-4 rounded-2xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}><s.icon size={24} strokeWidth={2.5} /></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                {loading ? <Skeleton width="40%" height={32} /> : (
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter leading-none">{s.value}</h3>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter opacity-60">Live</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/20">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH BY ROLE, CODE OR DEPARTMENT HUB..."
              className="w-full pl-14 pr-6 py-5 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-[11px] font-black text-zinc-900 uppercase tracking-widest outline-none transition-all shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table Segment */}
        <div className="relative pb-20">
          <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden shadow-2xl shadow-zinc-200/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-50/50 text-left">
                <thead>
                  <tr className="bg-zinc-50/30">
                    <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Position / Role</th>
                    <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Registry Code</th>
                    <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Unit Hub</th>
                    <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50/50">
                  {loading ? [...Array(4)].map((_, i) => (
                    <tr key={i}><td colSpan={4} className="p-8"><Skeleton height={24} className="w-full rounded-full" /></td></tr>
                  )) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <XCircle size={40} className="mx-auto text-zinc-200 mb-4" />
                        <h4 className="text-zinc-400 text-xs font-black uppercase tracking-widest">No positions found matching your search.</h4>
                      </td>
                    </tr>
                  ) : filtered.map(d => (
                    <tr key={d.id} className="hover:bg-zinc-50/40 transition-all group">
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-sm font-black transition-transform group-hover:scale-110 shadow-lg shadow-zinc-900/10">
                            {d.position_name?.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{d.position_name}</h5>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Professional Grade Record</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-4 py-2 rounded-full border border-indigo-100 tracking-[0.2em] font-mono shadow-sm">
                          {d.position_code}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">
                            {departments.find(dept => dept.dept_code === (d.department__dept_code || d.department_code))?.dept_name || 'Unassigned Node'}
                          </span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditTarget(d); setModalOpen(true); }} className="h-11 w-11 flex items-center justify-center bg-white text-zinc-400 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm border border-zinc-100">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setDeleteId(d.id)} className="h-11 w-11 flex items-center justify-center bg-white text-zinc-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-zinc-100">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}