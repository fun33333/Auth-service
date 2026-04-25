"use client";

import React, { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { fetchWithAuth } from "@/utils/api";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const PK_PHONE_RE = /^(\+92|92|0|0092)?3\d{2}-?\d{7}$/;

const INST_TYPES = [
  { value: "educational", label: "Educational (School, College, University)" },
  { value: "healthcare", label: "Healthcare (Hospital, Clinic, Lab)" },
  { value: "social_welfare", label: "Social Welfare (Kitchen, Shelter, Center)" },
  { value: "administrative", label: "Administrative (Office, branch)" },
  { value: "technical", label: "Technical / Vocational" },
  { value: "operational", label: "Operational / Project Site" },
  { value: "other", label: "Other" },
];

const schema = z.object({
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

export default function EditInstitutionForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, reset, setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { inst_code: "", name: "", inst_type: "educational", address: "", city: "", contact_number: "" },
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchWithAuth(`/employees/institutions/${id}`);
        if (!res.ok) {
          setLoadError("Failed to load institution");
          return;
        }
        const data = await res.json();
        reset({
          inst_code: data.inst_code || "",
          name: data.name || "",
          inst_type: data.inst_type || "educational",
          address: data.address || "",
          city: data.city || "",
          contact_number: data.contact_number || "",
        });
      } catch (err) {
        console.error(err);
        setLoadError("Error loading institution");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset]);

  const submit: SubmitHandler<FormOutput> = async (data) => {
    setSubmitError(null);
    const payload = {
      inst_code: data.inst_code.trim(),
      name: data.name.trim(),
      inst_type: data.inst_type,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      contact_number: data.contact_number?.trim() || null,
    };
    try {
      const res = await fetchWithAuth(`/employees/institutions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) { router.push("/institutions"); return; }
      if (body?.field_errors) {
        Object.entries(body.field_errors).forEach(([k, v]) => setError(k as any, { message: v as string }));
        return;
      }
      if (Array.isArray(body?.detail)) {
        setSubmitError(body.detail.map((d: any) => d?.msg || JSON.stringify(d)).join("; "));
        return;
      }
      setSubmitError(typeof body?.error === "string" ? body.error : "Failed to update institution.");
    } catch (err: any) {
      setSubmitError(err?.message || "Network error");
    }
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none transition-shadow text-sm ${
      err ? "border-rose-400 ring-rose-100" : "border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
    }`;

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-6 lg:p-10 max-w-4xl mx-auto">
          <div className="text-center text-slate-500">Loading institution data...</div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center space-x-4">
          <Link href="/institutions" className="p-2 rounded-full hover:bg-slate-200 transition bg-slate-100 text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Institution</h1>
            <p className="text-sm text-slate-500">Update institution details and settings.</p>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-medium shadow-sm">
            {loadError}
          </div>
        )}
        {submitError && (
          <div className="bg-rose-50 text-rose-700 border border-rose-200 p-4 rounded-xl text-sm font-medium shadow-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
              Basic Information
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Institution Code <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. AKS01" {...register("inst_code")} className={inputCls(errors.inst_code?.message)} />
                  {errors.inst_code ? (
                    <p className="text-[11px] font-bold text-rose-500 mt-1 ml-1">{errors.inst_code.message}</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Unique identifier for this institution</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Institution Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Al-Khair Secondary School" {...register("name")} className={inputCls(errors.name?.message)} />
                  {errors.name && <p className="text-[11px] font-bold text-rose-500 mt-1 ml-1">{errors.name.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Institution Type <span className="text-red-500">*</span></label>
                <select {...register("inst_type")} className={inputCls(errors.inst_type?.message)}>
                  {INST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
              Contact & Location
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <textarea rows={3} placeholder="Street address and building details" {...register("address")} className={inputCls(errors.address?.message)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input type="text" placeholder="e.g. Karachi" {...register("city")} className={inputCls(errors.city?.message)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                  <input type="tel" placeholder="03001234567" {...register("contact_number")} className={inputCls(errors.contact_number?.message)} />
                  {errors.contact_number && <p className="text-[11px] font-bold text-rose-500 mt-1 ml-1">{errors.contact_number.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 justify-end">
            <Link href="/institutions" className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-[0_4px_10px_rgba(79,70,229,0.25)] hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
