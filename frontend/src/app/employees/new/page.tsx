"use client";

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { fetchWithAuth } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function NewEmployeeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    gender: 'Male',
    personalEmail: '',
    mobile: '',
    residentialAddress: '',
    departmentCode: '',
    designationCode: '',
    organizationCode: 'IAK',
  });

  useEffect(() => {
    async function fetchFormMeta() {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setDepartments([
          { dept_code: "ADMIN", dept_name: "Administration" },
          { dept_code: "ENG", dept_name: "Engineering" },
          { dept_code: "HR", dept_name: "Human Resources" },
        ]);
        setDesignations([
          { id: 1, position_code: "MGR", position_name: "Manager", department__dept_code: "ADMIN" },
          { id: 2, position_code: "LDEV", position_name: "Lead Dev", department__dept_code: "ENG" },
          { id: 3, position_code: "SPC", position_name: "Specialist", department__dept_code: "HR" },
        ]);
      } catch (err) {
        console.error("Failed to load metadata");
      }
    }
    fetchFormMeta();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock Form Submission
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate to employees list directly to show success
      router.push('/employees');
      
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex items-center space-x-4">
          <Link href="/employees" className="p-2 rounded-full hover:bg-slate-200 transition bg-slate-100 text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Employee</h1>
            <p className="text-sm text-slate-500">Fill in the details below to register a new staff member.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Section 1 */}
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Personal Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CNIC *</label>
                <input required name="cnic" value={formData.cnic} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="42201-1234567-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
               <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Contact Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Personal Email *</label>
                <input required type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile *</label>
                <input required name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0300-1234567" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address *</label>
              <textarea required rows={2} name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123 Street Name..." />
            </div>
          </div>

          {/* Section 3 */}
          <div className="p-8 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
               <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
              Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                <select required name="departmentCode" value={formData.departmentCode} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.dept_code} value={d.dept_code}>{d.dept_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designation *</label>
                <select required name="designationCode" value={formData.designationCode} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Designation</option>
                  {designations
                    .filter(d => !formData.departmentCode || d.department__dept_code === formData.departmentCode)
                    .map(d => (
                      <option key={d.id} value={d.position_code}>{d.position_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 flex items-center disabled:opacity-70 transition active:scale-95">
              {loading ? (
                 <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>

        </form>

      </div>
    </ProtectedLayout>
  );
}
