"use client";

import React, { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';
import { 
  Plus, Search, Filter, Phone, Mail, MoreHorizontal, 
  Info, Users, UserPlus, UserCheck, UserMinus, 
  ChevronLeft, ChevronRight, X, Calendar, Hash,
  MessageSquare, Globe, Briefcase, MapPin,
  LayoutGrid, List as ListIcon, MoreVertical
} from 'lucide-react';

// --- Types ---
interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  department: { dept_name: string };
  designation: { position_name: string };
  is_active: boolean;
  join_date: string;
  image?: string;
  priority: 'High' | 'Medium' | 'Low';
  gender: 'Male' | 'Female' | 'Other';
  bio?: string;
  location?: string;
}

// --- Components ---

const StatsCard = ({ title, count, icon: Icon, color, bgColor }: any) => (
  <div className={`p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 bg-white hover:shadow-md transition-all group`}>
    <div className={`p-3 rounded-xl ${bgColor} ${color.replace('bg-', 'text-')} shadow-sm group-hover:scale-110 transition-transform`}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="space-y-0.5">
      <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-xl font-black text-zinc-900 leading-none">{count}</h3>
    </div>
  </div>
);

const EmployeeCard = ({ employee, onClick }: { employee: Employee, onClick: () => void }) => (
  <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center relative overflow-hidden">
    <div className={`absolute top-5 right-5 h-2 w-2 rounded-full ${employee.is_active ? 'bg-emerald-400' : 'bg-rose-500'} shadow-lg`} />
    
    <div className="relative mb-4">
      <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center p-1 border border-zinc-100 group-hover:border-blue-500 transition-colors overflow-hidden">
        <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
          {employee.full_name.charAt(0)}
        </div>
      </div>
    </div>

    <h4 className="font-bold text-zinc-900 text-lg line-clamp-1">{employee.full_name}</h4>
    <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-5 opacity-80">{employee.designation.position_name}</p>

    <div className="w-full grid grid-cols-2 gap-3 mb-6">
      <div className="bg-white border border-emerald-100 rounded-2xl p-3 text-left shadow-sm">
        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Emp ID</p>
        <p className="text-xs font-black text-emerald-500">{employee.employee_code}</p>
      </div>
      <div className="bg-zinc-50 rounded-2xl p-3 text-left">
        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Join Date</p>
        <p className="text-xs font-bold text-zinc-700">{employee.join_date}</p>
      </div>
    </div>

    <div className="flex items-center gap-2 mt-auto w-full">
      <button className="flex-1 bg-zinc-900 text-white h-11 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-xs font-bold active:scale-95">
        <Phone size={14} />
      </button>
      <button className="flex-1 bg-zinc-50 text-zinc-500 h-11 rounded-xl hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 text-xs font-bold active:scale-95">
        <MessageSquare size={14} />
      </button>
      <button 
        onClick={onClick}
        className="flex-1 bg-zinc-50 text-zinc-500 h-11 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 text-xs font-bold active:scale-95"
      >
        <Info size={14} />
      </button>
    </div>
  </div>
);

