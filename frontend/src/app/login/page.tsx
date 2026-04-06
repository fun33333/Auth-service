"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/api";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Mock Login logic for standalone frontend mode
      await new Promise(resolve => setTimeout(resolve, 800));

      if (employeeCode.length > 0 && password.length > 0) {
        login("mock-jwt-token-xyz123", {
          id: "1",
          code: employeeCode,
          full_name: "Demo User",
          email: "demo@example.com",
          is_superadmin: true,
          department: "Administration",
          designation: "Manager"
        });
      } else {
        setError("Please enter any test code and password.");
      }
    } catch (err) {
      setError("Network or server error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen items-center justify-center p-4">
      <div className="md:w-full md:max-w-md bg-white rounded-2xl shadow-xl overflow-hidden shadow-slate-200/50">
        <div className="bg-linear-to-r p-8 from-indigo-600 to-indigo-800 text-center text-white">
          <div className="inline-flex h-16 w-16 bg-white/20 items-center justify-center rounded-full mb-4 shadow-inner">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-bold text-3xl">Portal Login</h1>
          <p className="mt-2 text-indigo-100">Employee Management System</p>
        </div>

        <div className="p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="flex text-sm bg-red-50 text-red-600 border border-red-200 p-3 items-center rounded-lg">
                <AlertCircle className="mr-2 w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="employeeCode"
                className="font-medium text-sm text-slate-700 block mb-2"
              >
                Employee Code
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 pl-3 items-center pointer-events-none text-slate-400">
                  <User size={20} />
                </div>
                <input
                  id="employeeCode"
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full text-slate-900 border-slate-300 py-2.5 rounded-lg border pl-10 pr-3 focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition outline-none"
                  placeholder="e.g. EMP12345"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="font-medium text-sm text-slate-700 block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="flex absolute inset-y-0 left-0 pl-3 items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-slate-900 border-slate-300 py-2.5 rounded-lg border pl-10 pr-3 focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 font-medium text-white shadow-lg py-3 rounded-lg hover:bg-indigo-700 flex justify-center items-center shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="mr-3 w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
