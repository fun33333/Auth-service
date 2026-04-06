"use client";

import React from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, Mail, Building, Briefcase } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="mt-2 text-slate-500">Manage your personal information and account settings.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-linear-to-r from-indigo-500 to-indigo-700 h-32 w-full"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-md border border-slate-100">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Masum Khan')}&background=4f46e5&color=fff&size=256`} 
                  alt="Avatar" 
                  className="h-full w-full object-cover rounded-xl"
                />
              </div>
              <button className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-xl text-sm transition">
                Edit Profile
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user.full_name}</h2>
                <p className="text-slate-500 font-mono text-sm">{user.code}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg"><Mail size={18} /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg"><Building size={18} /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                    <p className="font-medium">{user.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg"><Briefcase size={18} /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Designation</p>
                    <p className="font-medium">{user.designation}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg"><UserIcon size={18} /></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role Type</p>
                    <p className="font-medium">{user.is_superadmin ? 'Super Administrator' : 'Standard User'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
