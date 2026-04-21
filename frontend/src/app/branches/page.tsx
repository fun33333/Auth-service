"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import {
  Plus, Search, Edit2, Trash2, X,
  GitBranch, MapPin, CheckCircle2, XCircle, Building2, Phone, Mail, Globe
} from "lucide-react";

type Branch = {
  id?: string;
  branch_id: string;
  branch_code: string;
  branch_name: string;
  institution_code: string;
  status: string;
  address?: string;
  city?: string;
  contact_number?: string;
  email?: string;
  branch_head_name?: string;
};

type Institution = {
  inst_code: string;
  name: string;
};

const Skeleton = ({ className, height, width }: any) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} style={{ height, width }} />
);

function BranchModal({ open, onClose, onSave, initial, institutions }: {
  open: boolean; onClose: () => void;
  onSave: (d: any) => void; initial?: Branch | null;
  institutions: Institution[];
}) {
  const empty = { 
    branch_name: "", branch_code: "", institution_code: "", 
    city: "", address: "", email: "", contact_number: "", 
    status: "active", branch_head_name: "" 
  };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (initial) {
      setForm({
        branch_name: initial.branch_name || "",
        branch_code: initial.branch_code || "",
        institution_code: initial.institution_code || "",
        city: initial.city || "",
        address: initial.address || "",
        email: initial.email || "",
        contact_number: initial.contact_number || "",
        status: initial.status || "active",
        branch_head_name: initial.branch_head_name || "",
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  if (!open) return null;

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-200 overflow-hidden border border-zinc-100">
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-50">
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tighter uppercase">{initial ? "Update Branch" : "Establish New Unit"}</h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Physical Hub & Operational Registry</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-300 hover:text-zinc-900 rounded-lg transition"><X size={24} /></button>
        </div>
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Branch Full Name</label>
            <input type="text" placeholder="e.g. Lahore Central Campus" value={form.branch_name} onChange={f('branch_name')}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Registry Code</label>
            <input type="text" placeholder="e.g. LHR-01" value={form.branch_code} onChange={f('branch_code')}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Parent Institution</label>
            <select value={form.institution_code} onChange={f('institution_code')}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all appearance-none">
              <option value="">Select Institution</option>
              {institutions.map(inst => (
                <option key={inst.inst_code} value={inst.inst_code}>{inst.name} [{inst.inst_code}]</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Operational Status</label>
            <select value={form.status} onChange={f('status')}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all appearance-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Base City</label>
            <input type="text" placeholder="e.g. Lahore" value={form.city} onChange={f('city')}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Physical Address</label>
            <input type="text" placeholder="Full street address..." value={form.address} onChange={f('address')}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all" />
          </div>
          <div className="sm:col-span-2 grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Branch Head</label>
              <input type="text" placeholder="e.g. Dr. Ali" value={form.branch_head_name} onChange={f('branch_head_name')}
                className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Contact Phone</label>
              <input type="text" placeholder="+92..." value={form.contact_number} onChange={f('contact_number')}
                className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-[11px] font-black uppercase tracking-widest outline-none transition-all" />
            </div>
          </div>
        </div>
        <div className="px-8 py-6 border-t border-zinc-50 flex justify-end gap-3 bg-zinc-50/30">
          <button onClick={onClose} className="px-6 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="px-10 py-3.5 bg-zinc-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all active:scale-95">
            {initial ? "Confirm Changes" : "Deploy Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [branchRes, instRes] = await Promise.all([
        fetchWithAuth('/employees/branches'),
        fetchWithAuth('/employees/institutions')
      ]);
      
      if (branchRes.ok) {
        const data = await branchRes.json();
        setBranches(Array.isArray(data) ? data : (data.branches || []));
      }
      if (instRes.ok) {
        const data = await instRes.json();
        setInstitutions(Array.isArray(data) ? data : (data.institutions || []));
      }
    } catch (err) {
      console.error("Failed to load registry:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = branches.filter(b =>
    b.branch_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.branch_code?.toLowerCase().includes(search.toLowerCase()) ||
    b.city?.toLowerCase().includes(search.toLowerCase()) ||
    b.institution_code?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Branches", value: branches.length, icon: GitBranch, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active Nodes", value: branches.filter(b => b.status === "active").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Offline Units", value: branches.filter(b => b.status !== "active").length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Strategiv Base", value: new Set(branches.map(b => b.city)).size, icon: Globe, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  async function handleSave(data: any) {
    try {
      const url = editTarget ? `/employees/branches/${editTarget.branch_id}` : '/employees/branches';
      const method = editTarget ? 'PUT' : 'POST';
      const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
      if (res.ok) loadData();
      else alert("Operation failed. Ensure all registry details are correct.");
    } catch (err) {
      console.error("Registry update failed:", err);
    }
    setEditTarget(null);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetchWithAuth(`/employees/branches/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
      else alert("Decommissioning failed.");
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleteId(null);
  }

  return (
    <ProtectedLayout>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm mx-4 p-8 animate-in zoom-in-95 duration-200 text-center border border-zinc-100">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner"><Trash2 size={24} /></div>
            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Decommission Unit?</h3>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 px-4 leading-relaxed">This branch will be permanently removed from the operational registry.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 rounded-xl hover:bg-zinc-100 transition">Standby</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-3 text-[10px] font-black text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition shadow-xl shadow-rose-200">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <BranchModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} institutions={institutions} />

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
             <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Operational Branches</h1>
             <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em] italic opacity-60">Physical Deployment & Station Registry</p>
          </div>
          <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="h-16 px-10 bg-zinc-900 text-white rounded-[2rem] flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-zinc-900/10">
            <Plus size={20} strokeWidth={3} /> Initialize Unit
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                <div className={`absolute top-6 right-6 p-4 rounded-2xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}><Icon size={24} strokeWidth={2.5} /></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                  {loading ? <Skeleton width="40%" height={32} /> : (
                    <div className="flex items-baseline gap-2">
                       <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tighter leading-none">{s.value}</h3>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter opacity-60">HUB</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/20">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <input type="text" placeholder="FILTER BY UNIT NAME, REGISTRY CODE OR CITY BASE..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-[11px] font-black text-zinc-900 uppercase tracking-widest outline-none transition-all shadow-inner" />
           </div>
        </div>

        {/* Table */}
        <div className="relative pb-20">
          <div className="bg-white rounded-[3rem] border border-zinc-100 overflow-hidden shadow-2xl shadow-zinc-200/20">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-50/50 text-left">
                   <thead>
                      <tr className="bg-zinc-50/30">
                         <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Operational Unit</th>
                         <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Deployment</th>
                         <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Contact Node</th>
                         <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                         <th className="py-8 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-50/50">
                      {loading ? [...Array(4)].map((_, i) => (
                        <tr key={i}><td colSpan={5} className="p-8"><Skeleton height={24} className="w-full rounded-full" /></td></tr>
                      )) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="py-24 text-center">
                           <XCircle size={40} className="mx-auto text-zinc-100 mb-6" />
                           <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.4em]">No units found in the current registry.</p>
                        </td></tr>
                      ) : filtered.map(b => (
                        <tr key={b.branch_id} className="hover:bg-zinc-50/40 transition-all group">
                           <td className="p-8">
                              <div className="flex items-center gap-5">
                                 <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-sm font-black transition-transform group-hover:scale-110 shadow-lg shadow-zinc-900/10 uppercase">
                                    {b.branch_name?.charAt(0)}
                                 </div>
                                 <div>
                                    <h5 className="text-[13px] font-black text-zinc-900 uppercase tracking-tight leading-tight">{b.branch_name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{b.branch_code}</span>
                                       <span className="h-1 w-1 rounded-full bg-zinc-200" />
                                       <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{b.institution_code}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-2 text-zinc-900">
                                    <MapPin size={12} className="text-rose-400" />
                                    <span className="text-[11px] font-black uppercase tracking-tight">{b.city || 'Central Base'}</span>
                                 </div>
                                 <p className="text-[9px] font-bold text-zinc-400 uppercase truncate max-w-[150px] ml-5">{b.address}</p>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="space-y-1.5">
                                 <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400"><Phone size={10} /></div>
                                    <span className="text-[10px] font-black text-zinc-700">{b.contact_number || '--'}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400"><Mail size={10} /></div>
                                    <span className="text-[10px] font-black text-zinc-700 lowercase">{b.email || 'no-email@registry.pk'}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-8">
                              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${b.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                                 <span className={`h-1.5 w-1.5 rounded-full ${b.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                 {b.status}
                              </span>
                           </td>
                           <td className="p-8 text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                 <button onClick={() => { setEditTarget(b); setModalOpen(true); }} className="h-11 w-11 flex items-center justify-center bg-white text-zinc-400 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm border border-zinc-100">
                                    <Edit2 size={15} />
                                 </button>
                                 <button onClick={() => setDeleteId(b.branch_id)} className="h-11 w-11 flex items-center justify-center bg-white text-zinc-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-zinc-100">
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
