"use client";

import React, { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import {
  Plus, Search, Filter, Edit2, Trash2,
  Building, MapPin, Phone, Mail, Users,
  Globe, CheckCircle2, XCircle, X
} from 'lucide-react';

type Institution = {
  id: string;
  code: string;
  name: string;
  type: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  employees: number;
  established: number;
  is_active: boolean;
  website: string;
};

const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: '1',
    code: 'INST-001',
    name: 'Punjab University',
    type: 'University',
    city: 'Lahore',
    country: 'Pakistan',
    email: 'admin@pu.edu.pk',
    phone: '+92-42-9231100',
    employees: 420,
    established: 1882,
    is_active: true,
    website: 'www.pu.edu.pk',
  },
  {
    id: '2',
    code: 'INST-002',
    name: 'NUST Islamabad',
    type: 'University',
    city: 'Islamabad',
    country: 'Pakistan',
    email: 'info@nust.edu.pk',
    phone: '+92-51-9085000',
    employees: 680,
    established: 1991,
    is_active: true,
    website: 'www.nust.edu.pk',
  },
  {
    id: '3',
    code: 'INST-003',
    name: 'City Grammar School',
    type: 'School',
    city: 'Karachi',
    country: 'Pakistan',
    email: 'info@cgs.edu.pk',
    phone: '+92-21-3412890',
    employees: 95,
    established: 2003,
    is_active: true,
    website: 'www.cgs.edu.pk',
  },
  {
    id: '4',
    code: 'INST-004',
    name: 'Beacon House College',
    type: 'College',
    city: 'Faisalabad',
    country: 'Pakistan',
    email: 'contact@bhcf.edu.pk',
    phone: '+92-41-8775500',
    employees: 130,
    established: 1998,
    is_active: false,
    website: 'www.bhcf.edu.pk',
  },
  {
    id: '5',
    code: 'INST-005',
    name: 'FAST National University',
    type: 'University',
    city: 'Lahore',
    country: 'Pakistan',
    email: 'lhr@nu.edu.pk',
    phone: '+92-42-111128128',
    employees: 310,
    established: 2000,
    is_active: true,
    website: 'www.nu.edu.pk',
  },
  {
    id: '6',
    code: 'INST-006',
    name: 'Roots International School',
    type: 'School',
    city: 'Rawalpindi',
    country: 'Pakistan',
    email: 'info@roots.edu.pk',
    phone: '+92-51-4435678',
    employees: 72,
    established: 1988,
    is_active: true,
    website: 'www.roots.edu.pk',
  },
];

const TYPE_COLORS: Record<string, string> = {
  University: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/20',
  College: 'bg-violet-50 text-violet-700 ring-violet-700/10 dark:bg-violet-900/20 dark:text-violet-400 dark:ring-violet-500/20',
  School: 'bg-emerald-50 text-emerald-700 ring-emerald-700/10 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/20',
};

