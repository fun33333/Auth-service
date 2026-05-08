"use client";

import React, { useState, useRef } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { User, Mail, Building, Camera, Calendar, Edit2 } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();

    const [message, setMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    if (!user) return null;

    const roleText = user.is_superadmin ? "System Administrator" : (user.designation || "User");
    const roleDesc = user.is_superadmin ? "Full system access and management" : "Standard system access and management";
    const memberSince = "29/04/2026"; // Or use user created_at if available

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simulate image upload by creating a local preview URL
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
        setMessage("Profile picture updated locally.");
        setTimeout(() => setMessage(""), 3000);
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <ProtectedLayout>
            <div className="max-w-3xl mx-auto px-2 py-5 sm:py-10 animate-in fade-in duration-500">

                {/* Top Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-5">
                    <div className="flex flex-col items-center justify-center text-center mb-8">
                        <div className="h-14 w-14 bg-[#6B3F69] rounded-full flex items-center justify-center mb-4 shadow-md shadow-[#6B3F69]/20">
                            <User size={26} className="text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
                        <p className="text-sm font-medium text-slate-500 mt-2">Manage your account information and preferences</p>
                    </div>

                    {message && (
                        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-4 border border-emerald-100 shadow-sm">
                            {message}
                        </div>
                    )}

                    {/* Settings container (centered form) */}

                    <div className="p-6 sm:p-10">

                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Personal Information</h3>
                            {/* <Link href={`/employees/${user.id}/edit`} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6B3F69] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#563254] transition-all shadow-lg shadow-[#6B3F69]/20 active:scale-95">
                                <Edit2 size={14} /> Edit Profile
                            </Link> */}
                        </div>

                        {/* Grid Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mb-10 border-b border-slate-100 pb-10">
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                    <User size={12} /> Full Name
                                </label>
                                <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-bold shadow-sm">
                                    {user.full_name}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                    <Mail size={12} /> Email Address
                                </label>
                                <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-bold shadow-sm">
                                    {user.email}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                    <Building size={12} /> Department
                                </label>
                                <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-bold shadow-sm">
                                    {user.department || "Unassigned"}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                    <div className="h-2 w-2 rounded-full border-[1.5px] border-slate-400" /> Role
                                </label>
                                <div className="w-full bg-white border border-purple-100 rounded-xl px-4 py-3.5 text-sm text-[#6B3F69] font-black shadow-sm">
                                    {user.is_superadmin ? "Admin" : (user.designation || "User")}
                                </div>
                            </div>
                        </div>

                        {/* Profile Picture Section */}
                        <div className="mb-10 border-b border-slate-100 pb-10">
                            <h3 className="text-sm font-black text-slate-900 mb-6">Profile Picture</h3>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 group">
                                <div className="h-24 w-24 shrink-0 rounded-4xl bg-white flex items-center justify-center text-3xl font-black text-[#6B3F69] shadow-lg shadow-[#6B3F69]/10 border border-slate-100 overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        user.full_name?.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <p className="text-[11px] text-slate-500 mb-5 leading-relaxed font-semibold max-w-sm mx-auto sm:mx-0">
                                        Update your profile picture to help people recognize you easily. The image will appear in your navbar across all pages.
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={triggerImageUpload}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                                    >
                                        <Camera size={14} /> Upload Picture
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Role Information Section */}
                        <div>
                            <h3 className="text-sm font-black text-slate-900 mb-6">Role Information</h3>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="text-sm text-slate-900 font-black tracking-tight mb-1.5">
                                        {roleText}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {roleDesc}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-lg border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <Calendar size={14} className="text-[#6B3F69]" />
                                    <span>Since {memberSince}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </ProtectedLayout >
    );
}
