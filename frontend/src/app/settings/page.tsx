"use client";

import React from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { Settings, Shield, Bell, Key, Moon } from "lucide-react";

export default function SettingsPage() {
  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
          <p className="mt-2 text-slate-500">Configure your application preferences and security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Settings Sidebar */}
          <div className="md:col-span-1 space-y-1">
            {[
              { id: 'general', name: 'General', icon: Settings, active: true },
              { id: 'security', name: 'Security & Auth', icon: Shield, active: false },
              { id: 'notifications', name: 'Notifications', icon: Bell, active: false },
              { id: 'appearance', name: 'Appearance', icon: Moon, active: false },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    tab.active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={tab.active ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">General Preferences</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                  <select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white">
                    <option>UTC+05:00 (Karachi / Islamabad)</option>
                    <option>UTC+00:00 (London)</option>
                    <option>UTC-05:00 (New York)</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl text-sm shadow-md hover:bg-indigo-700 transition">
                  Save Preferences
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Key size={18} className="text-indigo-500" /> Password
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Update your portal access password.</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 transition">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
