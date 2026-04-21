"use client";

/**
 * STRATEGIC INSTITUTIONS REGISTRY (UNIFIED)
 * --------------------------------------------------------------------------
 * Consolidated module for Institutions and Branch Deployment.
 * This version incorporates the full standalone branch logic, stats, and 
 * metadata fields into a unified operational hub.
 * --------------------------------------------------------------------------
 */

import React, { useState, useEffect } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { 
  Building2, Plus, Search, MapPin, GitBranch, ArrowLeft, 
  X, Shield, Activity, Globe, Edit2, Trash2, ArrowRight,
  Database, UserCheck, Phone, Mail, CheckCircle2, XCircle
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import { Suspense } from "react";

// ==========================================================================
// 1. TYPES & INTERFACES
// ==========================================================================

type Organization = {
  id: string;
  name: string;
  org_code: string;
};

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
  branch_head_name?: string;
};

// ==========================================================================
// 2. SHARED UI FRAGMENTS
// ==========================================================================

function Skeleton({ className, width, height }: { className?: string; width?: string | number; height?: string | number }) {
  return <div className={`animate-pulse bg-zinc-100 rounded-md ${className}`} style={{ width, height }} />;
}

/**
 * EntityCard - High-density card for Institution Index
 */
function EntityCard({ 
  institution, 
  branchCount = 0,
  onEdit, 
  onDelete, 
  onViewBranches 
}: {
  institution: Institution;
  branchCount?: number;
  onEdit: (inst: Institution) => void;
  onDelete: (id: string) => void;
  onViewBranches: (inst: Institution) => void;
}) {
  return (
    <div className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-[#BDA6CE]/20 transition-all duration-500 relative flex flex-col hover:-translate-y-1 p-1">
      <div className="bg-zinc-50/50 rounded-[1.3rem] p-4 flex-1 flex flex-col group-hover:bg-white transition-colors duration-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg group-hover:bg-[#BDA6CE] transition-all shrink-0">
               <Building2 size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[8px] font-black text-[#BDA6CE] uppercase tracking-widest">{institution.inst_code}</span>
                <span className="h-0.5 w-0.5 rounded-full bg-zinc-200" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">operational</span>
              </div>
              <h3 className="text-[13px] font-black text-zinc-900 tracking-tight group-hover:text-[#BDA6CE] transition-colors uppercase leading-tight truncate max-w-[150px]">
                {institution.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <button onClick={() => onEdit(institution)} className="h-7 w-7 flex items-center justify-center bg-white text-zinc-400 rounded-lg hover:bg-zinc-900 hover:text-white transition-all active:scale-95 border border-zinc-100 shadow-sm">
              <Edit2 size={10} strokeWidth={2.5} />
            </button>
            <button onClick={() => onDelete(institution.id)} className="h-7 w-7 flex items-center justify-center bg-white text-zinc-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-zinc-100 shadow-sm">
              <Trash2 size={10} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-zinc-100">
           <div className="space-y-0.5">
              <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest leading-none">Sector</p>
              <div className="flex items-center gap-1.5 pt-1">
                <Shield size={8} className="text-[#BDA6CE]" />
                <p className="text-[9px] font-black text-zinc-900 uppercase truncate">{institution.inst_type || 'Educational'}</p>
              </div>
           </div>
           <div className="space-y-0.5">
              <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest leading-none">Base</p>
              <div className="flex items-center gap-1.5 pt-1">
                <MapPin size={8} className="text-zinc-400" />
                <p className="text-[9px] font-black text-zinc-900 uppercase truncate">{institution.city || 'Central'}</p>
              </div>
           </div>
        </div>

        <div className="mt-auto pt-2">
          <button 
            onClick={() => onViewBranches(institution)}
            className="w-full bg-zinc-900 text-white rounded-xl py-2.5 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#BDA6CE] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10 group/btn"
          >
            <GitBranch size={15} strokeWidth={2.5} /> 
            Deployment Registry
            <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-md text-[8px]">{branchCount}</span>
            <ArrowRight size={12} className="ml-auto opacity-40 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 3. MODAL SYSTEMS
// ==========================================================================

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
    city: initial?.city ?? '',
    address: initial?.address ?? '',
    contact_number: initial?.contact_number ?? '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        inst_code: initial?.inst_code ?? '',
        inst_type: initial?.inst_type ?? 'educational',
        organization_code: initial?.organization_code ?? (organizations[0]?.org_code || ''),
        city: initial?.city ?? '',
        address: initial?.address ?? '',
        contact_number: initial?.contact_number ?? '',
      });
    }
  }, [initial, open, organizations]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl border border-zinc-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tighter uppercase">{initial ? 'Update Entity' : 'Establish Registry'}</h2>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Core Institutional Record</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-300 hover:text-zinc-900 transition-all"><X size={20} /></button>
        </div>
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Entity Full Name</label>
            <input type="text" placeholder="e.g. Al-Khidmat Foundation" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Code</label>
            <input type="text" placeholder="AKS-01" value={form.inst_code} onChange={e => setForm(p => ({ ...p, inst_code: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Classification</label>
            <select value={form.inst_type} onChange={e => setForm(p => ({ ...p, inst_type: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all appearance-none">
              <option value="educational">Educational</option>
              <option value="healthcare">Healthcare</option>
              <option value="social_welfare">Social Welfare</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Parent Command</label>
            <select value={form.organization_code} onChange={e => setForm(p => ({ ...p, organization_code: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all appearance-none">
              {organizations.map(org => <option key={org.id} value={org.org_code}>{org.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 pt-6 flex justify-end gap-2">
            <button onClick={onClose} className="px-6 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Cancel</button>
            <button onClick={() => onSave(form)} className="px-8 py-3.5 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#BDA6CE] transition-all active:scale-95 shadow-xl">
              {initial ? 'Finalize Changes' : 'Execute Registration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchModal({ open, onClose, onSave, initial, institutionCode }: {
  open: boolean; onClose: () => void;
  onSave: (d: any) => void; initial?: Branch | null;
  institutionCode: string;
}) {
  const [form, setForm] = useState({
    branch_name: initial?.branch_name ?? '',
    branch_code: initial?.branch_code ?? '',
    institution_code: institutionCode,
    status: initial?.status ?? 'active',
    city: initial?.city ?? '',
    address: initial?.address ?? '',
    contact_number: initial?.contact_number ?? '',
    email: initial?.email ?? '',
    branch_head_name: initial?.branch_head_name ?? '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        branch_name: initial?.branch_name ?? '',
        branch_code: initial?.branch_code ?? '',
        institution_code: institutionCode,
        status: initial?.status ?? 'active',
        city: initial?.city ?? '',
        address: initial?.address ?? '',
        contact_number: initial?.contact_number ?? '',
        email: initial?.email ?? '',
        branch_head_name: initial?.branch_head_name ?? '',
      });
    }
  }, [initial, open, institutionCode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl border border-zinc-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tighter uppercase">{initial ? 'Update Station' : 'Deploy Operational Unit'}</h2>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Full Deployment Registry</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-300 hover:text-zinc-900 transition-all"><X size={20} /></button>
        </div>
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Unit Display Name</label>
            <input type="text" placeholder="e.g. Area Command Hub" value={form.branch_name} onChange={e => setForm(p => ({ ...p, branch_name: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Unit Code</label>
            <input type="text" placeholder="UNIT-ISL-01" value={form.branch_code} onChange={e => setForm(p => ({ ...p, branch_code: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Deployment Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all appearance-none">
              <option value="active">Active</option>
              <option value="standby">Standby</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Branch Head / CO</label>
            <input type="text" placeholder="e.g. Dr. Salman Khan" value={form.branch_head_name} onChange={e => setForm(p => ({ ...p, branch_head_name: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Contact Phone</label>
            <input type="text" placeholder="+92-XXX-XXXXXXX" value={form.contact_number} onChange={e => setForm(p => ({ ...p, contact_number: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Deployment Email</label>
            <input type="text" placeholder="unit@inst.pk" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] lowercase font-black outline-none transition-all" />
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Station City</label>
            <input type="text" placeholder="e.g. Islamabad" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal" />
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Full Physical Address</label>
            <input type="text" placeholder="Plot 123, Sector G-10..." value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className="w-full px-5 py-3.5 bg-zinc-50 border border-transparent focus:border-[#BDA6CE] focus:bg-white rounded-xl text-[10px] uppercase font-black tracking-widest outline-none transition-all placeholder:normal-case placeholder:font-normal" />
          </div>
          <div className="col-span-2 pt-6 flex justify-end gap-2">
            <button onClick={onClose} className="px-6 py-3 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Cancel</button>
            <button onClick={() => onSave(form)} className="px-8 py-3.5 bg-zinc-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#BDA6CE] transition-all active:scale-95 shadow-xl">
              {initial ? 'Apply Command' : 'Initialize Deployment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// 4. MAIN REGISTRY COMPONENT
// ==========================================================================

function InstitutionsPage() {
  const [view, setView] = useState<"list" | "branches">("list");
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
  
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [totalUnits, setTotalUnits] = useState(0);
  const [reachCities, setReachCities] = useState(0);

  const [instModal, setInstModal] = useState(false);
  const [branchModal, setBranchModal] = useState(false);
  const [editInst, setEditInst] = useState<Institution | null>(null);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [instRes, orgRes, branchRes] = await Promise.all([
        fetchWithAuth("/employees/institutions"),
        fetchWithAuth("/employees/organizations"),
        fetchWithAuth("/employees/branches")
      ]);

      if (instRes.ok) {
        const data = await instRes.json();
        const list = Array.isArray(data) ? data : (data.institutions || []);
        setInstitutions(list);
        setReachCities(new Set(list.map((i: any) => i.city).filter(Boolean)).size);
      }

      if (orgRes.ok) {
        const data = await orgRes.json();
        setOrganizations(Array.isArray(data) ? data : (data.organizations || []));
      }

      if (branchRes.ok) {
        const data = await branchRes.json();
        const list = Array.isArray(data) ? data : (data.branches || []);
        setBranches(list);
        setTotalUnits(list.length);
      }
    } catch (err) {
      console.error("Registry load failure:", err);
    } finally {
      setLoading(false);
    }
  }

  const searchParams = useSearchParams();

  useEffect(() => {
    const v = searchParams.get("view");
    if (v === "branches") {
      setView("branches");
      setSelectedInst(null); // Show all branches
    }
  }, [searchParams]);

  useEffect(() => { loadInitialData(); }, []);

  async function handleInstitutionSave(data: any) {
    const method = editInst ? "PUT" : "POST";
    const url = editInst ? `/employees/institutions/${editInst.id}` : "/employees/institutions";
    const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
    if (res.ok) { setInstModal(false); await loadInitialData(); }
  }

  async function handleBranchSave(data: any) {
    const method = editBranch ? "PUT" : "POST";
    const url = editBranch ? `/employees/branches/${editBranch.branch_id}` : "/employees/branches";
    const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
    if (res.ok) { setBranchModal(false); await loadInitialData(); }
  }

  async function deleteEntity(id: string) {
    if (!confirm("Confirm dissolution?")) return;
    const res = await fetchWithAuth(`/employees/institutions/${id}`, { method: "DELETE" });
    if (res.ok) await loadInitialData();
  }

  async function deleteUnit(id: string) {
    if (!confirm("Confirm decommissioning?")) return;
    const res = await fetchWithAuth(`/employees/branches/${id}`, { method: "DELETE" });
    if (res.ok) await loadInitialData();
  }

  const filtered = institutions.filter(inst => 
    inst.name.toLowerCase().includes(search.toLowerCase()) || 
    inst.inst_code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedBranches = branches.filter(b => b.institution_code === selectedInst?.inst_code);
  const activeUnits = selectedBranches.filter(b => b.status === "active").length;
  const offlineUnits = selectedBranches.filter(b => b.status === "offline").length;

  return (
    <ProtectedLayout>
      <InstitutionModal open={instModal} onClose={() => setInstModal(false)} onSave={handleInstitutionSave} initial={editInst} organizations={organizations} />
      <BranchModal open={branchModal} onClose={() => setBranchModal(false)} onSave={handleBranchSave} initial={editBranch} institutionCode={selectedInst?.inst_code || ''} />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-[#BDA6CE]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
        {view === "list" ? (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-8 bg-[#BDA6CE] rounded-full" />
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Institutional Assets</p>
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tighter  leading-none">Institutions</h1>
              </div>

              <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                <div className="flex-1 lg:w-96 relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-[#BDA6CE] transition-colors" />
                  <input type="text" placeholder="FILTER REGISTRY..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-zinc-100 focus:border-[#BDA6CE]/40 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-sm" />
                </div>
                <button onClick={() => { setEditInst(null); setInstModal(true); }} className="h-14 px-8 bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#BDA6CE] transition-all shadow-xl active:scale-95">
                  <Plus size={16} strokeWidth={3} /> Add Institution
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Entities', val: institutions.length, icon: Building2 },
                { label: 'Total Units', val: totalUnits, icon: GitBranch },
                { label: 'Strategic Reach', val: `${reachCities} CITIES`, icon: Database }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:bg-[#BDA6CE] group-hover:text-white transition-all">
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{stat.val}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? [1, 2, 3, 4].map(i => <Skeleton key={i} height={160} className="rounded-[2rem]" />) : 
                filtered.map(inst => (
                  <EntityCard key={inst.id} institution={inst} branchCount={branches.filter(b => b.institution_code === inst.inst_code).length}
                    onEdit={(i) => { setEditInst(i); setInstModal(true); }} onDelete={deleteEntity} onViewBranches={(i) => { setSelectedInst(i); setView("branches"); }} />
                ))
              }
            </div>
          </>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
              <div className="space-y-4">
                <button onClick={() => setView("list")} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] transition-all group">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back To catalog
                </button>
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-3xl bg-zinc-900 flex items-center justify-center text-white shadow-2xl shadow-zinc-900/40">
                    <Building2 size={40} />
                  </div>
                    <div className="space-y-1">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-[#BDA6CE] uppercase tracking-widest bg-[#BDA6CE]/10 px-3 py-1 rounded-full border border-[#BDA6CE]/20">{selectedInst ? selectedInst.inst_type : 'Consolidated'}</span>
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{selectedInst ? `ID: ${selectedInst.inst_code}` : 'All Units'}</span>
                    </div>
                    <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-tight">
                      {selectedInst ? selectedInst.name : "Global Deployment"}
                    </h1>
                  </div>
                </div>
              </div>
              <button onClick={() => { setEditBranch(null); setBranchModal(true); }} className="h-16 px-10 bg-zinc-900 text-white rounded-[1.5rem] flex items-center gap-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#BDA6CE] transition-all shadow-2xl active:scale-95">
                <Plus size={20} /> Initialize New Unit
              </button>
            </div>

            {/* Tactical Deployment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Operational Units', val: selectedBranches.length, icon: GitBranch, sub: 'Total Base' },
                  { label: 'Active Signals', val: activeUnits, icon: CheckCircle2, sub: 'Online' },
                  { label: 'Strategic Standby', val: offlineUnits, icon: XCircle, sub: 'Offline' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                     <div className="h-12 w-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#BDA6CE] group-hover:text-white transition-all">
                        <s.icon size={24} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tighter leading-none">{s.val} <span className="text-[10px] text-zinc-300 ml-1">{s.sub}</span></h3>
                     </div>
                  </div>
                ))}
            </div>

            {/* Tactical Deployment Data Table (Refactored to Row Layout) */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-2xl shadow-zinc-200/20">
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-100 text-left">
                     <thead>
                        <tr className="bg-zinc-50/50">
                           <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Operational Unit</th>
                           <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Deployment Base</th>
                           <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Command Node</th>
                           <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                           <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-50">
                        {loading ? [...Array(3)].map((_, i) => (
                           <tr key={i}>
                              <td colSpan={5} className="p-8">
                                 <Skeleton height={20} className="w-full opacity-50" />
                              </td>
                           </tr>
                        )) : (selectedInst ? selectedBranches : branches).length === 0 ? (
                           <tr>
                              <td colSpan={5} className="py-24 text-center">
                                 <GitBranch size={48} className="mx-auto text-zinc-100 mb-4" />
                                 <p className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">No units found in the registry.</p>
                              </td>
                           </tr>
                        ) : (selectedInst ? selectedBranches : branches).map(b => (
                           <tr key={b.branch_id} className="hover:bg-zinc-50/50 transition-all group">
                              <td className="py-6 px-8">
                                 <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg group-hover:bg-[#BDA6CE] transition-all shrink-0">
                                       <GitBranch size={20} />
                                    </div>
                                    <div>
                                       <h5 className="text-[13px] font-black text-zinc-900 uppercase tracking-tight leading-tight">{b.branch_name}</h5>
                                       <div className="flex items-center gap-2 mt-0.5">
                                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{b.branch_code}</p>
                                          {!selectedInst && (
                                             <>
                                                <span className="h-0.5 w-0.5 rounded-full bg-zinc-200" />
                                                <p className="text-[9px] font-black text-[#BDA6CE] uppercase tracking-widest">{b.institution_code}</p>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-6 px-8">
                                 <div className="flex items-center gap-3">
                                    <MapPin size={14} className="text-[#BDA6CE]" />
                                    <div>
                                       <p className="text-[11px] font-black text-zinc-900 uppercase">{b.city || 'Central'}</p>
                                       <p className="text-[9px] font-bold text-zinc-400 uppercase truncate max-w-[150px]">{b.address}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-6 px-8">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <Phone size={10} className="text-zinc-300" />
                                       <span className="text-[10px] font-black text-zinc-600">{b.contact_number || '--'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <Mail size={10} className="text-zinc-300" />
                                       <span className="text-[10px] font-black text-zinc-400 lowercase">{b.email || 'no-email@reg.pk'}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-6 px-8">
                                 <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${b.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${b.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`} />
                                    {b.status}
                                 </span>
                              </td>
                              <td className="py-6 px-8 text-right">
                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button onClick={() => { setEditBranch(b); setBranchModal(true); }} className="h-9 w-9 flex items-center justify-center bg-white text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all border border-zinc-100 shadow-sm">
                                       <Edit2 size={12} />
                                    </button>
                                    <button onClick={() => deleteUnit(b.branch_id)} className="h-9 w-9 flex items-center justify-center bg-white text-zinc-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-zinc-100 shadow-sm">
                                       <Trash2 size={12} />
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
        )}
      </div>
    </ProtectedLayout>
  );
}

// Wrap in Suspense for useSearchParams
export default function SuspendedInstitutionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 animate-pulse" />}>
      <InstitutionsPage />
    </Suspense>
  );
}
