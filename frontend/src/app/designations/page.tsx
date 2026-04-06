"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import {
  Plus, Search, Edit2, Trash2, X,
  Briefcase, CheckCircle2, XCircle, Star
} from "lucide-react";

type Designation = {
  id: string;
  code: string;
  position_name: string;
  department: string;
  level: string;
  grade: string;
  is_active: boolean;
};

const LEVELS = ["Executive", "Senior", "Mid-Level", "Junior", "Intern"];
const MOCK_DESIGNATIONS: Designation[] = [
  { id: "1",  code: "DSG-001", position_name: "Chief Executive Officer",   department: "Administration",  level: "Executive",  grade: "G-12", is_active: true  },
  { id: "2",  code: "DSG-002", position_name: "Lead Software Engineer",    department: "Engineering",     level: "Senior",     grade: "G-10", is_active: true  },
  { id: "3",  code: "DSG-003", position_name: "HR Manager",                department: "Human Resources", level: "Senior",     grade: "G-9",  is_active: true  },
  { id: "4",  code: "DSG-004", position_name: "Finance Analyst",           department: "Finance",         level: "Mid-Level",  grade: "G-7",  is_active: true  },
  { id: "5",  code: "DSG-005", position_name: "Operations Coordinator",    department: "Operations",      level: "Mid-Level",  grade: "G-6",  is_active: false },
  { id: "6",  code: "DSG-006", position_name: "Marketing Specialist",      department: "Marketing",       level: "Mid-Level",  grade: "G-7",  is_active: true  },
  { id: "7",  code: "DSG-007", position_name: "Systems Administrator",     department: "IT & Systems",    level: "Senior",     grade: "G-9",  is_active: true  },
  { id: "8",  code: "DSG-008", position_name: "Research Associate",        department: "Research",        level: "Junior",     grade: "G-5",  is_active: true  },
  { id: "9",  code: "DSG-009", position_name: "Software Engineer",         department: "Engineering",     level: "Mid-Level",  grade: "G-7",  is_active: true  },
  { id: "10", code: "DSG-010", position_name: "Intern – Data Science",     department: "IT & Systems",    level: "Intern",     grade: "G-1",  is_active: true  },
];

const LEVEL_STYLE: Record<string, string> = {
  Executive:  "bg-amber-50 text-amber-700 ring-amber-700/10 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-500/20",
  Senior:     "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/20",
  "Mid-Level":"bg-sky-50 text-sky-700 ring-sky-700/10 dark:bg-sky-900/20 dark:text-sky-400 dark:ring-sky-500/20",
  Junior:     "bg-emerald-50 text-emerald-700 ring-emerald-700/10 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/20",
  Intern:     "bg-zinc-100 text-zinc-600 ring-zinc-600/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
};

function DesignationModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (d: Partial<Designation>) => void; initial?: Designation | null;
}) {
  const empty = { position_name: "", code: "", department: "", level: "Mid-Level", grade: "", is_active: true };
  const [form, setForm] = useState(initial ? { ...initial } : empty);
  useEffect(() => { setForm(initial ? { ...initial } : empty); }, [initial, open]);
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
          {([
            { label: "Position Name", key: "position_name", placeholder: "e.g. Software Engineer" },
            { label: "Designation Code", key: "code", placeholder: "e.g. DSG-011" },
            { label: "Department", key: "department", placeholder: "e.g. Engineering" },
            { label: "Grade", key: "grade", placeholder: "e.g. G-7" },
          ] as { label: string; key: keyof typeof form; placeholder: string }[]).map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type="text" placeholder={placeholder} value={String(form[key])} onChange={f(key)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
            <select value={String(form.level)} onChange={f("level")}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.is_active ? "Active" : "Inactive"}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.value === "Active" }))}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
              <option>Active</option><option>Inactive</option>
            </select>
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Designation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => { setDesignations(MOCK_DESIGNATIONS); setLoading(false); }, 700);
  }, []);

  const levels = ["All", ...LEVELS];
  const filtered = designations.filter(d =>
    (filterLevel === "All" || d.level === filterLevel) &&
    (d.position_name.toLowerCase().includes(search.toLowerCase()) ||
     d.department.toLowerCase().includes(search.toLowerCase()) ||
     d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: "Total Designations", value: designations.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Active Status", value: designations.filter(d => d.is_active).length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Inactive Status", value: designations.filter(d => !d.is_active).length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Tiered Levels", value: LEVELS.length, icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  function handleSave(data: Partial<Designation>) {
    if (editTarget) setDesignations(prev => prev.map(d => d.id === editTarget.id ? { ...d, ...data } : d));
    else setDesignations(prev => [{ id: String(Date.now()), ...data } as Designation, ...prev]);
    setEditTarget(null);
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
              <button onClick={() => { setDesignations(prev => prev.filter(d => d.id !== deleteId)); setDeleteId(null); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
      <DesignationModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Positional Framework</h1>
            <p className="mt-1 text-[var(--muted-foreground)]">Define and manage job titles, grading, and seniority levels.</p>
          </div>
          <button id="add-designation-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
            <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Designation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card-professional relative group">
                {loading ? <div className="animate-pulse h-16 bg-[var(--background)] rounded-xl" /> : <>
                  <div className={`inline-flex p-3 rounded-xl ${s.bg} group-hover:scale-110 transition-transform mb-4`}><Icon className={`h-6 w-6 ${s.color}`} /></div>
                  <p className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{s.label}</p>
                  <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{s.value}</p>
                </>}
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-[var(--card)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]/50 flex flex-col sm:flex-row gap-4 justify-between lg:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input id="designation-search" type="text" placeholder="Search designations..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-full text-sm text-[var(--foreground)] focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {levels.map(l => (
                <button key={l} onClick={() => setFilterLevel(l)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filterLevel === l ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-blue-400 hover:text-blue-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  {["Position", "Department", "Level", "Grade", "Status", ""].map(col => (
                    <th key={col} className="py-4 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-6 last:pr-6">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((__, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}</tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center">
                    <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No designations found.</p>
                  </td></tr>
                ) : filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="whitespace-nowrap py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">{d.position_name.charAt(0)}</div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{d.position_name}</div>
                          <div className="text-xs font-mono text-slate-400">{d.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{d.department}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${LEVEL_STYLE[d.level] ?? "bg-slate-50 text-slate-700 ring-slate-700/10"}`}>{d.level}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-mono text-slate-600">{d.grade}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${d.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${d.is_active ? "bg-green-500" : "bg-red-500"}`} />
                        {d.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditTarget(d); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(d.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{designations.length}</span> designations</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
