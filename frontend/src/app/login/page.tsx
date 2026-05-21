"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Lock, User, LogIn, AlertCircle, Eye, EyeOff,
  Building2, Layers, Briefcase, Users,
} from "lucide-react";

export default function LoginPage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_code: employeeCode, password }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        login(data.access_token, data.employee);
      } else {
        setError(data.detail || data.error || "Invalid credentials");
      }
    } catch {
      setError("Backend server se connection nahi ho paa raha.");
    } finally {
      setIsLoading(false);
    }
  };

  const a = (delay: number) =>
    `transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    } [transition-delay:${delay}ms]`;

  const features = [
    { icon: Building2, label: "Institution Mgmt", sub: "Multi-branch" },
    { icon: Layers,    label: "Department Mgmt",  sub: "Structured"   },
    { icon: Briefcase, label: "Designation Mgmt", sub: "Roles"        },
    { icon: Users,     label: "Employee Mgmt",    sub: "Full lifecycle"},
  ];

  return (
    <>
      <style>{`
        /* ── keyframes ── */
        @keyframes dotBlink {
          0%, 80%, 100% { opacity: .25 }
          40%           { opacity: 1   }
        }
        @keyframes orbDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(22px,16px) scale(1.06); }
        }
        @keyframes orbDrift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-18px,12px) scale(1.08); }
        }
        @keyframes particleRise {
          0%   { transform: translateY(105vh) scale(0); opacity:0; }
          6%   { opacity:.7; }
          94%  { opacity:.7; }
          100% { transform: translateY(-8vh) scale(1); opacity:0; }
        }
        @keyframes wrapIn {
          from { opacity:0; transform: scale(.96) translateY(20px); }
          to   { opacity:1; transform: scale(1)   translateY(0); }
        }
        @keyframes logoIn {
          from { transform: scale(.55) rotate(-12deg); opacity:0; }
          to   { transform: scale(1)   rotate(0deg);  opacity:1; }
        }
        @keyframes blobPulse {
          from { transform: scale(1)    rotate(0deg);  opacity:.08; }
          to   { transform: scale(1.14) rotate(14deg); opacity:.14; }
        }
        @keyframes sweep {
          0%   { left:-70%; }
          55%  { left:130%; }
          100% { left:130%; }
        }
        @keyframes topBar {
          0%   { background-position: 200% center; }
          100% { background-position:-200% center; }
        }

        /* ── bg scene ── */
        .ems-scene {
          position:fixed; inset:0; z-index:0; overflow:hidden; pointer-events:none;
        }
        .ems-orb {
          position:absolute; border-radius:50%; filter:blur(70px);
        }
        .ems-orb-1 {
          width:440px; height:440px; top:-130px; left:-100px;
          background:rgba(107,63,105,.13);
          animation: orbDrift1 13s ease-in-out infinite;
        }
        .ems-orb-2 {
          width:300px; height:300px; bottom:-80px; right:-60px;
          background:rgba(107,63,105,.10);
          animation: orbDrift2 10s ease-in-out infinite;
        }
        .ems-grid {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(107,63,105,.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,63,105,.022) 1px, transparent 1px);
          background-size:44px 44px;
        }
        .ems-particle {
          position:fixed; border-radius:50%; pointer-events:none; z-index:0;
          animation: particleRise linear infinite;
        }

        /* ── outer card ── */
        .ems-wrap {
          position:relative; z-index:1;
          width:100%; max-width:860px;
          background:#fff;
          border-radius:24px;
          display:flex;
          flex-direction: column;       /* mobile: stack vertically */
          overflow:hidden;
          box-shadow: 0 28px 72px rgba(0,0,0,.12), 0 4px 20px rgba(0,0,0,.07);
          animation: wrapIn .7s cubic-bezier(.22,1,.36,1) both;
        }
        /* top shimmer bar */
        .ems-wrap::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px; z-index:10;
          background: linear-gradient(90deg, var(--color-theme-800) 0%, #9b59b6 40%, #c084fc 60%, var(--color-theme-800) 100%);
          background-size:200% auto;
          animation: topBar 3.5s linear infinite;
        }

        /* ── LEFT panel ── */
        .ems-left {
          width:100%;                   /* mobile: full width */
          background: linear-gradient(148deg, #7b3f91 0%, var(--color-theme-800) 48%, #4e2259 100%);
          padding: 32px 24px;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          position:relative; overflow:hidden;
          border-radius: 20px 20px 0 0;  /* mobile: round top only */
        }

        /* blobs */
        .ems-blob {
          position:absolute; border-radius:50%;
          background:rgba(255,255,255,.07);
          animation: blobPulse ease-in-out infinite alternate;
        }
        .ems-blob-1 { width:200px; height:200px; top:-70px; left:-55px;  animation-duration:7s; }
        .ems-blob-2 { width:140px; height:140px; bottom:-45px; right:-35px; animation-duration:9s; animation-delay:-3s; }
        .ems-blob-3 { width:80px;  height:80px;  bottom:70px; left:18px; animation-duration:5s; animation-delay:-1s; }

        /* sweep shimmer */
        .ems-left::after {
          content:'';
          position:absolute; top:0; bottom:0; width:55%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
          animation: sweep 5s ease-in-out infinite;
          pointer-events:none;
        }

        /* logo icon */
        .ems-logo-icon {
          width:56px; height:56px; border-radius:16px;
          background:rgba(255,255,255,.18);
          border:1.5px solid rgba(255,255,255,.28);
          display:flex; align-items:center; justify-content:center;
          backdrop-filter:blur(8px);
          margin-bottom:16px;
          animation: logoIn .65s .2s cubic-bezier(.22,1,.36,1) both;
          position:relative; overflow:hidden; flex-shrink:0;
        }
        .ems-logo-icon::after {
          content:'';
          position:absolute; top:-28%; left:-18%;
          width:48%; height:48%;
          background:rgba(255,255,255,.22); border-radius:50%;
          filter:blur(8px);
        }

        /* feature rows — hidden on very small, shown from sm up */
        .ems-features-wrap {
          width:100%;
          position:relative; z-index:1;
          display: none;   /* hidden on mobile by default */
        }

        .ems-feat {
          display:flex; align-items:center; gap:12px;
          width:100%;
          padding:9px 13px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.14);
          border-radius:12px;
          margin-bottom:8px;
          cursor:default;
          transition:background .25s, transform .25s;
          backdrop-filter:blur(4px);
        }
        .ems-feat:hover { background:rgba(255,255,255,.18); transform:translateX(4px); }
        .ems-feat-icon {
          width:32px; height:32px; border-radius:9px;
          background:rgba(255,255,255,.15);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .ems-feat-lbl  { font-size:12.5px; font-weight:600; color:#fff; }
        .ems-feat-sub  { font-size:10.5px; color:rgba(255,255,255,.55); margin-left:auto; }

        /* ── RIGHT panel ── */
        .ems-right {
          flex:1;
          padding: 28px 24px 32px;     /* mobile padding */
          display:flex; flex-direction:column; justify-content:center;
        }

        /* inputs */
        .ems-input {
          width:100%; height:46px;
          padding-left:40px; padding-right:14px;
          border-radius:11px;
          border:1.5px solid #e8eaf2;
          background:#f4f6fb;
          font-size:14px; color:#1a1a2e;
          outline:none;
          transition:border-color .22s, background .22s, box-shadow .22s;
        }
        .ems-input::placeholder { color:#c0c5d8; font-size:13px; }
        .ems-input:focus {
          border-color:var(--color-theme-800);
          background:#f9f5fb;
          box-shadow:0 0 0 3px rgba(107,63,105,.10);
        }

        /* submit btn */
        .ems-btn {
          width:100%; height:46px;
          border-radius:12px; border:none;
          background:var(--color-theme-800); color:#fff;
          font-size:15px; font-weight:600;
          display:flex; align-items:center; justify-content:center; gap:8px;
          cursor:pointer;
          box-shadow:0 6px 20px rgba(107,63,105,.32);
          transition:background .2s, transform .2s, box-shadow .2s;
          position:relative; overflow:hidden;
        }
        .ems-btn::before {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 60%);
          pointer-events:none;
        }
        .ems-btn:hover:not(:disabled) {
          background:#7d4a7b; transform:translateY(-2px);
          box-shadow:0 10px 28px rgba(107,63,105,.38);
        }
        .ems-btn:active:not(:disabled) { transform:translateY(0); }
        .ems-btn:disabled { opacity:.6; cursor:not-allowed; }

        /* dot loader */
        .ems-dots span {
          display:inline-block; width:5px; height:5px;
          border-radius:50%; background:#fff; margin:0 2.5px;
          animation: dotBlink 1.2s infinite;
        }
        .ems-dots span:nth-child(2) { animation-delay:.2s; }
        .ems-dots span:nth-child(3) { animation-delay:.4s; }

        /* or divider */
        .ems-or {
          display:flex; align-items:center; gap:12px;
          margin-bottom: 16px;
        }
        .ems-or::before,.ems-or::after {
          content:''; flex:1; height:1px; background:#e8eaf0;
        }

        /* ══════════════════════════════════
           TABLET  ≥ 540px
           Show feature list in left panel
        ══════════════════════════════════ */
        @media (min-width: 540px) {
          .ems-features-wrap { display: block; }

          .ems-left {
            padding: 36px 28px;
          }
          .ems-right {
            padding: 36px 32px 40px;
          }
        }

        /* ══════════════════════════════════
           DESKTOP  ≥ 700px
           Side-by-side layout
        ══════════════════════════════════ */
        @media (min-width: 700px) {
          .ems-wrap {
            flex-direction: row;        /* side by side */
            min-height: 520px;
          }
          .ems-left {
            width: 42%; flex-shrink: 0;
            padding: 44px 36px;
            border-radius: 20px;
            margin: 8px 0 8px 8px;     /* floating card effect */
          }
          .ems-right {
            padding: 52px 48px;
          }
        }
      `}</style>

      {/* BG scene */}
      <div className="ems-scene">
        <div className="ems-orb ems-orb-1" />
        <div className="ems-orb ems-orb-2" />
      </div>
      <div className="ems-grid" />

      {/* Particles */}
      {mounted && Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="ems-particle"
          style={{
            width:  `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`,
            left:   `${Math.random() * 100}%`,
            background: `rgba(107,63,105,${.1 + Math.random() * .12})`,
            animationDuration: `${14 + Math.random() * 18}s`,
            animationDelay:    `${Math.random() * 14}s`,
          }}
        />
      ))}

      {/* Page shell */}
      <div
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        style={{ background: "#dfdddd", position: "relative", zIndex: 1 }}
      >
        <div className="ems-wrap">

          {/* ════ LEFT ════ */}
          <div className="ems-left">
            <div className="ems-blob ems-blob-1" />
            <div className="ems-blob ems-blob-2" />
            <div className="ems-blob ems-blob-3" />

            {/* Logo */}
            <div className={`ems-logo-icon ${a(0)}`}>
              <Lock className="w-6 h-6 text-white" />
            </div>

            <h2
              className={`text-xl font-extrabold text-white text-center mb-2 ${a(80)}`}
              style={{ position: "relative", zIndex: 1 }}
            >
              Welcome Back!
            </h2>
            <p
              className={`text-[12.5px] text-white/70 text-center leading-relaxed mb-5 max-w-[260px] ${a(140)}`}
              style={{ position: "relative", zIndex: 1 }}
            >
              Enter your personal details to use all of the EMS features and manage your workforce efficiently.
            </p>

            {/* Feature list — hidden on mobile, shown ≥540px */}
            <div className={`ems-features-wrap ${a(200)}`}>
              {features.map(({ icon: Icon, label, sub }, i) => (
                <div key={label} className="ems-feat" style={{ transitionDelay: `${200 + i * 55}ms` }}>
                  <div className="ems-feat-icon">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="ems-feat-lbl">{label}</span>
                  <span className="ems-feat-sub">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ════ RIGHT ════ */}
          <div className="ems-right">

            <div className={a(60)}>
              <h1 className="text-2xl sm:text-[28px] font-bold text-[#1a1a2e] mb-1">LOGIN IN</h1>
              <p className="text-[13px] text-slate-400 mb-6">Access your EMS dashboard</p>
            </div>

            <div className={`ems-or ${a(180)}`}>
              <span className="text-[11.5px] text-slate-400 whitespace-nowrap">use your employee credentials</span>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 13 }}>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200
                                text-red-600 text-[12px] rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Employee Code */}
              <div className={a(240)}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="Employee Code (e.g. AIT01-G-26-T-0001)"
                    className="ems-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className={a(300)}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="ems-input"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                               hover:text-theme-800 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye    className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className={a(420)}>
                <button type="submit" disabled={isLoading} className="ems-btn">
                  {isLoading ? (
                    <div className="ems-dots"><span /><span /><span /></div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      LOGIN IN
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </>
  );
}
