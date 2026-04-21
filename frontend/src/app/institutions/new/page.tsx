"use client";

import React, { useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { fetchWithAuth } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Building2, MapPin, 
  Phone, Globe, Fingerprint, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

export default function NewInstitutionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    organization: '',
    inst_code: '',
    name: '',
    inst_type: 'educational',
    address: '',
    city: '',
    contact_number: '',
  });

  const organizations = [
    { value: 'IAK', label: 'Alkhair (IAK)', color: 'bg-emerald-500' },
    { value: 'EDHI', label: 'Edhi Foundation (EDHI)', color: 'bg-blue-500' },
    { value: 'SMIT', label: 'Saylani (SMIT)', color: 'bg-orange-500' },
    { value: 'BQ', label: 'Bano Qabil (BQ)', color: 'bg-indigo-500' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.organization) newErrors.organization = "Organization selection is required";
    if (!formData.inst_code.trim()) newErrors.inst_code = "Unique code is required";
    if (!formData.name.trim()) newErrors.name = "Institution name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetchWithAuth('/employees/institutions', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (response.ok) router.push('/employees/institutions');
      else setErrors({ server: 'Failed to save. Please check your connection.' });
    } catch (err) {
      setErrors({ server: 'A network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/employees/institutions" className="group p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Institution</h1>
                <p className="text-sm text-slate-500">Configure a new functional entity within the system.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Info Card */}
            <div className="space-y-6">
              <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                <div className="relative z-10">
                  <ShieldCheck className="text-indigo-300 mb-4" size={32} />
                  <h3 className="text-xl font-bold mb-2">Institutional Integrity</h3>
                  <p className="text-indigo-100/80 text-sm leading-relaxed">
                    Ensure the Institution Code matches your internal registry. This code is used for all financial and employee mapping.
                  </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-800 rounded-full opacity-50" />
              </div>
              
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Guidelines</h4>
                <ul className="space-y-3">
                  {[ 'Unique Institution Code', 'Valid Physical Address', 'Assigned Organization' ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Identity */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Building2 size={18}/></div>
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Identity & Governance</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Parent Organization</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {organizations.map((org) => (
                          <button
                            key={org.value}
                            type="button"
                            onClick={() => handleChange({ target: { name: 'organization', value: org.value } } as any)}
                            className={`py-3 px-2 rounded-2xl border-2 text-[10px] font-black transition-all ${
                              formData.organization === org.value 
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' 
                                : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                            }`}
                          >
                            {org.label}
                          </button>
                        ))}
                      </div>
                      {errors.organization && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase ml-1 italic">{errors.organization}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Institution Code</label>
                        <div className="relative">
                          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            name="inst_code"
                            value={formData.inst_code}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold transition-all outline-none ${errors.inst_code ? 'border-red-500 ring-4 ring-red-50' : 'border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`}
                            placeholder="IAK-001"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Formal Name</label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold transition-all outline-none ${errors.name ? 'border-red-500 ring-4 ring-red-50' : 'border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`}
                          placeholder="Public School System"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Logistics */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPin size={18}/></div>
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Communication & Reach</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input name="city" placeholder="City" onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input name="contact_number" placeholder="Contact Number" onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                    <textarea 
                      name="address" 
                      placeholder="Full Physical Address..." 
                      rows={2} 
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pb-10">
                  <Link href="/employees/institutions" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                    Discard
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Deploy Institution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}