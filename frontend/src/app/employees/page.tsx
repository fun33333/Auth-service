"use client";

import React, { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import Link from 'next/link';
import {
  Plus, Search, Filter, Phone, Mail, MoreHorizontal,
  Users, UserPlus, UserCheck, UserMinus,
  ChevronLeft, ChevronRight, X, Calendar,
  LayoutGrid, List as ListIcon, MoreVertical, Download, CreditCard,
  ShieldCheck, Smartphone, User as UserIcon,
  ShieldAlert, MoreVertical as Dots
} from 'lucide-react';
import IDCard from '@/components/IDCard';
import Skeleton from '@/components/Skeleton';
import { fetchWithAuth } from '@/utils/api';

// --- Types ---
interface Employee {
  employee_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  department?: { dept_name: string; dept_code: string } | null;
  designation?: { position_name: string; position_code: string } | null;
  is_active: boolean;
  created_at: string; // Backend uses created_at
  image?: string;
  priority?: 'High' | 'Medium' | 'Low';
  gender?: 'Male' | 'Female' | 'Other';
  bio?: string;
  location?: string;
  cnic?: string;
}

// --- Utils ---
const getDeptColor = (deptName: string = '') => {
  const name = deptName.toLowerCase();
  if (name.includes('food')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (name.includes('acad')) return 'bg-blue-50 text-blue-600 border-blue-100';
  if (name.includes('health') || name.includes('medic')) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
  if (name.includes('it') || name.includes('tech')) return 'bg-amber-50 text-amber-600 border-amber-100';
  return 'bg-zinc-50 text-zinc-600 border-zinc-100';
};

// --- Components ---

const StatsCard = ({ title, count, icon: Icon, color, bgColor, loading }: any) => (
  <div className="bg-white p-6 rounded-[1.5rem] border border-zinc-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300">
    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${bgColor} ${color}`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
      {loading ? (
        <Skeleton width="40px" height="24px" />
      ) : (
        <h3 className="text-2xl font-black text-zinc-900 leading-none">{count}</h3>
      )}
    </div>
  </div>
);

const EmployeeCard = ({ employee, onClick }: { employee: Employee, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center relative cursor-pointer"
  >
    {/* Status Indicator Dot */}
    <div className={`absolute top-6 right-6 h-2 w-2 rounded-full ${employee.is_active ? 'bg-emerald-400' : 'bg-rose-500'}`} />

    {/* Profile Initial */}
    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-black mb-4 shadow-lg shadow-blue-600/20">
      {employee.full_name.charAt(0)}
    </div>

    {/* Name & Designation */}
    <div className="mb-6">
      <h4 className="text-[14px] font-black text-zinc-900 tracking-tight">{employee.full_name}</h4>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-4 py-1.5 rounded-full border ${getDeptColor(employee.department?.dept_name)}`}>
        {employee.designation?.position_name || 'Personnel'}
      </p>
    </div>

    {/* Metrics Pills */}
    <div className="flex gap-2 w-full mb-8">
      <div className="flex-1 bg-emerald-50 border border-emerald-100/50 rounded-lg p-2 text-center">
        <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mb-1">Emp ID</p>
        <p className="text-[9px] font-black text-emerald-600">{employee.employee_code}</p>
      </div>
      <div className="flex-1 bg-zinc-50 border border-zinc-100/50 rounded-lg p-2 text-center">
        <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1">Join Date</p>
        <p className="text-[9px] font-black text-zinc-900">{new Date(employee.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>

    {/* Action Footer */}
    <div className="flex items-center gap-3 w-full">
      <button className="h-12 w-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-zinc-900/10">
        <Phone size={16} />
      </button>
      <button className="h-12 w-12 bg-zinc-50 text-zinc-400 rounded-xl flex items-center justify-center hover:bg-zinc-100 transition-all active:scale-95">
        <Filter size={16} />
      </button>
      <button
        onClick={onClick}
        className="flex-1 h-12 bg-white border border-zinc-100 text-zinc-400 rounded-xl flex items-center justify-center hover:text-zinc-900 hover:border-zinc-300 transition-all active:scale-95 shadow-sm"
      >
        <ShieldCheck size={18} />
      </button>
    </div>
  </div>
);

const EmployeeTable = ({ employees, onDetailClick, loading }: { employees: Employee[], onDetailClick: (emp: Employee) => void, loading: boolean }) => (
  <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm mt-8">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-50 bg-zinc-50/30">
            <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Name</th>
            <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Employee ID</th>
            <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phone</th>
            <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Join Date</th>
            <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Department</th>
            <th className="py-6 px-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50/50">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="p-8" colSpan={6}><Skeleton height={40} className="w-full" /></td>
              </tr>
            ))
          ) : employees.length === 0 ? (
            <tr>
              <td className="p-20 text-center" colSpan={6}>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No personnel records found</p>
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr
                key={emp.employee_id}
                onClick={() => onDetailClick(emp)}
                className="hover:bg-zinc-50 transition-colors group cursor-pointer border-b border-zinc-50/50 last:border-0"
              >
                <td className="py-5 px-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 border border-zinc-100 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-black">
                      {emp.full_name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-[13px] font-black text-zinc-900 group-hover:text-blue-600 transition-colors">{emp.full_name}</h5>
                      <p className="text-[10px] font-bold text-zinc-400 lowercase italic">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md tracking-wider border border-emerald-100/50">
                    {emp.employee_code}
                  </span>
                </td>
                <td className="py-5 px-8 text-[11px] font-bold text-zinc-500">
                  {emp.phone}
                </td>
                <td className="py-5 px-8 text-[11px] font-bold text-zinc-500">
                  {new Date(emp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-5 px-8 text-[11px]">
                  <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getDeptColor(emp.department?.dept_name)}`}>
                    {emp.department?.dept_name || 'General'}
                  </span>
                </td>
                <td className="py-5 px-8 text-right">
                  <button
                    onClick={() => onDetailClick(emp)}
                    className="h-8 w-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 transition-colors ml-auto"
                  >
                    <Dots size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const DetailModal = ({ employee, open, onClose }: { employee: Employee | null, open: boolean, onClose: () => void }) => {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (!open) setShowCard(false);
  }, [open]);

  if (!open || !employee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-70 overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-12 relative flex flex-col items-center max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button onClick={onClose} className="absolute top-10 right-10 text-zinc-400 hover:text-zinc-900 border border-zinc-100 p-2 rounded-xl transition-all print:hidden"><X size={24} /></button>

          {!showCard ? (
            <>
              <div className="h-32 w-32 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white text-5xl font-black mb-6 shadow-2xl shadow-blue-600/20">
                {employee.full_name.charAt(0)}
              </div>
              <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{employee.full_name}</h3>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mt-3 bg-blue-50 px-6 py-2 rounded-full border border-blue-100">{employee.designation?.position_name || 'No Designation'}</p>

              <div className="grid grid-cols-2 gap-8 w-full mt-12 pt-12 border-t border-zinc-100">
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ">Email Address</p>
                  <p className="text-sm font-bold text-zinc-900 truncate">{employee.email}</p>
                </div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Phone Access</p>
                  <p className="text-sm font-bold text-zinc-900">{employee.phone}</p>
                </div>
              </div>

              <div className="mt-10 w-full flex gap-4">
                <button
                  onClick={() => setShowCard(true)}
                  className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                  <CreditCard size={18} /> Generate ID Card
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-4 duration-500">
              <IDCard employee={{
                ...employee,
                join_date: new Date(employee.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                designation: { position_name: employee.designation?.position_name || 'Personnel' },
                department: { dept_name: employee.department?.dept_name || 'General' }
              }} />

              <div className="mt-8 flex gap-4 w-full px-8 print:hidden">
                <button
                  onClick={() => setShowCard(false)}
                  className="flex-1 h-14 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 hover:text-zinc-900 transition-all"
                >
                  Back to Profile
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  <Download size={18} /> Print Card
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState('10');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/employees');
      if (res.ok) {
        const data = await res.json();
        // Handle both Array response and { employees: Array } response
        const employeeArray = Array.isArray(data) ? data : (data.employees || []);
        setEmployees(employeeArray);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
      setEmployees([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = Array.isArray(employees) ? employees.filter(e => {
    const matchesSearch = (e.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.employee_code || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Active' ? e.is_active : !e.is_active);
    const matchesPriority = priorityFilter === 'All' || (e.priority === priorityFilter);
    return matchesSearch && matchesStatus && matchesPriority;
  }) : [];

  const stats = {
    total: Array.isArray(employees) ? employees.length : 0,
    new: Array.isArray(employees) ? employees.filter(e => (new Date().getTime() - new Date(e.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000).length : 0,
    male: Array.isArray(employees) ? employees.filter(e => e.gender === 'Male').length : 0,
    female: Array.isArray(employees) ? employees.filter(e => e.gender === 'Female').length : 0,
  };

  return (
    <ProtectedLayout>
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">

        {/* Header Section */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">Employee</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Employee" count={stats.total} icon={Users} color="text-indigo-600" bgColor="bg-indigo-50" loading={loading} />
          <StatsCard title="New Employee" count={stats.new} icon={UserPlus} color="text-amber-600" bgColor="bg-amber-50" loading={loading} />
          <StatsCard title="Male" count={stats.male} icon={UserIcon} color="text-blue-600" bgColor="bg-blue-50" loading={loading} />
          <StatsCard title="Female" count={stats.female} icon={UserIcon} color="text-rose-600" bgColor="bg-rose-50" loading={loading} />
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end mt-12 bg-white/50 p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Employee Name</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pl-6 pr-6 bg-white border border-zinc-100 rounded-2xl outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Select Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-14 px-6 bg-white border border-zinc-100 rounded-2xl outline-none focus:border-zinc-900 transition-all text-sm font-bold appearance-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Select Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full h-14 px-6 bg-white border border-zinc-100 rounded-2xl outline-none focus:border-zinc-900 transition-all text-sm font-bold appearance-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex gap-3 h-14">
            <button
              className="h-full w-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-900/10"
            >
              <Search size={20} />
            </button>
            <Link
              href="/employees/new"
              className="flex-1 h-full px-6 flex items-center justify-center gap-2 border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95"
            >
              + Add Employee
            </Link>
          </div>
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Show Entries</p>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(e.target.value)}
              className="h-10 px-4 bg-white border border-zinc-100 rounded-xl outline-none text-[10px] font-black uppercase cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="flex items-center p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`h-10 w-10 flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white rounded-lg shadow-sm text-blue-600' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`h-10 w-10 flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white rounded-lg shadow-sm text-blue-600' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'list' ? (
          <EmployeeTable
            employees={filtered.slice(0, parseInt(entriesPerPage))}
            loading={loading}
            onDetailClick={(emp) => {
              setSelectedEmployee(emp);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mt-8">
            {loading ? (
              [...Array(entriesPerPage === 'All' ? 10 : parseInt(entriesPerPage))].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm h-[320px]">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-3/4 mx-auto mt-6" />
                  <Skeleton className="h-3 w-1/2 mx-auto mt-2" />
                  <div className="flex gap-2 mt-8">
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-zinc-100">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No personnel records found</p>
              </div>
            ) : (
              filtered.slice(0, entriesPerPage === 'All' ? filtered.length : parseInt(entriesPerPage)).map((emp) => (
                <EmployeeCard
                  key={emp.employee_id}
                  employee={emp}
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setIsModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        )}

      </div>

      <DetailModal
        employee={selectedEmployee}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </ProtectedLayout>
  );
}
