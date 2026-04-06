"use client";

import React, { useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { fetchWithAuth } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function NewInstitutionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    inst_code: '',
    name: '',
    inst_type: 'educational',
    address: '',
    city: '',
    contact_number: '',
  });

  const institutionTypes = [
    { value: 'educational', label: 'Educational (School, College, University)' },
    { value: 'healthcare', label: 'Healthcare (Hospital, Clinic, Lab)' },
    { value: 'social_welfare', label: 'Social Welfare (Kitchen, Shelter, Center)' },
    { value: 'administrative', label: 'Administrative (Office, branch)' },
    { value: 'technical', label: 'Technical / Vocational' },
    { value: 'operational', label: 'Operational / Project Site' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.inst_code.trim()) {
      setError('Institution code is required');
      setLoading(false);
      return;
    }
    if (!formData.name.trim()) {
      setError('Institution name is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth('/employees/institutions/', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Success - redirect to institutions list
        router.push('/institutions');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create institution');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex items-center space-x-4">
          <Link href="/institutions" className="p-2 rounded-full hover:bg-slate-200 transition bg-slate-100 text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Institution</h1>
            <p className="text-sm text-slate-500">Set up a new institution in your organization.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Basic Information Section */}
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Basic Information
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Institution Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Institution Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="inst_code"
                    value={formData.inst_code}
                    onChange={handleChange}
                    placeholder="e.g., AKS01"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Unique identifier for this institution</p>
                </div>

                {/* Institution Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Al-Khair Secondary School"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                    required
                  />
                </div>
              </div>

              {/* Institution Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Institution Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="inst_type"
                  value={formData.inst_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                >
                  {institutionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Contact & Location
            </h3>
            
            <div className="space-y-6">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address and building details"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Karachi"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="e.g., +92-300-1234567"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 justify-end">
            <Link
              href="/institutions"
              className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_4px_10px_rgba(79,70,229,0.25)] hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              {loading ? 'Creating...' : 'Create Institution'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
