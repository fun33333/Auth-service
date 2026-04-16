"use client";

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { fetchWithAuth } from '@/utils/api';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2, Trash2, MapPin, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';

interface Institution {
  id: string;
  inst_id: string;
  inst_code: string;
  name: string;
  inst_type: string;
  address?: string;
  city?: string;
  contact_number?: string;
  created_at?: string;
  updated_at?: string;
}

export default function InstitutionDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    async function loadInstitution() {
      try {
        const response = await fetchWithAuth(`/employees/institutions/${id}/`);
        if (response.ok) {
          const data = await response.json();
          setInstitution(data);
        } else {
          setError('Failed to load institution');
        }
      } catch (err) {
        console.error("Failed to load institution:", err);
        setError('Error loading institution');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadInstitution();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this institution?')) return;

    try {
      const response = await fetchWithAuth(`/employees/institutions/${id}/`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/institutions');
      } else {
        alert('Failed to delete institution');
      }
    } catch (err) {
      console.error("Failed to delete institution:", err);
      alert('Error deleting institution');
    }
  };

  const getInstitutionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'educational': 'Educational',
      'healthcare': 'Healthcare',
      'social_welfare': 'Social Welfare',
      'administrative': 'Administrative',
      'technical': 'Technical',
      'operational': 'Operational',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
          <div className="text-center text-slate-500">Loading institution details...</div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!institution) {
    return (
      <ProtectedLayout>
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
          <div className="text-center text-red-500">Institution not found</div>
          <Link href="/institutions" className="text-indigo-600 hover:underline">Back to Institutions</Link>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-4">
            <Link href="/institutions" className="p-2 rounded-full hover:bg-slate-200 transition bg-slate-100 text-slate-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{institution.name}</h1>
              <p className="text-sm text-slate-500 mt-1">ID: {institution.inst_code}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/institutions/${id}/edit`}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_10px_rgba(79,70,229,0.25)] hover:bg-indigo-700 hover:shadow-lg transition-all"
            >
              <Edit2 className="-ml-1 mr-2 h-5 w-5" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_10px_rgba(220,38,38,0.25)] hover:bg-red-700 hover:shadow-lg transition-all"
            >
              <Trash2 className="-ml-1 mr-2 h-5 w-5" />
              Delete
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* Main Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Type Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Institution Type</h3>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-indigo-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{getInstitutionTypeLabel(institution.inst_type)}</p>
                  <p className="text-xs text-slate-500 mt-1">Category</p>
                </div>
              </div>
            </div>

            {/* Code Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Institution Code</h3>
              <p className="text-xl font-bold text-slate-900 font-mono">{institution.inst_code}</p>
              <p className="text-xs text-slate-500 mt-2">System ID: {institution.inst_id}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            {(institution.contact_number || institution.city) && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {institution.contact_number && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-900">{institution.contact_number}</p>
                      </div>
                    </div>
                  )}
                  {institution.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">City</p>
                        <p className="text-sm font-medium text-slate-900">{institution.city}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address Section */}
        {institution.address && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Address</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{institution.address}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-xs text-slate-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500 text-xs">Created</p>
              <p className="font-medium">{institution.created_at ? new Date(institution.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Last Updated</p>
              <p className="font-medium">{institution.updated_at ? new Date(institution.updated_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
