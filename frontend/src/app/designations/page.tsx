"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import {
  Plus, Search, Edit2, Trash2, X,
  Briefcase, CheckCircle2, XCircle, Star
} from "lucide-react";

type Designation = {
  id: string;
  position_code: string;
  position_name: string;
  department__dept_code?: string;
  department_code?: string;
};

type Department = {
  dept_code: string;
  dept_name: string;
};

const LEVEL_STYLE: Record<string, string> = {
  Executive:  "bg-amber-50 text-amber-700 ring-amber-700/10",
  Senior:     "bg-blue-50 text-blue-700 ring-blue-700/10",
  "Mid-Level":"bg-sky-50 text-sky-700 ring-sky-700/10",
  Junior:     "bg-emerald-50 text-emerald-700 ring-emerald-700/10",
  Intern:     "bg-zinc-100 text-zinc-600 ring-zinc-600/10",
};

// ── Skeleton (Small helper) ────────────────────────────────────────────────

const Skeleton = ({ className, height, width }: any) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} style={{ height, width }} />
);

function DesignationModal({ open, onClose, onSave, initial, departments }: {
  open: boolean; onClose: () => void;
  onSave: (d: any) => void; initial?: Designation | null;
  departments: Department[];
}) {
  const empty = { position_name: "", position_code: "", department_code: "", description: "" };
  const [form, setForm] = useState(initial ? { position_name: initial.position_name, position_code: initial.position_code, department_code: initial.department__dept_code || initial.department_code || "", description: "" } : empty);
  useEffect(() => { setForm(initial ? { position_name: initial.position_name, position_code: initial.position_code, department_code: initial.department__dept_code || initial.department_code || "", description: "" } : empty); }, [initial, open]);
  if (!open) return null;
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{initial ? "Edit Designation" : "Add Designation"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Fill in the position details.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Position Name</label>
            <input type="text" placeholder="e.g. Software Engineer" value={form.position_name} onChange={f('position_name')}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Position Code</label>
            <input type="text" placeholder="e.g. SE-01" value={form.position_code} onChange={f('position_code')}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select value={form.department_code} onChange={f('department_code')}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.dept_code} value={dept.dept_code}>
                  {dept.dept_name} ({dept.dept_code})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input type="text" placeholder="Brief description" value={form.description} onChange={f('description')}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition active:scale-95">
            {initial ? "Save Changes" : "Add Designation"}
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
      const [desRes, deptRes] = await Promise.all([
        fetchWithAuth('/designations'),
        fetchWithAuth('/departments')
      ]);
      
      if (desRes.ok) {
        const data = await desRes.json();
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
     (d.department__dept_code || '').toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: "Total Designations", value: Array.isArray(designations) ? designations.length : 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active", value: Array.isArray(designations) ? designations.length : 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Departments", value: Array.isArray(designations) ? new Set(designations.map(d => d.department__dept_code).filter(Boolean)).size : 0, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Positions", value: Array.isArray(designations) ? designations.length : 0, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  async function handleSave(data: any) {
    try {
      if (!editTarget) {
        const res = await fetchWithAuth('/designations', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res.ok) loadData();
        else {
          const err = await res.json();
          alert(err.error || "Failed to create designation");
        }
      } else {
        const res = await fetchWithAuth(`/designations/${editTarget.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        if (res.ok) loadData();
        else {
          const err = await res.json();
          alert(err.error || "Failed to update designation");
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
    setEditTarget(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this designation?")) return;
    try {
      const res = await fetchWithAuth(`/designations/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
      else {
        const err = await res.json();
        alert(err.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleteId(null);
  }

  return (
    <ProtectedLayout>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4"><Trash2 className="text-red-600 h-6 w-6" /></div>
            <h3 className="text-center text-lg font-semibold text-slate-900">Delete Designation?</h3>
            <p className="text-center text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Delete</button>
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
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-zinc-900 leading-none lowercase">positional framework</h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] italic opacity-60">job titles, roles & authority levels</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
             <button id="add-designation-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
               className="flex-1 lg:flex-none h-16 px-10 bg-zinc-900 text-white rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-zinc-900/10 active:scale-95"
             >
               <Plus size={20} strokeWidth={3} /> Add Designation
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div key={s.label} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className={`absolute top-6 right-6 p-4 rounded-2xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                <s.icon size={24} strokeWidth={2.5} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                {loading ? <Skeleton width="40%" height={32} className="mt-2" /> : (
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter leading-none">{s.value}</h3>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Command Center (Action Bar) */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/20 flex flex-col xl:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <input
                id="designation-search"
                type="text"
                placeholder="search by title, code or department..."
                className="w-full pl-14 pr-6 py-5 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-[1.5rem] text-xs font-black text-zinc-900 uppercase tracking-widest outline-none transition-all placeholder:text-zinc-300 placeholder:normal-case shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Segment */}
        <div className="relative pb-20">
          <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden shadow-2xl shadow-zinc-200/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-50/50 text-left">
                <thead>
                  <tr className="bg-zinc-50/30">
                    <th className="py-8 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Position / Title</th>
                    <th className="py-8 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Registry Code</th>
                    <th className="py-8 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Department</th>
                    <th className="py-8 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50/50">
                  {loading ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="p-8" colSpan={4}><Skeleton height={24} className="rounded-xl w-full" /></td>
                    </tr>
                  )) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-32 text-center flex flex-col items-center justify-center">
                        <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6"><Briefcase size={40} /></div>
                        <h4 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">No Designations Found</h4>
                      </td>
                    </tr>
                  ) : filtered.map(d => (
                    <tr key={d.id} className="hover:bg-zinc-50/60 transition-all group">
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-sm font-black shadow-lg group-hover:scale-110 transition-transform">
                            {d.position_name?.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-sm font-black text-zinc-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{d.position_name}</h5>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Professional Grade</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100/50 tracking-widest font-mono">
                          {d.position_code}
                        </span>
                      </td>
                      <td className="p-8">
                        <span className="px-4 py-1.5 bg-zinc-50 text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-100 shadow-sm inline-block">
                          {d.department__dept_code || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditTarget(d); setModalOpen(true); }} className="h-10 w-10 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-95 shadow-inner">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteId(d.id)} className="h-10 w-10 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-inner">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length > 0 && (
              <div className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Showing <span className="text-zinc-900">{filtered.length}</span> of <span className="text-zinc-900">{designations.length}</span> Framework units
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
