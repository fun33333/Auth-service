"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import {
  Plus, Search, Edit2, Trash2, X,
  LayoutGrid, CheckCircle2, XCircle, Users,
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Department = {
  id: string;
  dept_code: string;
  dept_name: string;
  institution_code?: string;
  branch_code?: string;
  description?: string;
};

type Institution = { inst_code: string; name: string };

const DEPT_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
];

const deptSchema = z.object({
  dept_name: z.string().trim().min(2, "Name must be at least 2 characters"),
  dept_code: z.string().trim()
    .min(1, "Code is required")
    .max(6, "Code must be 6 characters or less")
    .regex(/^[A-Za-z0-9]+$/, "Code must be alphanumeric only"),
  institution_code: z.string().optional().or(z.literal("")),
  branch_code: z.string().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
});
type DeptInput = z.input<typeof deptSchema>;
type DeptOutput = z.output<typeof deptSchema>;

const Skeleton = ({ className, height, width }: any) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} style={{ height, width }} />
);

const inputCls = (err?: string) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition ${
    err ? "border-rose-400 ring-rose-100" : "border-slate-300 focus:ring-indigo-500"
  }`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase tracking-wider">{msg}</p>;
}

type SaveResult = { ok: boolean; fieldErrors?: Record<string, string>; error?: string };

type Branch = { branch_code: string; branch_name: string };

function DepartmentModal({
  open, onClose, onSave, initial, institutions, branches,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (d: DeptOutput) => Promise<SaveResult>;
  initial?: Department | null;
  institutions: Institution[];
  branches: Branch[];
}) {
  const {
    register, handleSubmit, reset, setError, watch,
    formState: { errors, isSubmitting },
  } = useForm<DeptInput, any, DeptOutput>({
    resolver: zodResolver(deptSchema),
    defaultValues: { dept_name: "", dept_code: "", institution_code: "", branch_code: "", description: "" },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const instVal = watch("institution_code");
  const branchVal = watch("branch_code");

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    reset(initial ? {
      dept_name: initial.dept_name || "",
      dept_code: initial.dept_code || "",
      institution_code: initial.institution_code || "",
      branch_code: initial.branch_code || "",
      description: initial.description || "",
    } : { dept_name: "", dept_code: "", institution_code: "", branch_code: "", description: "" });
  }, [initial, open, reset]);

  if (!open) return null;

  const submit: SubmitHandler<DeptOutput> = async (data) => {
    setSubmitError(null);
    const res = await onSave(data);
    if (!res.ok) {
      if (res.fieldErrors) {
        Object.entries(res.fieldErrors).forEach(([k, v]) => setError(k as any, { message: v }));
      }
      if (res.error) setSubmitError(res.error);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <form onSubmit={handleSubmit(submit)} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{initial ? "Edit Department" : "Add Department"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Fill in the department details.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
        </div>

        {submitError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {submitError}
          </div>
        )}

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
            <input type="text" placeholder="e.g. Engineering" {...register("dept_name")} className={inputCls(errors.dept_name?.message)} />
            <FieldError msg={errors.dept_name?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department Code</label>
            <input type="text" placeholder="e.g. ENG" disabled={!!initial} {...register("dept_code")} className={`${inputCls(errors.dept_code?.message)} ${initial ? "opacity-60 bg-slate-100 cursor-not-allowed" : ""}`} />
            <FieldError msg={errors.dept_code?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
            <select {...register("institution_code")} disabled={!!branchVal} className={`${inputCls(errors.institution_code?.message)} bg-white ${branchVal ? "opacity-50 cursor-not-allowed" : ""}`}>
              <option value="">— none —</option>
              {institutions.map(inst => (
                <option key={inst.inst_code} value={inst.inst_code}>{inst.name} ({inst.inst_code})</option>
              ))}
            </select>
            <FieldError msg={errors.institution_code?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
            <select {...register("branch_code")} disabled={!!instVal} className={`${inputCls(errors.branch_code?.message)} bg-white ${instVal ? "opacity-50 cursor-not-allowed" : ""}`}>
              <option value="">— none —</option>
              {branches.map(b => (
                <option key={b.branch_code} value={b.branch_code}>{b.branch_name} ({b.branch_code})</option>
              ))}
            </select>
            <FieldError msg={errors.branch_code?.message} />
            {!instVal && !branchVal && <p className="text-[10px] text-slate-400 mt-1 ml-1">Pick institution OR branch — not both</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input type="text" placeholder="Brief description" {...register("description")} className={inputCls(errors.description?.message)} />
            <FieldError msg={errors.description?.message} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition active:scale-95 disabled:opacity-50">
            {isSubmitting ? "Saving…" : initial ? "Save Changes" : "Add Department"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [deptRes, instRes, brRes] = await Promise.all([
        fetchWithAuth("/employees/departments"),
        fetchWithAuth("/employees/institutions"),
        fetchWithAuth("/employees/branches"),
      ]);
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : data.departments || []);
      }
      if (instRes.ok) {
        const data = await instRes.json();
        setInstitutions(Array.isArray(data) ? data : data.institutions || []);
      }
      if (brRes.ok) {
        const data = await brRes.json();
        setBranches(Array.isArray(data) ? data : data.branches || []);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setDepartments([]);
      setInstitutions([]);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = departments.filter(d =>
    (d.dept_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.dept_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.institution_code || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Departments", value: departments.length, icon: LayoutGrid, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active", value: departments.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Branches", value: new Set(departments.map(d => d.branch_code).filter(Boolean)).size, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Institutions", value: new Set(departments.map(d => d.institution_code).filter(Boolean)).size, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  async function handleSave(data: DeptOutput): Promise<SaveResult> {
    const payload = editTarget
      ? {
          dept_name: data.dept_name.trim(),
          description: data.description?.trim() || null,
          institution_code: data.institution_code || null,
          branch_code: data.branch_code || null,
        }
      : {
          dept_name: data.dept_name.trim(),
          dept_code: data.dept_code.trim().toUpperCase(),
          institution_code: data.institution_code || null,
          branch_code: data.branch_code || null,
          description: data.description?.trim() || null,
        };
    const url = editTarget
      ? `/employees/departments/${editTarget.dept_code}`
      : "/employees/departments";
    const method = editTarget ? "PUT" : "POST";
    try {
      const res = await fetchWithAuth(url, { method, body: JSON.stringify(payload) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) { loadData(); setEditTarget(null); return { ok: true }; }
      if (body?.field_errors) return { ok: false, fieldErrors: body.field_errors };
      if (Array.isArray(body?.detail)) {
        return { ok: false, error: body.detail.map((d: any) => d?.msg || JSON.stringify(d)).join("; ") };
      }
      return { ok: false, error: typeof body?.error === "string" ? body.error : "Operation failed" };
    } catch (err: any) {
      return { ok: false, error: err?.message || "Network error" };
    }
  }

  async function handleDelete(deptCode: string) {
    setDeleteBusy(true);
    try {
      const res = await fetchWithAuth(`/employees/departments/${deptCode}`, { method: "DELETE" });
      if (res.ok) loadData();
      else {
        const body = await res.json().catch(() => ({}));
        alert(body?.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteBusy(false);
      setDeleteId(null);
    }
  }

  return (
    <ProtectedLayout>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4"><Trash2 className="text-red-600 h-6 w-6" /></div>
            <h3 className="text-center text-lg font-semibold text-slate-900">Delete Department?</h3>
            <p className="text-center text-sm text-slate-500 mt-1">Soft-delete — recoverable from backend.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} disabled={deleteBusy} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition disabled:opacity-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleteBusy}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50">
                {deleteBusy ? "…" : "Delete"}
              </button>
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
        branches={branches}
      />

      <div className="p-4 sm:p-6 lg:p-10 max-w-400 mx-auto space-y-12 animate-in fade-in duration-1000">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-4xl font-black tracking-tighter text-zinc-900 leading-none">Departments</h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] italic opacity-60">organizational units & functional segments</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <button id="add-department-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex-1 lg:flex-none h-16 px-10 bg-zinc-900 text-white rounded-4xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-zinc-900/10 active:scale-95">
              <Plus size={20} strokeWidth={3} /> Add Department
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
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

        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/20 flex flex-col xl:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <input id="dept-search" type="text" placeholder="search by name, code or institution..."
                className="w-full pl-14 pr-6 py-5 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-[1.5rem] text-xs font-black text-zinc-900 uppercase tracking-widest outline-none transition-all placeholder:text-zinc-300 placeholder:normal-case shadow-inner"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

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
                    <div className={`w-20 h-20 rounded-4xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-500 ${DEPT_COLORS[idx % DEPT_COLORS.length]}`}>
                      {d.dept_name?.charAt(0)}
                    </div>
                  </div>
                  <div className="space-y-1 mb-6">
                    <h4 className="font-black text-zinc-900 text-xl tracking-tight line-clamp-1">{d.dept_name}</h4>
                    <div className="flex flex-col gap-1 items-center">
                      <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{d.dept_code}</span>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{d.institution_code || "Global Unit"}</span>
                    </div>
                  </div>
                  <div className="w-full pt-6 border-t border-zinc-50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditTarget(d); setModalOpen(true); }} className="h-10 w-10 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all active:scale-95 shadow-inner">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(d.dept_code)} className="h-10 w-10 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-inner">
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
