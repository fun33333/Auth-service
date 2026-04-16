"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import InstitutionCard from "@/components/InstitutionCard";
import { fetchWithAuth } from "@/utils/api";
import {
  Plus, Search, ArrowLeft,
  X, GitBranch, MapPin, Phone, Mail,
  Edit2, Trash2, Building2
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

type Institution = {
  id: string;
  inst_id: string;
  inst_code: string;
  name: string;
  inst_type: string;
  address: string;
  city: string;
  contact_number: string;
  organization_code?: string;
  legacy_campus_id?: string;
};

type Organization = {
  id: string;
  name: string;
  org_code: string;
};

type Branch = {
  branch_id: string;
  branch_code: string;
  branch_name: string;
  institution_code: string;
  status: string;
  address: string;
  city: string;
  contact_number: string;
  email: string;
  branch_head_name: string;
};

// ── Skeleton (Small helper) ────────────────────────────────────────────────

const Skeleton = ({ className, height, width }: any) => (
  <div className={`animate-pulse bg-zinc-100 rounded-xl ${className}`} style={{ height, width }} />
);

// ── Modals ──────────────────────────────────────────────────────────────────

function InstitutionModal({ open, onClose, onSave, initial, organizations }: {
  open: boolean; onClose: () => void;
  onSave: (d: any) => void; initial?: Institution | null;
  organizations: Organization[];
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    inst_code: initial?.inst_code ?? '',
    inst_type: initial?.inst_type ?? 'educational',
    organization_code: initial?.organization_code ?? '',
    legacy_campus_id: initial?.legacy_campus_id ?? '',
    city: initial?.city ?? '',
    address: initial?.address ?? '',
    contact_number: initial?.contact_number ?? '',
  });

  useEffect(() => {
    setForm({
      name: initial?.name ?? '',
      inst_code: initial?.inst_code ?? '',
      inst_type: initial?.inst_type ?? 'educational',
      organization_code: initial?.organization_code ?? (organizations[0]?.org_code || ''),
      legacy_campus_id: initial?.legacy_campus_id ?? '',
      city: initial?.city ?? '',
      address: initial?.address ?? '',
      contact_number: initial?.contact_number ?? '',
    });
  }, [initial, open, organizations]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border border-zinc-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-10 py-8 border-b border-zinc-50">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">{initial ? "Edit Entity" : "Register Entity"}</h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1 italic">Registry Profile Management</p>
          </div>
          <button onClick={onClose} className="p-3 text-zinc-400 hover:text-zinc-900 rounded-2xl hover:bg-zinc-50 transition-all"><X size={24} /></button>
        </div>
        <div className="px-10 py-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Institution Name</label>
            <input type="text" placeholder="e.g. Al-Khidmat Foundation" value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))}
              className="w-full px-6 py-4 bg-zinc-50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Registry Code</label>
            <input type="text" placeholder="AKS-01" value={form.inst_code} onChange={e => setForm(p=>({...p, inst_code: e.target.value}))}
              className="w-full px-6 py-4 bg-zinc-50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Entity Type</label>
            <select value={form.inst_type} onChange={e => setForm(p=>({...p, inst_type: e.target.value}))}
              className="w-full px-6 py-4 bg-zinc-50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all">
              <option value="educational">Educational</option>
              <option value="healthcare">Healthcare</option>
              <option value="social_welfare">Social Welfare</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Parent Organization</label>
            <select value={form.organization_code} onChange={e => setForm(p=>({...p, organization_code: e.target.value}))}
              className="w-full px-6 py-4 bg-zinc-50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all">
              {organizations.map(org => (
                <option key={org.id} value={org.org_code}>{org.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 pt-6 border-t border-zinc-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all">Cancel</button>
            <button onClick={() => onSave(form)} className="px-10 py-5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-2xl">
              {initial ? "Confirm Update" : "Establish Registry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchModal({ open, onClose, onSave, initial, institutionCode }: {
  open: boolean; onClose: () => void;
  onSave: (d: any) => void; initial?: Branch | null; institutionCode: string;
}) {
  const [form, setForm] = useState({
    branch_name: initial?.branch_name ?? '',
    branch_code: initial?.branch_code ?? '',
    city: initial?.city ?? '',
    address: initial?.address ?? '',
    email: initial?.email ?? '',
    contact_number: initial?.contact_number ?? '',
    branch_head_name: initial?.branch_head_name ?? '',
    status: initial?.status ?? 'active',
  });

  useEffect(() => {
    setForm({
      branch_name: initial?.branch_name ?? '',
      branch_code: initial?.branch_code ?? '',
      city: initial?.city ?? '',
      address: initial?.address ?? '',
      email: initial?.email ?? '',
      contact_number: initial?.contact_number ?? '',
      branch_head_name: initial?.branch_head_name ?? '',
      status: initial?.status ?? 'active',
    });
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl border border-zinc-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-10 py-8 border-b border-zinc-50">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">{initial ? "Modify Deployment" : "Deploy Branch"}</h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1 italic">Tactical Location Management</p>
          </div>
          <button onClick={onClose} className="p-3 text-zinc-400 hover:text-zinc-900 rounded-2xl hover:bg-zinc-50 transition-all"><X size={24} /></button>
        </div>
        <div className="px-10 py-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Branch Name</label>
            <input type="text" placeholder="e.g. Sector-01 HQ" value={form.branch_name} onChange={e => setForm(p=>({...p, branch_name: e.target.value}))}
              className="w-full px-6 py-4 bg-zinc-50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Station Code</label>
            <input type="text" placeholder="BR-01" value={form.branch_code} onChange={e => setForm(p=>({...p, branch_code: e.target.value}))}
              className="w-full px-6 py-4 bg-zinc-50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all" />
          </div>
           <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Operational Status</label>
            <select value={form.status} onChange={e => setForm(p=>({...p, status: e.target.value}))}
              className="w-full px-6 py-4 bg-zinc-50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-span-2 pt-6 border-t border-zinc-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all">Cancel</button>
            <button onClick={() => onSave({ ...form, institution_code: institutionCode })} 
              className="px-10 py-5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-2xl">
              {initial ? "Confirm Update" : "Initialize Deployment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [view, setView] = useState<"list" | "branches">("list");
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
  const [instModal, setInstModal] = useState(false);
  const [editInstTarget, setEditInstTarget] = useState<Institution | null>(null);
  const [branchModal, setBranchModal] = useState(false);
  const [editBranchTarget, setEditBranchTarget] = useState<Branch | null>(null);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [instRes, orgRes] = await Promise.all([
        fetchWithAuth("/institutions"),
        fetchWithAuth("/organizations")
      ]);
      
      if (instRes.ok) {
        const data = await instRes.json();
        setInstitutions(Array.isArray(data) ? data : (data.institutions || []));
      }
      
      if (orgRes.ok) {
        const data = await orgRes.json();
        setOrganizations(Array.isArray(data) ? data : (data.organizations || []));
      }
    } catch (err) {
      console.error("Initial load failed:", err);
      setInstitutions([]);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadInstitutions() {
    try {
      const res = await fetchWithAuth("/institutions");
      if (res.ok) {
        const data = await res.json();
        setInstitutions(Array.isArray(data) ? data : (data.institutions || []));
      }
    } catch (err) {
      console.error("Reload failed:", err);
    }
  }

  async function loadBranches(instCode: string) {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/branches?institution_code=${instCode}`);
      if (res.ok) setBranches(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadInitialData(); }, []);

  async function handleSaveInstitution(data: any) {
    const url = editInstTarget ? `/institutions/${editInstTarget.id}` : "/institutions";
    const method = editInstTarget ? "PUT" : "POST";
    const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
    if (res.ok) {
      setInstModal(false);
      setEditInstTarget(null);
      loadInstitutions();
    }
  }

  async function handleDeleteInstitution(id: string) {
    if (!confirm("Remove this entity?")) return;
    const res = await fetchWithAuth(`/institutions/${id}`, { method: "DELETE" });
    if (res.ok) loadInstitutions();
  }

  async function handleSaveBranch(data: any) {
    const url = editBranchTarget ? `/branches/${editBranchTarget.branch_id}` : "/branches";
    const method = editBranchTarget ? "PUT" : "POST";
    const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
    if (res.ok) {
      setBranchModal(false);
      setEditBranchTarget(null);
      if (selectedInst) loadBranches(selectedInst.inst_code);
    }
  }

  async function handleDeleteBranch(id: string) {
    if (!confirm("Dissolve this branch?")) return;
    const res = await fetchWithAuth(`/branches/${id}`, { method: "DELETE" });
    if (res.ok && selectedInst) loadBranches(selectedInst.inst_code);
  }

  const filtered = institutions.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.inst_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedLayout>
      <InstitutionModal 
        open={instModal} 
        onClose={() => { setInstModal(false); setEditInstTarget(null); }} 
        onSave={handleSaveInstitution} 
        initial={editInstTarget}
        organizations={organizations}
      />
      {selectedInst && (
        <BranchModal 
          open={branchModal} 
          onClose={() => { setBranchModal(false); setEditBranchTarget(null); }} 
          onSave={handleSaveBranch} 
          initial={editBranchTarget} 
          institutionCode={selectedInst.inst_code} 
        />
      )}

      <div className="p-3 sm:p-4 lg:p-6 max-w-350 mx-auto space-y-6 animate-in fade-in duration-1000">
        
        {view === "list" && (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-zinc-100 pb-5 sm:pb-6">
              <div className="space-y-1.5 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-zinc-900 leading-none lowercase">institutions registry</h1>
                <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] italic opacity-60">centralized entity management & control</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                 <button onClick={() => { setEditInstTarget(null); setInstModal(true); }}
                   className="flex-1 lg:flex-none h-10 sm:h-11 px-6 bg-zinc-900 text-white rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-zinc-900/10 active:scale-95"
                 >
                   <Plus size={14} strokeWidth={3} /> Add Institution
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-3 right-3 p-2.5 rounded-lg bg-zinc-900 text-white group-hover:scale-105 transition-transform">
                  <Building2 size={16} strokeWidth={2.5} />
                </div>
                <div className="relative z-10">
                  <p className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Entities</p>
                  {loading ? <Skeleton width="40%" height={24} /> : (
                    <div className="flex items-baseline gap-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tighter leading-none">{institutions.length}</h3>
                      <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-3 right-3 p-2.5 rounded-lg bg-blue-600 text-white group-hover:scale-105 transition-transform">
                  <GitBranch size={16} strokeWidth={2.5} />
                </div>
                <div className="relative z-10">
                  <p className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Global Deployments</p>
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tighter leading-none">...</h3>
                    <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-100 shadow-md shadow-zinc-200/20 flex flex-col xl:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                <input
                  type="text"
                  placeholder="search central registry..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-zinc-50/50 border border-transparent focus:border-zinc-200 focus:bg-white rounded-xl text-[10px] font-black text-zinc-900 uppercase tracking-widest outline-none transition-all placeholder:text-zinc-400 placeholder:normal-case shadow-inner"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="relative pb-20">
              {loading && filtered.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} height={200} className="rounded-3xl" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200 shadow-lg shadow-zinc-200/20 flex flex-col items-center justify-center">
                  <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4"><Building2 size={32} /></div>
                  <h4 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">No Entities Matches</h4>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filtered.map(inst => (
                    <InstitutionCard key={inst.id} institution={inst} 
                      onEdit={setEditInstTarget} onDelete={handleDeleteInstitution} 
                      onViewBranches={(i) => { setSelectedInst(i); setView("branches"); loadBranches(i.inst_code); }} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {view === "branches" && selectedInst && (
          <div className="space-y-8 animate-in slide-in-from-right-12 duration-700">
              <button onClick={() => setView("list")} 
                className="flex items-center gap-3 text-zinc-400 hover:text-zinc-900 font-black tracking-widest uppercase text-[10px] transition-all group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Return to Registry Index
              </button>

              <div className="bg-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Building2 size={160} strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-xl">
                        <Building2 size={32} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                       <div className="flex flex-wrap items-center gap-3">
                          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none">{selectedInst.name}</h1>
                       </div>
                       <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{selectedInst.inst_code} | {selectedInst.city}</p>
                    </div>
                  </div>
                  <button onClick={() => { setEditBranchTarget(null); setBranchModal(true); }}
                    className="w-full xl:w-auto h-12 px-8 bg-white text-zinc-900 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl"
                  >
                    <Plus size={16} strokeWidth={3} /> Deploy Branch
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                  [1, 2].map(i => <Skeleton key={i} height={180} className="rounded-3xl" />)
                ) : branches.length === 0 ? (
                  <div className="lg:col-span-2 py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200 shadow-lg shadow-zinc-200/20 flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-5"><GitBranch size={32} /></div>
                    <h4 className="text-lg font-black text-zinc-900 uppercase tracking-tighter">No Deployment Branches</h4>
                  </div>
                ) : (
                  branches.map(b => (
                    <div key={b.branch_id} className="bg-white rounded-4xl p-6 border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-300/30 transition-all group relative overflow-hidden flex flex-col">
                      <div className="flex items-start justify-between relative z-10 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-colors">
                            <GitBranch size={20} className="shrink-0" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-zinc-900 group-hover:text-blue-600 transition-colors tracking-tight uppercase leading-none line-clamp-1">{b.branch_name}</h3>
                            <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">{b.branch_code}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditBranchTarget(b); setBranchModal(true); }} className="h-8 w-8 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-lg hover:bg-zinc-900 hover:text-white transition-all active:scale-95 border border-zinc-200 hover:border-zinc-900">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteBranch(b.branch_id)} className="h-8 w-8 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-lg hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-zinc-200 hover:border-rose-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6 pt-5 border-t border-zinc-50 flex-1">
                         <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100/50 flex flex-col justify-center">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Station City</p>
                            <p className="text-[11px] font-black text-zinc-900 uppercase truncate">{b.city || 'Central'}</p>
                         </div>
                         <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100/50 flex flex-col justify-center">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Station Head</p>
                            <p className="text-[11px] font-black text-blue-600 uppercase truncate">{b.branch_head_name || 'Unassigned'}</p>
                         </div>
                      </div>
                      
                      <div className="pt-5 border-t border-zinc-50 flex items-center justify-between gap-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-auto">
                        <span className="flex items-center gap-2"><Mail size={10} className="opacity-40" /><span className="lowercase font-black tracking-normal">{b.email || '—'}</span></span>
                        <span className={`px-2 py-0.5 rounded-md border ${b.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                          {b.status} unit
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
