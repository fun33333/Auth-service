"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import {
  Plus, Search, Edit2, Trash2, X,
  LayoutGrid, CheckCircle2, XCircle, Users
} from "lucide-react";

type Department = {
  id: string;
  code: string;
  dept_name: string;
  branch: string;
  institution: string;
  manager: string;
  employees: number;
  is_active: boolean;
};

const MOCK_DEPARTMENTS: Department[] = [
  { id: "1", code: "DEPT-001", dept_name: "Administration", branch: "Head Office – Lahore", institution: "Punjab University", manager: "Sarah Jenkins", employees: 18, is_active: true },
  { id: "2", code: "DEPT-002", dept_name: "Engineering", branch: "Islamabad Campus", institution: "NUST Islamabad", manager: "David Chen", employees: 45, is_active: true },
  { id: "3", code: "DEPT-003", dept_name: "Human Resources", branch: "Head Office – Lahore", institution: "Punjab University", manager: "Amelia Pond", employees: 12, is_active: true },
  { id: "4", code: "DEPT-004", dept_name: "Finance", branch: "Karachi Branch", institution: "City Grammar School", manager: "Rory Williams", employees: 10, is_active: true },
  { id: "5", code: "DEPT-005", dept_name: "Operations", branch: "Rawalpindi Campus", institution: "FAST National University", manager: "Omar Farooq", employees: 22, is_active: false },
  { id: "6", code: "DEPT-006", dept_name: "Marketing", branch: "Islamabad Campus", institution: "NUST Islamabad", manager: "Fatima Malik", employees: 8, is_active: true },
  { id: "7", code: "DEPT-007", dept_name: "IT & Systems", branch: "Head Office – Lahore", institution: "Punjab University", manager: "Ali Hassan", employees: 30, is_active: true },
  { id: "8", code: "DEPT-008", dept_name: "Research", branch: "Multan Office", institution: "Roots International School", manager: "Dr. Nadia K.", employees: 15, is_active: true },
];

const DEPT_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
];

function DepartmentModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (d: Partial<Department>) => void; initial?: Department | null;
}) {
  const empty = { dept_name: "", code: "", branch: "", institution: "", manager: "", is_active: true };
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
            <h2 className="text-lg font-semibold text-slate-900">{initial ? "Edit Department" : "Add Department"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Fill in the department details.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { label: "Department Name", key: "dept_name", placeholder: "e.g. Engineering" },
            { label: "Department Code", key: "code", placeholder: "e.g. DEPT-009" },
            { label: "Institution", key: "institution", placeholder: "e.g. NUST Islamabad" },
            { label: "Branch", key: "branch", placeholder: "e.g. Islamabad Campus" },
            { label: "Manager / HOD", key: "manager", placeholder: "e.g. Dr. Ali" },
          ] as { label: string; key: keyof typeof form; placeholder: string }[]).map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type="text" placeholder={placeholder} value={String(form[key])} onChange={f(key)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>
          ))}
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
            {initial ? "Save Changes" : "Add Department"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => { setDepartments(MOCK_DEPARTMENTS); setLoading(false); }, 700);
  }, []);

  const filtered = departments.filter(d =>
    d.dept_name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.branch.toLowerCase().includes(search.toLowerCase()) ||
    d.manager.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Departments", value: departments.length, icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Active Status", value: departments.filter(d => d.is_active).length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Inactive Status", value: departments.filter(d => !d.is_active).length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Total Staff Count", value: departments.reduce((s, d) => s + d.employees, 0), icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
  ];

  function handleSave(data: Partial<Department>) {
    if (editTarget) setDepartments(prev => prev.map(d => d.id === editTarget.id ? { ...d, ...data } : d));
    else setDepartments(prev => [{ id: String(Date.now()), employees: 0, ...data } as Department, ...prev]);
    setEditTarget(null);
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
              <button onClick={() => { setDepartments(prev => prev.filter(d => d.id !== deleteId)); setDeleteId(null); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
      <DepartmentModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Departments Registry</h1>
            <p className="mt-1 text-[var(--muted-foreground)]">Manage all organizational units and functional departments.</p>
          </div>
          <button id="add-department-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
            <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Department
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

        {/* Cards Grid */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input id="dept-search" type="text" placeholder="Filter departments..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-full text-sm text-[var(--foreground)] focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 h-40" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm">
              <LayoutGrid className="h-12 w-12 text-[var(--muted-foreground)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--muted-foreground)] font-medium">No departmental resources found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((d, idx) => (
                <div key={d.id} className="group bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  <div className={`h-1.5 ${DEPT_COLORS[idx % DEPT_COLORS.length].split(" ")[0].replace("bg-", "bg-").replace("-900/20", "-500")}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${DEPT_COLORS[idx % DEPT_COLORS.length]}`}>
                        {d.dept_name.charAt(0)}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tighter ${d.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"}`}>
                        <span className={`h-1 w-1 rounded-full ${d.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {d.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <h3 className="font-bold text-[var(--foreground)] tracking-tight text-[15px] mb-1">{d.dept_name}</h3>
                    <p className="text-[11px] font-mono text-[var(--muted-foreground)] mb-4">{d.code}</p>
                    <div className="space-y-2.5 text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-2 font-medium"><Users className="h-4 w-4 opacity-70" />{d.employees} Staff Members</div>
                      <div className="truncate flex items-center gap-2" title={d.manager}><span className="opacity-70">👤</span> <span className="font-medium text-[var(--foreground)]">{d.manager}</span></div>
                      <div className="truncate flex items-center gap-2" title={d.branch}><span className="opacity-70">📍</span> {d.branch}</div>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-6 pt-4 border-t border-[var(--border)] opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditTarget(d); setModalOpen(true); }} className="p-2 text-[var(--muted-foreground)] hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(d.id)} className="p-2 text-[var(--muted-foreground)] hover:text-rose-600 hover:bg-rose-600/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
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