const EmployeeTable = ({ employees, onDetailClick }: { employees: Employee[], onDetailClick: (emp: Employee) => void }) => (
  <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-50 text-left">
            <th className="p-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Name</th>
            <th className="p-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Employee Id</th>
            <th className="p-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Phone</th>
            <th className="p-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Join Date</th>
            <th className="p-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Department</th>
            <th className="p-6 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50/50">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors group">
              <td className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-zinc-800 group-hover:text-blue-600 transition-colors">{emp.full_name}</h5>
                    <p className="text-[11px] text-zinc-400 font-medium">{emp.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-6">
                <span className="text-xs font-black text-emerald-300 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-100/50">
                  {emp.employee_code}
                </span>
              </td>
              <td className="p-6 text-xs font-bold text-zinc-700">{emp.phone}</td>
              <td className="p-6 text-xs font-bold text-zinc-600">{emp.join_date}</td>
              <td className="p-6">
                <span className="px-3 py-1 bg-indigo-50 text-black rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                  {emp.department.dept_name}
                </span>
              </td>
              <td className="p-6">
                <button 
                  onClick={() => onDetailClick(emp)}
                  className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                >
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DetailModal = ({ employee, open, onClose }: { employee: Employee | null, open: boolean, onClose: () => void }) => {
  if (!open || !employee) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-70 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <button onClick={onClose} className="absolute top-8 right-8 h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-all active:scale-90 z-20"><X size={20} /></button>
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-64 bg-zinc-50/50 p-10 flex flex-col items-center border-r border-zinc-100">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-8 ring-8 ring-white">
              {employee.full_name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-zinc-900 text-center tracking-tight">{employee.full_name}</h3>
            <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mt-2 mb-8 text-center">{employee.designation.position_name}</p>
            <div className={`px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${employee.is_active ? 'bg-emerald-400 text-white' : 'bg-rose-500 text-white'} shadow-sm`}>
              {employee.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="flex-1 p-10 overflow-y-auto max-h-[85vh]">
            <div className="mb-10"><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Biography</h4><p className="text-sm text-zinc-600 leading-relaxed italic">{employee.bio || "Professional team member with expertise in their field. Committed to organization growth and excellence in performance."}</p></div>
            <div className="grid grid-cols-2 gap-10">
              <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Email Address</h4><p className="text-sm font-bold text-zinc-800">{employee.email}</p></div>
              <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Phone Number</h4><p className="text-sm font-bold text-zinc-800">{employee.phone}</p></div>
              <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Department</h4><p className="text-sm font-bold text-zinc-800">{employee.department.dept_name}</p></div>
              <div><h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Priority</h4><span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md uppercase tracking-widest">{employee.priority}</span></div>
            </div>
            <div className="mt-12 flex gap-4">
              <button className="flex-1 bg-zinc-900 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-zinc-900/10">Edit Profile</button>
              <button className="px-8 border-2 border-zinc-100 text-zinc-500 rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95">Actions</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadEmployees() {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setEmployees([
          { id: '1', employee_code: "EMP-001", full_name: "Sarah Jenkins", email: "sarah@example.com", phone: "+92-300-1234567", department: { dept_name: "Administration" }, designation: { position_name: "Manager" }, is_active: true, join_date: "12-Jan-2023", priority: 'High', gender: 'Female' },
          { id: '2', employee_code: "EMP-002", full_name: "David Chen", email: "david@example.com", phone: "+92-321-7654321", department: { dept_name: "Engineering" }, designation: { position_name: "Lead Designer" }, is_active: true, join_date: "25-Mar-2022", priority: 'High', gender: 'Male' },
          { id: '3', employee_code: "EMP-003", full_name: "Amelia Pond", email: "amy@example.com", phone: "+92-333-5555555", department: { dept_name: "HR" }, designation: { position_name: "Specialist" }, is_active: false, join_date: "05-Aug-2023", priority: 'Medium', gender: 'Female' },
          { id: '4', employee_code: "EMP-004", full_name: "Rory Williams", email: "rory@example.com", phone: "+92-344-4444444", department: { dept_name: "Operations" }, designation: { position_name: "Coordinator" }, is_active: true, join_date: "15-Feb-2023", priority: 'Low', gender: 'Male' },
          { id: '5', employee_code: "EMP-005", full_name: "Jessica Alba", email: "jessica@example.com", phone: "+92-300-9999999", department: { dept_name: "Marketing" }, designation: { position_name: "Director" }, is_active: true, join_date: "10-Nov-2021", priority: 'High', gender: 'Female' },
          { id: '6', employee_code: "EMP-006", full_name: "Marcus Aurelius", email: "marcus@example.com", phone: "+92-301-8888888", department: { dept_name: "Strategy" }, designation: { position_name: "Consultant" }, is_active: false, join_date: "01-Jan-2024", priority: 'Medium', gender: 'Male' },
          { id: '7', employee_code: "EMP-007", full_name: "Elena Gilbert", email: "elena@example.com", phone: "+92-302-7777777", department: { dept_name: "Legal" }, designation: { position_name: "Advocate" }, is_active: true, join_date: "12-Sep-2023", priority: 'Low', gender: 'Female' },
          { id: '8', employee_code: "EMP-008", full_name: "Stefan Salvatore", email: "stefan@example.com", phone: "+92-303-6666666", department: { dept_name: "Security" }, designation: { position_name: "Officer" }, is_active: true, join_date: "30-Oct-2023", priority: 'High', gender: 'Male' },
          { id: '9', employee_code: "EMP-009", full_name: "Bonnie Bennett", email: "bonnie@example.com", phone: "+92-304-5555555", department: { dept_name: "Innovation" }, designation: { position_name: "Lead Dev" }, is_active: true, join_date: "14-May-2023", priority: 'Medium', gender: 'Female' },
          { id: '10', employee_code: "EMP-010", full_name: "Caroline Forbes", email: "caroline@example.com", phone: "+92-305-4444444", department: { dept_name: "Publicity" }, designation: { position_name: "Manager" }, is_active: false, join_date: "20-Dec-2023", priority: 'Low', gender: 'Female' },
        ]);
      } catch (err) {
        console.error("Failed to load employees");
      } finally {
        setLoading(false);
      }
    }
    loadEmployees();
  }, []);

  const stats = {
    total: employees.length,
    new: 15, // Fixed to match image
    male: 85, // Fixed to match image
    female: 20, // Fixed to match image
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                         emp.employee_code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Active' && emp.is_active) || 
                         (statusFilter === 'Inactive' && !emp.is_active);
    const matchesPriority = priorityFilter === 'All' || emp.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleOpenDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-zinc-900">Employee</h1>
          </div>
        </div>

        {/* Stats Grid - Horizontal Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Employee" count={stats.total} icon={Users} color="bg-indigo-600" bgColor="bg-indigo-50" />
          <StatsCard title="New Employee" count={stats.new} icon={UserPlus} color="bg-amber-500" bgColor="bg-amber-50" />
          <StatsCard title="Male" count={stats.male} icon={Globe} color="bg-blue-500" bgColor="bg-blue-50" />
          <StatsCard title="Female" count={stats.female} icon={Briefcase} color="bg-rose-400" bgColor="bg-rose-50" />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Filters */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Employee Name</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-700 focus:ring-4 focus:ring-blue-500/5 outline-none transition shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Status</p>
              <select 
                className="w-full px-4 py-3.5 bg-white border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-700 focus:ring-4 focus:ring-blue-500/5 outline-none cursor-pointer shadow-sm appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Priority</p>
              <div className="flex gap-4">
                <select 
                  className="flex-1 px-4 py-3.5 bg-white border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-700 focus:ring-4 focus:ring-blue-500/5 outline-none cursor-pointer shadow-sm appearance-none"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <button className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 active:scale-95">
                  <Search size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-end pb-1 gap-4 self-center xl:self-end">
            <Link
              href="/employees/new"
              className="inline-flex items-center justify-center rounded-2xl bg-white border border-zinc-200 h-12 px-8 text-xs font-black text-zinc-900 hover:bg-zinc-50 transition-all active:scale-95 uppercase tracking-widest shadow-sm"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" strokeWidth={3} />
              Add Employee
            </Link>
          </div>
        </div>

        {/* Grid/List Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Show Entries</p>
            <select className="bg-white border border-zinc-100 rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 outline-none shadow-sm cursor-pointer">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center p-1.5 bg-white border border-zinc-100 rounded-2xl shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
              <div className="h-10 w-10 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-zinc-200">
              <p className="text-zinc-500 font-bold">No results found.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {filteredEmployees.map((person) => (
                <EmployeeCard key={person.id} employee={person} onClick={() => handleOpenDetail(person)} />
              ))}
            </div>
          ) : (
            <EmployeeTable employees={filteredEmployees} onDetailClick={handleOpenDetail} />
          )}
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-100">
          <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
            Showing <span className="text-zinc-900">1</span> to <span className="text-zinc-900">{filteredEmployees.length}</span> of <span className="text-zinc-900">{employees.length}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(p => (
                <button key={p} className={`h-10 w-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${p === 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-zinc-100 text-zinc-500'}`}>
                  {p}
                </button>
              ))}
            </div>
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      <DetailModal 
        employee={selectedEmployee} 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </ProtectedLayout>
  );
}
