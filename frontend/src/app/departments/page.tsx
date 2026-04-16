"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import {
  Plus, Search, Edit2, Trash2, X,
  LayoutGrid, CheckCircle2, XCircle, Users
} from "lucide-react";

type Department = {
  id: string;
  dept_code: string;
  dept_name: string;
  institution_code: string;
  dept_sector?: string;
};

type Institution = {
  inst_code: string;
  name: string;
};

const DEPT_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
];

// ── Skeleton (Small helper) ────────────────────────────────────────────────

const Skeleton = ({ className, height, width }: any) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} style={{ height, width }} />
);

function DepartmentModal({ open, onClose, onSave, initial, institutions }: {
  open: boolean; onClose: () => void;
  onSave: (d: any) => void; initial?: Department | null;
  institutions: Institution[];
}) {
  const empty = { dept_name: "", dept_code: "", institution_code: "", description: "" };
  const [form, setForm] = useState(initial ? { dept_name: initial.dept_name, dept_code: initial.dept_code, institution_code: initial.institution_code || "", description: "" } : empty);
  useEffect(() => { setForm(initial ? { dept_name: initial.dept_name, dept_code: initial.dept_code, institution_code: initial.institution_code || "", description: "" } : empty); }, [initial, open]);

  if (!open) return null;
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{initial ? "Edit Department" : "Add Department"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Fill in the department details.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
            <input type="text" placeholder="e.g. Engineering" value={form.dept_name} onChange={f('dept_name')}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department Code</label>
            <input type="text" placeholder="e.g. ENG" value={form.dept_code} onChange={f('dept_code')}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
            <select value={form.institution_code} onChange={f('institution_code')}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
              <option value="">Global / No Institution</option>
              {institutions.map(inst => (
                <option key={inst.inst_code} value={inst.inst_code}>
                  {inst.name} ({inst.inst_code})
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
            {initial ? "Save Changes" : "Add Department"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [deptRes, instRes] = await Promise.all([
        fetchWithAuth('/departments'),
        fetchWithAuth('/institutions')
      ]);
      
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : (data.departments || []));
      }
      if (instRes.ok) {
        const data = await instRes.json();
        setInstitutions(Array.isArray(data) ? data : (data.institutions || []));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setDepartments([]);
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = (Array.isArray(departments) ? departments : []).filter(d =>
    (d.dept_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.dept_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.institution_code || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Departments", value: Array.isArray(departments) ? departments.length : 0, icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active", value: Array.isArray(departments) ? departments.length : 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Sectors", value: Array.isArray(departments) ? new Set(departments.map(d => d.dept_sector)).size : 0, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Institutions", value: Array.isArray(departments) ? new Set(departments.map(d => d.institution_code).filter(Boolean)).size : 0, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  async function handleSave(data: any) {
    try {
      if (editTarget) {
        const res = await fetchWithAuth(`/departments/${editTarget.dept_code}`, {
          method: 'PUT',
          body: JSON.stringify({ dept_name: data.dept_name, description: data.description, institution_code: data.institution_code })
        });
        if (res.ok) loadData();
        else {
          const err = await res.json();
          alert(err.error || "Failed to update department");
        }
      } else {
        const res = await fetchWithAuth('/departments', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res.ok) loadData();
        else {
          const err = await res.json();
          alert(err.error || "Failed to create department");
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
    setEditTarget(null);
  }

  async function handleDelete(deptCode: string) {
    try {
      const res = await fetchWithAuth(`/departments/${deptCode}`, { method: 'DELETE' });
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
            <h3 className="text-center text-lg font-semibold text-slate-900">Delete Department?</h3>
            <p className="text-center text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
      <DepartmentModal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setEditTarget(null); }} 
        onSave={handleSave} 
        initial={editTarget} 
        institutions={institutions}
      />

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-zinc-900 leading-none lowercase">departments registry</h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] italic opacity-60">organizational units & functional segments</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
             <button id="add-department-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
               className="flex-1 lg:flex-none h-16 px-10 bg-zinc-900 text-white rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-zinc-900/10 active:scale-95"
             >
               <Plus size={20} strokeWidth={3} /> Add Department
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
                id="dept-search"
                type="text"
                placeholder="search by name, code or institution..."
                className="w-full pl-14 pr-6 py-5 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-[1.5rem] text-xs font-black text-zinc-900 uppercase tracking-widest outline-none transition-all placeholder:text-zinc-300 placeholder:normal-case shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Content Segment */}
        <div className="relative pb-20">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <Skeleton key={i} height={200} className="rounded-[3rem]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-40 text-center bg-white rounded-[4rem] border border-dashed border-zinc-200 shadow-xl shadow-zinc-200/20 flex flex-col items-center justify-center">
              <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-6"><XCircle size={40} /></div>
              <h4 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">No Department Matches</h4>
              <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mt-2 italic">Refine your search parameters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((d, idx) => (
                <div key={d.id} className="group bg-white rounded-[3rem] border border-zinc-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-zinc-300/30 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-2 ${DEPT_COLORS[idx % DEPT_COLORS.length].split(" ")[0]}`} />
                  
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-500 ${DEPT_COLORS[idx % DEPT_COLORS.length]}`}>
                        {d.dept_name?.charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h4 className="font-black text-zinc-900 text-xl tracking-tight line-clamp-1">{d.dept_name}</h4>
                    <div className="flex flex-col gap-1 items-center">
                      <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{d.dept_code}</span>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{d.institution_code || 'Global Unit'}</span>
                    </div>
                  </div>
                  
                  <div className="w-full pt-6 border-t border-zinc-50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditTarget(d); setModalOpen(true); }} className="h-10 w-10 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-95 shadow-inner">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(d.id)} className="h-10 w-10 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-inner">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
