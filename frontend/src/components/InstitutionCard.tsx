"use client";

import React from "react";
import { 
  Building2, MapPin, MoreVertical, 
  GitBranch, Edit2, Trash2, ArrowRight
} from "lucide-react";

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

interface InstitutionCardProps {
  institution: Institution;
  onEdit: (inst: Institution) => void;
  onDelete: (id: string) => void;
  onViewBranches: (inst: Institution) => void;
}

export default function InstitutionCard({ 
  institution, 
  onEdit, 
  onDelete, 
  onViewBranches 
}: InstitutionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-[#BDA6CE]/20 transition-all duration-300 relative flex flex-col hover:-translate-y-1">
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300 group-hover:bg-[#BDA6CE] shrink-0">
               <Building2 size={16} strokeWidth={2.5} className="sm:hidden" />
               <Building2 size={18} strokeWidth={2.5} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] sm:text-[15px] font-black text-zinc-900 tracking-tight group-hover:text-[#BDA6CE] transition-colors uppercase leading-tight truncate">
                {institution.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 mb-1 flex-wrap">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest leading-none border border-emerald-100">
                  active
                </span>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{institution.inst_code}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(institution); }}
              className="h-7 w-7 flex items-center justify-center bg-zinc-50 text-zinc-400 rounded-lg hover:bg-zinc-900 hover:text-white transition-all active:scale-95 border border-zinc-200"
            >
              <Edit2 size={11} />
            </button>
          </div>
        </div>

        {/* Mini Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 mt-auto pt-3 border-t border-zinc-50">
           <div className="bg-zinc-50/50 rounded-lg p-2 border border-zinc-100">
              <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Type</p>
              <p className="text-[9px] sm:text-[10px] font-black text-zinc-900 uppercase truncate">{institution.inst_type || 'Educational'}</p>
           </div>
           <div className="bg-zinc-50/50 rounded-lg p-2 border border-zinc-100">
              <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">City</p>
              <div className="flex items-center gap-1">
                <MapPin size={8} className="text-zinc-400" />
                <p className="text-[9px] sm:text-[10px] font-black text-zinc-900 truncate">{institution.city || 'Central'}</p>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center mt-auto">
          <button 
            onClick={() => onViewBranches(institution)}
            className="w-full bg-zinc-900 text-white rounded-lg py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#BDA6CE] transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-zinc-900/10"
          >
            <GitBranch size={12} /> View Deployments
          </button>
        </div>
      </div>
    </div>
  );
}
