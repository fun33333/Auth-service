"use client";

import React, { useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { User, Mail, Building, Shield, Camera, Calendar, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  
  // For the update contact section
  const [phone, setPhone] = useState("");
  const [altEmail, setAltEmail] = useState("");
  
  if (!user) return null;

  const roleText = user.is_superadmin ? "System Administrator" : (user.designation || "User");
  const roleDesc = user.is_superadmin ? "Full system access and management" : "Standard system access and management";
  const memberSince = "29/04/2026";

  return (
    <ProtectedLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        
        {/* Top Header */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <div className="h-14 w-14 bg-[#2a4d77] rounded-full flex items-center justify-center mb-4 shadow-sm">
            <User size={26} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Profile Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column - Profile Card */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-slate-100">
              <div className="bg-[#2a4d77] flex flex-col items-center pt-10 pb-8 px-4">
                <div className="relative mb-4">
                  <div className="h-28 w-28 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-[#2a4d77] shadow-lg">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-sm text-slate-400 hover:text-slate-600 cursor-pointer border border-slate-100">
                    <Camera size={14} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{user.full_name}</h2>
                <p className="text-xs text-blue-200 mb-4">{user.email}</p>
                <div className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Shield size={12} /> {user.is_superadmin ? "Admin" : "User"}
                </div>
              </div>
              <div className="p-6 text-center bg-white border-t border-slate-100">
                <p className="text-[13px] text-slate-500 mb-4 leading-relaxed font-medium">
                  {roleText} - {roleDesc}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <Calendar size={14} />
                  <span>Member since: {memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings container */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            
            <div className="p-8">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-[#1e293b]">Personal Information</h3>
                <Link href={`/employees/${user.id}/edit`} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2a4d77] text-white text-xs font-semibold rounded-lg hover:bg-[#1f3855] transition-colors shadow-sm">
                  <Edit2 size={14} /> Edit Profile
                </Link>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8 border-b border-slate-100 pb-8">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <User size={12} /> Full Name
                  </label>
                  <div className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 font-medium">
                    {user.full_name}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <div className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 font-medium">
                    {user.email}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <Building size={12} /> Department
                  </label>
                  <div className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 font-medium">
                    {user.department || "Academic"}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    <Shield size={12} /> Role
                  </label>
                  <div className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-[#2a4d77] font-bold">
                    {user.is_superadmin ? "Admin" : (user.designation || "User")}
                  </div>
                </div>
              </div>

              {/* Profile Picture Section */}
              <div className="mb-8 border-b border-slate-100 pb-8">
                <h3 className="text-[14px] font-bold text-slate-800 mb-4">Profile Picture</h3>
                <div className="bg-[#f0f4f8] border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-16 w-16 shrink-0 rounded-full bg-white flex items-center justify-center text-xl font-bold text-[#2a4d77] shadow-sm border border-slate-100">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium max-w-md">
                      Update your profile picture to help people recognize you easily. The image will appear in your navbar across all pages.
                    </p>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2a4d77] text-white text-[11px] font-bold rounded-lg hover:bg-[#1f3855] transition-colors shadow-sm">
                      <Camera size={14} /> Upload Profile Picture
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Information Section */}
              <div className="mb-8 border-b border-slate-100 pb-8">
                <h3 className="text-[14px] font-bold text-slate-800 mb-4">Role Information</h3>
                <div className="bg-[#f0f4f8] border border-slate-200 rounded-xl p-5">
                  <p className="text-[13px] text-slate-500 font-medium mb-3">
                    {roleText} - {roleDesc}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                    <Calendar size={14} />
                    <span>Member since: {memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Update Contact Section */}
              <div>
                <h3 className="text-[14px] font-bold text-slate-800 mb-4">Update Contact</h3>
                <div className="flex flex-col sm:flex-row gap-4 mb-5">
                  <input 
                    type="text" 
                    placeholder="Phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-[13px] text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:border-[#2a4d77] focus:ring-1 focus:ring-[#2a4d77]"
                  />
                  <input 
                    type="email" 
                    placeholder="Alternate email" 
                    value={altEmail}
                    onChange={(e) => setAltEmail(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-[13px] text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:border-[#2a4d77] focus:ring-1 focus:ring-[#2a4d77]"
                  />
                </div>
                <button className="px-6 py-2.5 bg-[#2a4d77] text-white text-[11px] font-bold rounded-lg hover:bg-[#1f3855] transition-colors shadow-sm">
                  Save Contact
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
