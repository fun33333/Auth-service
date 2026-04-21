"use client";

import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import { fetchWithAuth } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, 
  Briefcase, GraduationCap, ShieldAlert,
  Building, Calendar, Plus, Trash2, CheckCircle2, 
  Database, Activity, ChevronRight, Landmark, CreditCard,
  UserCheck, History, Laptop, FileText, HeartPulse, Globe,
  ShieldCheck, CheckSquare, Layers, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import Skeleton from '@/components/Skeleton';

// --- Types ---
interface Institution { inst_code: string; name: string; }
interface Branch { branch_code: string; branch_name: string; institution_code: string; }
interface Department { dept_code: string; dept_name: string; }
interface Designation { position_code: string; position_name: string; }
interface Organization { org_code: string; name: string; }

interface AssignmentRow {
  institutionCode: string;
  branchCode: string;
  departmentCode: string;
  designationCode: string;
  joiningDate: string;
  shift: string;
  isPrimary: boolean;
  isActive: boolean;
  // UI Helpers
  branches: Branch[];
  designations: Designation[];
}

export default function NewEmployeeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Metadata Lists (Global)
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [formData, setFormData] = useState({
    // Personal Identity
    fullName: '',
    cnic: '',
    dob: '',
    gender: 'male',
    maritalStatus: 'single',
    nationality: 'Pakistani',
    religion: '',
    
    // Contact Info
    personalEmail: '',
    mobile: '',
    orgEmail: '',
    orgPhone: '',
    
    // Address Details
    residentialAddress: '',
    permanentAddress: '',
    city: '',
    state: '',
    
    // System Metadata
    organizationCode: 'IAK',
    isActive: true,
    
    // Bank Information
    bankName: '',
    accountNumber: '',
    
    // Security & Compliance
    emergencyName: '',
    emergencyPhone: '',
    resumeUrl: '',
  });

  // Dynamic Lists
  const [assignments, setAssignments] = useState<AssignmentRow[]>([
    { 
      institutionCode: '', branchCode: '', departmentCode: '', designationCode: '', 
      joiningDate: new Date().toISOString().split('T')[0], shift: 'general', 
      isPrimary: true, isActive: true, branches: [], designations: [] 
    }
  ]);
  const [education, setEducation] = useState([{ degree: '', institute: '', passingYear: '', grade: '' }]);
  const [experience, setExperience] = useState([{ employer: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '' }]);

  // Fetch initial metadata
  useEffect(() => {
    async function loadInitialMeta() {
      try {
        setFetchingMeta(true);
        const [instRes, deptRes, orgRes] = await Promise.all([
          fetchWithAuth('/employees/institutions'),
          fetchWithAuth('/employees/departments'),
          fetchWithAuth('/employees/organizations')
        ]);
        if (instRes.ok) setInstitutions(await instRes.json());
        if (deptRes.ok) setDepartments(await deptRes.json());
        if (orgRes.ok) setOrganizations(await orgRes.json());
      } catch (err) {
        console.error("Failed to load initial metadata:", err);
      } finally {
        setFetchingMeta(false);
      }
    }
    loadInitialMeta();
  }, []);

  const refreshBranchesForRow = async (index: number, instCode: string) => {
    if (!instCode) {
      const newAsgns = [...assignments];
      newAsgns[index].branches = [];
      setAssignments(newAsgns);
      return;
    }
    const res = await fetchWithAuth(`/branches?institution_code=${instCode}`);
    if (res.ok) {
      const data = await res.json();
      const newAsgns = [...assignments];
      newAsgns[index].branches = data;
      setAssignments(newAsgns);
    }
  };

  const refreshDesignationsForRow = async (index: number, deptCode: string) => {
    if (!deptCode) {
      const newAsgns = [...assignments];
      newAsgns[index].designations = [];
      setAssignments(newAsgns);
      return;
    }
    const res = await fetchWithAuth(`/employees/designations?department_code=${deptCode}`);
    if (res.ok) {
      const data = await res.json();
      const newAsgns = [...assignments];
      newAsgns[index].designations = data;
      setAssignments(newAsgns);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleAssignmentChange = (index: number, e: any) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    const newAsgns = [...assignments];
    (newAsgns[index] as any)[name] = finalVal;

    if (name === 'institutionCode') {
       newAsgns[index].branchCode = '';
       refreshBranchesForRow(index, finalVal);
    }
    if (name === 'departmentCode') {
       newAsgns[index].designationCode = '';
       refreshDesignationsForRow(index, finalVal);
    }

    setAssignments(newAsgns);
  };

  const addAssignmentRow = () => {
    setAssignments([...assignments, { 
      institutionCode: '', branchCode: '', departmentCode: '', designationCode: '', 
      joiningDate: new Date().toISOString().split('T')[0], shift: 'general', 
      isPrimary: false, isActive: true, branches: [], designations: [] 
    }]);
  };

  const removeAssignmentRow = (index: number) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const addEduRow = () => setEducation([...education, { degree: '', institute: '', passingYear: '', grade: '' }]);
  const removeEduRow = (index: number) => setEducation(education.filter((_, i) => i !== index));
  const handleEduChange = (index: number, e: any) => {
    const newEdu = [...education];
    newEdu[index] = { ...newEdu[index], [e.target.name]: e.target.value };
    setEducation(newEdu);
  };

  const addExpRow = () => setExperience([...experience, { employer: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '' }]);
  const removeExpRow = (index: number) => setExperience(experience.filter((_, i) => i !== index));
  const handleExpChange = (index: number, e: any) => {
    const newExp = [...experience];
    newExp[index] = { ...newExp[index], [e.target.name]: e.target.value };
    setExperience(newExp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { 
        ...formData, 
        assignments: assignments.map(({ branches, designations, ...rest }) => rest), 
        education: education.filter(e => e.degree), 
        experience: experience.filter(e => e.employer) 
      };
      
      const response = await fetchWithAuth('/employees/employees', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create employee");
      router.push('/employees/employees');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      window.scrollTo({ top: 0 }); 
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, icon: Icon, subtitle }: { title: string, icon: any, subtitle?: string }) => (
    <div className="flex items-center gap-4 mb-10">
       <div className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-900/10"><Icon size={24} /></div>
       <div>
          <h3 className="text-xl font-black text-zinc-900 leading-none lowercase tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100 inline-block">{subtitle}</p>}
       </div>
    </div>
  );

  const StepIndicator = () => {
    const steps = [
      { id: 1, label: 'Identity', icon: UserCheck },
      { id: 2, label: 'Contact', icon: Mail },
      { id: 3, label: 'Placement', icon: Briefcase },
      { id: 4, label: 'History', icon: History }
    ];

    return (
      <div className="flex items-center justify-between mb-12 px-2 relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-100 -z-10" />
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;

          return (
            <div key={s.id} className="flex flex-col items-center gap-3 bg-zinc-50 sm:bg-transparent px-2">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                isActive ? 'bg-zinc-900 text-white border-zinc-900 scale-110 shadow-2xl shadow-zinc-900/20' : 
                isCompleted ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-300 border-zinc-100'
              }`}>
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (fetchingMeta) return (
    <ProtectedLayout>
      <div className="p-10 max-w-5xl mx-auto space-y-12 animate-pulse">
         <Skeleton height={100} className="rounded-[2.5rem]" />
         <Skeleton height={500} className="rounded-[3rem]" />
      </div>
    </ProtectedLayout>
  );

  return (
    <ProtectedLayout>
      <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-10 pb-60">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/employees" className="h-14 w-14 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm hover:shadow-xl active:scale-90">
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tighter leading-none lowercase">enroll associate</h1>
              <p className="mt-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] opacity-60">protocol sequential.v2</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 px-5 py-2.5 rounded-full text-white">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step {currentStep} op_seq</span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert size={20} />
            <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        <StepIndicator />

        <form onSubmit={handleSubmit} className="relative">
          
          <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/40 min-h-[500px] flex flex-col">
            
            {/* STEP 1: IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <SectionHeader title="personal identity" icon={UserCheck} subtitle="Registry biological data" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">full name</label>
                    <input required name="fullName" value={formData.fullName} onChange={handleChange} className="input-premium" placeholder="e.g. john doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">cnic identification</label>
                    <input required name="cnic" value={formData.cnic} onChange={handleChange} className="input-premium" placeholder="xxxxx-xxxxxxx-x" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">date of birth</label>
                    <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-premium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">biometric gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="select-premium">
                        <option value="male">male</option>
                        <option value="female">female</option>
                        <option value="other">other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">marital registration</label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="select-premium">
                        <option value="single">single</option>
                        <option value="married">married</option>
                        <option value="divorced">divorced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">religion / belief</label>
                    <input name="religion" value={formData.religion} onChange={handleChange} className="input-premium" placeholder="e.g. islam" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONTACT & ADDRESS */}
            {currentStep === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <SectionHeader title="access & location" icon={Mail} subtitle="Correspondence endpoints" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.2em] border-l-4 border-zinc-900 pl-4">Digital Access</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">personal email</label>
                        <input required name="personalEmail" value={formData.personalEmail} onChange={handleChange} className="input-premium" placeholder="email@domain.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">mobile frequency</label>
                        <input required name="mobile" value={formData.mobile} onChange={handleChange} className="input-premium" placeholder="+92 xxxxxxxxxx" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.2em] border-l-4 border-zinc-900 pl-4">Registry Residency</h4>
                    <div className="space-y-4">
                       <textarea name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} rows={3} className="textarea-premium" placeholder="residential node" />
                       <div className="grid grid-cols-2 gap-4">
                          <input name="city" value={formData.city} onChange={handleChange} className="input-premium" placeholder="city" />
                          <input name="state" value={formData.state} onChange={handleChange} className="input-premium" placeholder="state" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PLACEMENT */}
            {currentStep === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <SectionHeader title="job assignments" icon={Briefcase} subtitle="Operational placement" />
                
                <div className="space-y-6">
                   <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 flex flex-col sm:flex-row gap-6">
                      <div className="flex-1 space-y-2">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">master organization</label>
                         <select name="organizationCode" value={formData.organizationCode} onChange={handleChange} className="select-premium">
                            {organizations.map(org => (<option key={org.org_code} value={org.org_code}>{org.name.toLowerCase()}</option>))}
                         </select>
                      </div>
                      <div className="flex items-center gap-4 px-4 h-full pt-6">
                         <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-5 w-5 rounded-lg border-zinc-200 text-zinc-900" />
                         <label htmlFor="isActive" className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">Active dossier</label>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {assignments.map((asgn, i) => (
                        <div key={i} className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/20 space-y-8 relative group">
                           {i > 0 && <button type="button" onClick={() => removeAssignmentRow(i)} className="absolute top-6 right-6 h-10 w-10 text-zinc-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">institution</label>
                                <select required name="institutionCode" value={asgn.institutionCode} onChange={(e) => handleAssignmentChange(i, e)} className="select-premium">
                                  <option value="">select inst...</option>
                                  {institutions.map(inst => (<option key={inst.inst_code} value={inst.inst_code}>{inst.name.toLowerCase()}</option>))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">branch hub</label>
                                <select name="branchCode" value={asgn.branchCode} onChange={(e) => handleAssignmentChange(i, e)} className="select-premium disabled:opacity-30" disabled={!asgn.institutionCode}>
                                  <option value="">default / node...</option>
                                  {asgn.branches.map(b => (<option key={b.branch_code} value={b.branch_code}>{b.branch_name.toLowerCase()}</option>))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">department</label>
                                <select required name="departmentCode" value={asgn.departmentCode} onChange={(e) => handleAssignmentChange(i, e)} className="select-premium">
                                  <option value="">select dept...</option>
                                  {departments.map(d => (<option key={d.dept_code} value={d.dept_code}>{d.dept_name.toLowerCase()}</option>))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">official designation</label>
                                <select required name="designationCode" value={asgn.designationCode} onChange={(e) => handleAssignmentChange(i, e)} className="select-premium disabled:opacity-30" disabled={!asgn.departmentCode}>
                                  <option value="">select role...</option>
                                  {asgn.designations.map(des => (<option key={des.position_code} value={des.position_code}>{des.position_name.toLowerCase()}</option>))}
                                </select>
                              </div>
                           </div>
                        </div>
                      ))}
                      <button type="button" onClick={addAssignmentRow} className="w-full py-6 border-2 border-dashed border-zinc-100 rounded-[2.5rem] text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-3">
                         <Plus size={18} /> Add Secondary Assignment
                      </button>
                   </div>
                </div>
              </div>
            )}

            {/* STEP 4: HISTORY & FINANCIAL */}
            {currentStep === 4 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <SectionHeader title="compliance & history" icon={History} subtitle="Educational & financial audit" />
                
                <div className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Master Financials</h4>
                         <div className="space-y-4">
                            <input name="bankName" value={formData.bankName} onChange={handleChange} className="input-premium" placeholder="bank institution name" />
                            <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="input-premium" placeholder="account / iban identifier" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Emergency Comms</h4>
                         <div className="space-y-4">
                            <input name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="input-premium" placeholder="contact full name" />
                            <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className="input-premium" placeholder="emergency frequency" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6 pt-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Educational Registry</h4>
                         <button type="button" onClick={addEduRow} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">+ link degree</button>
                      </div>
                      <div className="space-y-4">
                        {education.map((edu, idx) => (
                           <div key={idx} className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 grid grid-cols-1 sm:grid-cols-4 gap-4 relative group">
                              <input name="degree" value={edu.degree} onChange={(e) => handleEduChange(idx, e)} className="input-premium-mini" placeholder="degree" />
                              <input name="institute" value={edu.institute} onChange={(e) => handleEduChange(idx, e)} className="input-premium-mini" placeholder="institute" />
                              <input name="passingYear" value={edu.passingYear} onChange={(e) => handleEduChange(idx, e)} className="input-premium-mini" placeholder="year" />
                              <input name="grade" value={edu.grade} onChange={(e) => handleEduChange(idx, e)} className="input-premium-mini" placeholder="gpa/grade" />
                              {idx > 0 && <button type="button" onClick={() => removeEduRow(idx)} className="absolute -top-3 -right-3 h-8 w-8 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>}
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* SPACER FOR FIXED BOTTOM NAV */}
            <div className="flex-1 min-h-[100px]" />

            {/* ACTION BAR (Internal to card) */}
            <div className="flex items-center justify-between mt-auto pt-10 border-t border-zinc-100">
               <button 
                type="button" 
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
                className="flex items-center gap-3 text-[10px] font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-[0.2em] transition-all"
               >
                 {currentStep > 1 ? <><ChevronLeft size={16} /> Previous Sequence</> : 'Cancel Operation'}
               </button>
               <button 
                type="submit" 
                disabled={loading}
                className="px-12 py-5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-95 shadow-2xl shadow-zinc-900/20 shadow-blue-600/10"
               >
                 {loading ? 'Processing...' : currentStep === 4 ? 'Commit Record' : 'Continue Integration'}
                 {currentStep < 4 && !loading && <ChevronRight size={18} />}
               </button>
            </div>

          </div>

        </form>

      </div>

      <style jsx>{`
        .input-premium { @apply w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:shadow-xl transition-all; }
        .textarea-premium { @apply w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white focus:shadow-xl transition-all resize-none; }
        .select-premium { @apply w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] font-black text-zinc-900 uppercase tracking-widest outline-none cursor-pointer appearance-none focus:border-zinc-900 focus:bg-white transition-all; }
        .input-premium-mini { @apply w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none border-transparent focus:border-zinc-900 transition-all; }
      `}</style>
    </ProtectedLayout>
  );
}
