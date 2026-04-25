"use client";

import React, { useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Phone, Globe, Fingerprint, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const PK_PHONE_RE = /^(\+92|92|0|0092)?3\d{2}-?\d{7}$/;

const INST_TYPES = [
  { value: "educational", label: "Educational" },
  { value: "healthcare", label: "Healthcare" },
  { value: "social_welfare", label: "Social Welfare" },
  { value: "administrative", label: "Administrative" },
  { value: "technical", label: "Technical / Vocational" },
  { value: "operational", label: "Operational / Project Site" },
  { value: "other", label: "Other" },
];

const ORGS = [
  { value: "IAK", label: "Alkhair (IAK)" },
  { value: "EDHI", label: "Edhi Foundation (EDHI)" },
  { value: "SMIT", label: "Saylani (SMIT)" },
  { value: "BQ", label: "Bano Qabil (BQ)" },
];

const schema = z.object({
  organization_code: z.string().min(1, "Parent organization is required"),
  inst_code: z.string().trim().min(1, "Institution code is required").max(20),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  inst_type: z.enum(["educational", "healthcare", "social_welfare", "administrative", "technical", "operational", "other"]),
  address: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  contact_number: z.string().trim().optional().or(z.literal(""))
    .refine(v => !v || PK_PHONE_RE.test(v), "Invalid PK phone (e.g. 03001234567)"),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function NewInstitutionForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register, handleSubmit, setValue, watch, setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { organization_code: "", inst_code: "", name: "", inst_type: "educational", address: "", city: "", contact_number: "" },
  });
  const orgValue = watch("organization_code");

  const submit: SubmitHandler<FormOutput> = async (data) => {
    setSubmitError(null);
    const payload = {
      organization_code: data.organization_code,
      inst_code: data.inst_code.trim(),
      name: data.name.trim(),
      inst_type: data.inst_type,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      contact_number: data.contact_number?.trim() || null,
    };
    try {
      const res = await fetchWithAuth("/employees/institutions", { method: "POST", body: JSON.stringify(payload) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/institutions");
        return;
      }
      if (body?.field_errors) {
        Object.entries(body.field_errors).forEach(([k, v]) => setError(k as any, { message: v as string }));
        return;
      }
      if (Array.isArray(body?.detail)) {
        setSubmitError(body.detail.map((d: any) => d?.msg || JSON.stringify(d)).join("; "));
        return;
      }
      setSubmitError(typeof body?.error === "string" ? body.error : "Failed to save institution.");
    } catch (err: any) {
      setSubmitError(err?.message || "Network error");
    }
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold transition-all outline-none ${
      err ? "border-rose-400 ring-4 ring-rose-50" : "border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
    }`;
  const iconInputCls = (err?: string) =>
    `w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold transition-all outline-none ${
      err ? "border-rose-400 ring-4 ring-rose-50" : "border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
    }`;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/institutions" className="group p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Institution</h1>
                <p className="text-sm text-slate-500">Configure a new functional entity within the system.</p>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm font-bold text-rose-700">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                <div className="relative z-10">
                  <ShieldCheck className="text-indigo-300 mb-4" size={32} />
                  <h3 className="text-xl font-bold mb-2">Institutional Integrity</h3>
                  <p className="text-indigo-100/80 text-sm leading-relaxed">
                    Ensure the Institution Code matches your internal registry. It is used across financial and employee mappings.
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-800 rounded-full opacity-50" />
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Guidelines</h4>
                <ul className="space-y-3">
                  {["Unique Institution Code", "Valid Physical Address", "Assigned Organization"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(submit)} className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Building2 size={18} /></div>
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Identity & Governance</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Parent Organization</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ORGS.map(org => (
                          <button
                            key={org.value} type="button"
                            onClick={() => setValue("organization_code", org.value, { shouldValidate: true })}
                            className={`py-3 px-2 rounded-2xl border-2 text-[10px] font-black transition-all ${
                              orgValue === org.value
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md"
                                : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                            }`}
                          >
                            {org.label}
                          </button>
                        ))}
                      </div>
                      {errors.organization_code && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase ml-1 italic">{errors.organization_code.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Institution Code</label>
                        <div className="relative">
                          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input {...register("inst_code")} className={iconInputCls(errors.inst_code?.message)} placeholder="IAK-001" />
                        </div>
                        {errors.inst_code && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase ml-1 italic">{errors.inst_code.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Formal Name</label>
                        <input {...register("name")} className={inputCls(errors.name?.message)} placeholder="Public School System" />
                        {errors.name && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase ml-1 italic">{errors.name.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Institution Type</label>
                      <select {...register("inst_type")} className={inputCls(errors.inst_type?.message)}>
                        {INST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPin size={18} /></div>
                    <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Communication & Reach</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input {...register("city")} placeholder="City" className={iconInputCls(errors.city?.message)} />
                        </div>
                      </div>
                      <div>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input {...register("contact_number")} placeholder="03001234567" className={iconInputCls(errors.contact_number?.message)} />
                        </div>
                        {errors.contact_number && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase ml-1 italic">{errors.contact_number.message}</p>}
                      </div>
                    </div>
                    <textarea {...register("address")} placeholder="Full Physical Address..." rows={2}
                      className={`${inputCls(errors.address?.message)} resize-none`} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pb-10">
                  <Link href="/institutions" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                    Discard
                  </Link>
                  <button type="submit" disabled={isSubmitting}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                    {isSubmitting ? "Processing..." : "Deploy Institution"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
