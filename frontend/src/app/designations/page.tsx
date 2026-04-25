"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import {
  Plus, Search, Edit2, Trash2, X,
  Briefcase, CheckCircle2, XCircle, Star, Filter,
} from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Designation = {
  id: string;
  position_code: string;
  position_name: string;
  department__dept_code?: string;
  department_code?: string;
  description?: string;
};

type Department = { dept_code: string; dept_name: string };

const desigSchema = z.object({
  position_name: z.string().trim().min(2, "Name must be at least 2 characters"),
  position_code: z.string().trim().min(1, "Code is required").max(20, "Code too long"),
  department_code: z.string().min(1, "Select a department"),
  description: z.string().trim().optional().or(z.literal("")),
});
type DesigInput = z.input<typeof desigSchema>;
type DesigOutput = z.output<typeof desigSchema>;

const Skeleton = ({ className, height, width }: any) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} style={{ height, width }} />
);

const inputCls = (err?: string, extra = "") =>
  `w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none transition uppercase shadow-inner ${
    err ? "border-rose-400 bg-rose-50/40" : "border-transparent focus:border-indigo-500 focus:bg-white"
  } ${extra}`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase tracking-wider">{msg}</p>;
}

type SaveResult = { ok: boolean; fieldErrors?: Record<string, string>; error?: string };

function DesignationModal({
  open, onClose, onSave, initial, departments,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (d: DesigOutput) => Promise<SaveResult>;
  initial?: Designation | null;
  departments: Department[];
}) {
  const {
    register, handleSubmit, reset, setError,
    formState: { errors, isSubmitting },
  } = useForm<DesigInput, any, DesigOutput>({
    resolver: zodResolver(desigSchema),
    defaultValues: { position_name: "", position_code: "", department_code: "", description: "" },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    reset(initial ? {
      position_name: initial.position_name || "",
      position_code: initial.position_code || "",
      department_code: initial.department__dept_code || initial.department_code || "",
      description: initial.description || "",
    } : { position_name: "", position_code: "", department_code: "", description: "" });
  }, [initial, open, reset]);

  if (!open) return null;

  const submit: SubmitHandler<DesigOutput> = async (data) => {
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

  const lockedExtra = "opacity-50 cursor-not-allowed bg-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <form onSubmit={handleSubmit(submit)} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{initial ? "Update Designation" : "Establish New Position"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Define role parameters and authority levels.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
        </div>

        {submitError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {submitError}
          </div>
        )}

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Position / Title</label>
            <input type="text" placeholder="e.g. Senior Surgeon, Head Teacher" {...register("position_name")} className={inputCls(errors.position_name?.message)} />
            <FieldError msg={errors.position_name?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Registry Code</label>
              <input type="text" placeholder="e.g. SRG, TCH" disabled={!!initial} {...register("position_code")} className={inputCls(errors.position_code?.message, initial ? lockedExtra : "")} />
              <FieldError msg={errors.position_code?.message} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Unit Assignment</label>
              <select disabled={!!initial} {...register("department_code")} className={`${inputCls(errors.department_code?.message, initial ? lockedExtra : "")} appearance-none bg-white`}>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.dept_code} value={dept.dept_code}>{dept.dept_name} [{dept.dept_code}]</option>
                ))}
              </select>
              <FieldError msg={errors.department_code?.message} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Role Description</label>
            <textarea rows={3} placeholder="Outline key responsibilities..." {...register("description")} className={`${inputCls(errors.description?.message)} resize-none`} />
            <FieldError msg={errors.description?.message} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition">Cancel</button>
          <button type="submit" disabled={isSubmitting}
            className="px-8 py-2.5 text-[10px] font-black text-white bg-zinc-900 rounded-xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50">
            {isSubmitting ? "Saving…" : initial ? "Apply Changes" : "Confirm Entry"}
          </button>
        </div>
      </form>
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
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [desigRes, deptRes] = await Promise.all([
        fetchWithAuth("/employees/designations"),
        fetchWithAuth("/employees/departments"),
      ]);
      if (desigRes.ok) {
        const data = await desigRes.json();
        setDesignations(Array.isArray(data) ? data : data.designations || []);
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : data.departments || []);
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

  const filtered = designations.filter(d =>
    (d.position_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.position_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.department__dept_code || d.department_code || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Designations", value: designations.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Roles", value: designations.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Unit Mix", value: new Set(designations.map(d => d.department__dept_code || d.department_code)).size, icon: Filter, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "System Nodes", value: designations.length, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  async function handleSave(data: DesigOutput): Promise<SaveResult> {
    const payload = editTarget
      ? {
          position_name: data.position_name.trim(),
          description: data.description?.trim() || null,
        }
      : {
          department_code: data.department_code,
          position_code: data.position_code.trim(),
          position_name: data.position_name.trim(),
          description: data.description?.trim() || null,
        };
    const url = editTarget
      ? `/employees/designations/${editTarget.id}`
      : "/employees/designations";
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

  async function handleDelete(id: string) {
    setDeleteBusy(true);
    try {
      const res = await fetchWithAuth(`/employees/designations/${id}`, { method: "DELETE" });
      if (res.ok) loadData();
      else {
        const body = await res.json().catch(() => ({}));
        alert(body?.error || "Failed to purge node from registry.");
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner group"><Trash2 className="group-hover:rotate-12 transition-transform" /></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Decommission Position?</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Soft-delete — recoverable.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteId(null)} disabled={deleteBusy} className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl hover:bg-slate-100 transition disabled:opacity-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleteBusy} className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50">
                {deleteBusy ? "…" : "Delete"}
              </button>
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-4xl font-black tracking-tighter text-zinc-900 leading-none uppercase">Position Registry</h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] italic opacity-60">job roles, hierarchies & functional authority</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex-1 lg:flex-none h-16 px-10 bg-zinc-900 text-white rounded-[2rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-zinc-900/10">
              <Plus size={20} strokeWidth={3} /> Add Position
            </button>
          </div>
        </div>

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

        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/20">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
            <input type="text" placeholder="SEARCH BY ROLE, CODE OR DEPARTMENT HUB..."
              className="w-full pl-14 pr-6 py-5 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-[11px] font-black text-zinc-900 uppercase tracking-widest outline-none transition-all shadow-inner"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

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
                            {departments.find(dept => dept.dept_code === (d.department__dept_code || d.department_code))?.dept_name || "Unassigned Node"}
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
