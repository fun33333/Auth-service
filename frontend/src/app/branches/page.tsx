"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import {
  Plus, Search, Edit2, Trash2, X,
  GitBranch, MapPin, Phone, Mail,
  CheckCircle2, XCircle, Users, Building2
} from "lucide-react";

type Branch = {
  id: string;
  code: string;
  name: string;
  institution: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  employees: number;
  is_active: boolean;
  is_head_office: boolean;
};

const MOCK_BRANCHES: Branch[] = [
  { id: "1", code: "BR-001", name: "Head Office – Lahore", institution: "Punjab University", city: "Lahore", address: "Canal Road, Lahore", email: "ho@pu.edu.pk", phone: "+92-42-9231100", employees: 210, is_active: true, is_head_office: true },
  { id: "2", code: "BR-002", name: "Islamabad Campus", institution: "NUST Islamabad", city: "Islamabad", address: "H-12, Islamabad", email: "isb@nust.edu.pk", phone: "+92-51-9085000", employees: 180, is_active: true, is_head_office: false },
  { id: "3", code: "BR-003", name: "Karachi Branch", institution: "City Grammar School", city: "Karachi", address: "DHA Phase 4, Karachi", email: "khi@cgs.edu.pk", phone: "+92-21-3412890", employees: 65, is_active: true, is_head_office: false },
  { id: "4", code: "BR-004", name: "Faisalabad Branch", institution: "Beacon House College", city: "Faisalabad", address: "Jaranwala Road, Faisalabad", email: "fsd@bhcf.edu.pk", phone: "+92-41-8775500", employees: 42, is_active: false, is_head_office: false },
  { id: "5", code: "BR-005", name: "Rawalpindi Campus", institution: "FAST National University", city: "Rawalpindi", address: "Bahria Town, Rawalpindi", email: "rwp@nu.edu.pk", phone: "+92-51-4435678", employees: 98, is_active: true, is_head_office: false },
  { id: "6", code: "BR-006", name: "Multan Office", institution: "Roots International School", city: "Multan", address: "Bosan Road, Multan", email: "mtn@roots.edu.pk", phone: "+92-61-4501234", employees: 33, is_active: true, is_head_office: false },
];

// ── Modal ──────────────────────────────────────────────────────────────────
function BranchModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (d: Partial<Branch>) => void; initial?: Branch | null;
}) {
  const empty = { name: "", code: "", institution: "", city: "", address: "", email: "", phone: "", is_active: true, is_head_office: false };
  const [form, setForm] = useState(initial ? { ...initial } : empty);

  useEffect(() => { setForm(initial ? { ...initial } : empty); }, [initial, open]);

  if (!open) return null;
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{initial ? "Edit Branch" : "Add New Branch"}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Fill in the branch details below.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { label: "Branch Name", key: "name", placeholder: "e.g. Head Office Lahore" },
            { label: "Branch Code", key: "code", placeholder: "e.g. BR-007" },
            { label: "Institution", key: "institution", placeholder: "e.g. Punjab University" },
            { label: "City", key: "city", placeholder: "e.g. Lahore" },
            { label: "Address", key: "address", placeholder: "e.g. Canal Road, Lahore" },
            { label: "Email", key: "email", placeholder: "branch@inst.edu.pk" },
            { label: "Phone", key: "phone", placeholder: "+92-XX-XXXXXXX" },
          ] as { label: string; key: keyof typeof form; placeholder: string }[]).map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input type="text" placeholder={placeholder} value={String(form[key])} onChange={f(key)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
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
          <div className="sm:col-span-2 flex items-center gap-3">
            <input type="checkbox" id="headOffice" checked={!!form.is_head_office}
              onChange={e => setForm(p => ({ ...p, is_head_office: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="headOffice" className="text-sm font-medium text-slate-700">Mark as Head Office</label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition active:scale-95">
            {initial ? "Save Changes" : "Add Branch"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => { setBranches(MOCK_BRANCHES); setLoading(false); }, 700);
  }, []);

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.institution.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Branches", value: branches.length, icon: GitBranch, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active", value: branches.filter(b => b.is_active).length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Inactive", value: branches.filter(b => !b.is_active).length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Total Staff", value: branches.reduce((s, b) => s + b.employees, 0), icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  function handleSave(data: Partial<Branch>) {
    if (editTarget) {
      setBranches(prev => prev.map(b => b.id === editTarget.id ? { ...b, ...data } : b));
    } else {
      setBranches(prev => [{ id: String(Date.now()), employees: 0, ...data } as Branch, ...prev]);
    }
    setEditTarget(null);
  }

  return (
    <ProtectedLayout>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4"><Trash2 className="text-red-600 h-6 w-6" /></div>
            <h3 className="text-center text-lg font-semibold text-slate-900">Delete Branch?</h3>
            <p className="text-center text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button onClick={() => { setBranches(prev => prev.filter(b => b.id !== deleteId)); setDeleteId(null); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      <BranchModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Branches</h1>
            <p className="mt-1 text-slate-500">Manage all branch offices across institutions.</p>
          </div>
          <button id="add-branch-btn" onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_10px_rgba(79,70,229,0.25)] hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
            <Plus className="-ml-1 mr-2 h-5 w-5" /> Add Branch
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="relative group overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {loading ? <div className="animate-pulse h-16 bg-slate-100 rounded-xl" /> : <>
                  <div className={`inline-flex p-3 rounded-xl ${s.bg} group-hover:scale-110 transition-transform mb-3`}><Icon className={`h-6 w-6 ${s.color}`} /></div>
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-0.5">{s.value}</p>
                </>}
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input id="branch-search" type="text" placeholder="Search branch, city, institution..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  {["Branch", "Institution", "Location", "Contact", "Staff", "Status", ""].map(col => (
                    <th key={col} className="py-4 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-6 last:pr-6">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((__, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}</tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center">
                    <GitBranch className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No branches found.</p>
                  </td></tr>
                ) : filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="whitespace-nowrap py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">{b.name.charAt(0)}</div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                            {b.name}
                            {b.is_head_office && <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded">HQ</span>}
                          </div>
                          <div className="text-xs font-mono text-slate-400">{b.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700"><Building2 className="h-3.5 w-3.5 text-slate-400" />{b.institution}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700"><MapPin className="h-3.5 w-3.5 text-slate-400" />{b.city}</div>
                      <div className="text-xs text-slate-400 mt-0.5 pl-5">{b.address}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" />{b.email}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5"><Phone className="h-3 w-3" />{b.phone}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800"><Users className="h-4 w-4 text-slate-400" />{b.employees}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${b.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${b.is_active ? "bg-green-500" : "bg-red-500"}`} />
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditTarget(b); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(b.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{branches.length}</span> branches</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