// ─── Add / Edit Modal ────────────────────────────────────────────────────────
function InstitutionModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Institution>) => void;
  initial?: Institution | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    code: initial?.code ?? '',
    type: initial?.type ?? 'University',
    city: initial?.city ?? '',
    country: initial?.country ?? 'Pakistan',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    website: initial?.website ?? '',
    established: initial?.established ?? new Date().getFullYear(),
    is_active: initial?.is_active ?? true,
  });

  useEffect(() => {
    setForm({
      name: initial?.name ?? '',
      code: initial?.code ?? '',
      type: initial?.type ?? 'University',
      city: initial?.city ?? '',
      country: initial?.country ?? 'Pakistan',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      website: initial?.website ?? '',
      established: initial?.established ?? new Date().getFullYear(),
      is_active: initial?.is_active ?? true,
    });
  }, [initial, open]);

  if (!open) return null;

  const field = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-2xl border border-[var(--border)] animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-[var(--background)]/30">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              {initial ? 'Edit Institution' : 'Add New Institution'}
            </h2>
            <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
              Organization Security Profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Institution Name', key: 'name', type: 'text', placeholder: 'e.g. Punjab University' },
            { label: 'Institution Code', key: 'code', type: 'text', placeholder: 'e.g. INST-007' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'admin@inst.edu.pk' },
            { label: 'Phone', key: 'phone', type: 'text', placeholder: '+92-XX-XXXXXXX' },
            { label: 'City', key: 'city', type: 'text', placeholder: 'e.g. Lahore' },
            { label: 'Country', key: 'country', type: 'text', placeholder: 'e.g. Pakistan' },
            { label: 'Website', key: 'website', type: 'text', placeholder: 'www.inst.edu.pk' },
            { label: 'Established Year', key: 'established', type: 'number', placeholder: '2000' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={String(form[key as keyof typeof form])}
                onChange={field(key as keyof typeof form)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={field('type')}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
            >
              {['University', 'College', 'School', 'Institute', 'Academy'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">Status</label>
            <select
              value={form.is_active ? 'Active' : 'Inactive'}
              onChange={(e) =>
                setForm((p) => ({ ...p, is_active: e.target.value === 'Active' }))
              }
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-[var(--muted-foreground)] bg-transparent hover:bg-[var(--background)] rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition active:scale-95"
          >
            {initial ? 'Save Changes' : 'Add Institution'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Institution | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setInstitutions(MOCK_INSTITUTIONS);
      setLoading(false);
    }, 700);
  }, []);

  const types = ['All', ...Array.from(new Set(MOCK_INSTITUTIONS.map((i) => i.type)))];

  const filtered = institutions.filter((inst) => {
    const matchSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.code.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || inst.type === filterType;
    return matchSearch && matchType;
  });

  const stats = [
    { label: 'Total Institutions', value: institutions.length, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Status', value: institutions.filter((i) => i.is_active).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Inactive Status', value: institutions.filter((i) => !i.is_active).length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Total Staff Count', value: institutions.reduce((s, i) => s + i.employees, 0).toLocaleString(), icon: Users, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ];

  function handleSave(data: Partial<Institution>) {
    if (editTarget) {
      setInstitutions((prev) =>
        prev.map((i) => (i.id === editTarget.id ? { ...i, ...data } : i))
      );
    } else {
      const newInst: Institution = {
        id: String(Date.now()),
        employees: 0,
        ...data,
      } as Institution;
      setInstitutions((prev) => [newInst, ...prev]);
    }
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    setInstitutions((prev) => prev.filter((i) => i.id !== id));
    setDeleteId(null);
  }

  return (
    <ProtectedLayout>
      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="text-red-600 h-6 w-6" />
            </div>
            <h3 className="text-center text-lg font-semibold text-slate-900">Delete Institution?</h3>
            <p className="text-center text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <InstitutionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Institutions Registry</h1>
            <p className="mt-1 text-[var(--muted-foreground)]">Manage all registered organizations and educational institutions.</p>
          </div>
          <button
            id="add-institution-btn"
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Institution
          </button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] h-28 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="card-professional relative group"
                >
                  <div className={`inline-flex p-3 rounded-xl ${s.bg} group-hover:scale-110 transition-transform mb-4`}>
                    <Icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <p className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{s.label}</p>
                  <p className="text-3xl font-bold text-[var(--foreground)] mt-1">{s.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Table Card */}
        <div className="bg-[var(--card)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]/50 flex flex-col sm:flex-row gap-4 justify-between lg:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                id="institution-search"
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-full text-sm text-[var(--foreground)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    filterType === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--background)]/50">
                <tr>
                  {['Institution Name', 'Entity Type', 'Regional Location', 'Official Contact', 'Personnel', 'Status', ''].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="py-4 px-4 text-left text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest first:pl-6 last:pr-6"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-white">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Building className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No institutions found.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Institution */}
                      <td className="whitespace-nowrap py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-600/20">
                            {inst.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--foreground)] text-sm tracking-tight">{inst.name}</div>
                            <div className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase">{inst.code}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                            TYPE_COLORS[inst.type] ?? 'bg-slate-50 text-slate-700 ring-slate-700/10'
                          }`}
                        >
                          {inst.type}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]">
                          <MapPin className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                          {inst.city}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] mt-0.5">
                          <Globe className="h-3 w-3 shrink-0" />
                          {inst.country}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]">
                          <Mail className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                          {inst.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] mt-0.5 font-mono">
                          <Phone className="h-3 w-3 shrink-0" />
                          {inst.phone}
                        </div>
                      </td>

                      {/* Staff */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                          <Users className="h-4 w-4 text-blue-600" />
                          {inst.employees}
                        </div>
                        <div className="text-[10px] font-bold text-[var(--muted-foreground)] mt-0.5 uppercase tracking-widest">Est. {inst.established}</div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-tighter ${
                            inst.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              inst.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {inst.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap py-4 pl-4 pr-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditTarget(inst); setModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(inst.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
              <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                Showing <span className="text-[var(--foreground)]">{filtered.length}</span> of{' '}
                <span className="text-[var(--foreground)]">{institutions.length}</span> entities
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
