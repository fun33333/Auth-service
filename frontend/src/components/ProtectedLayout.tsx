"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  LayoutDashboard, 
  LogOut, 
  Building2, 
  Menu,
  X,
  Bell,
  Search,
  GitBranch,
  LayoutGrid,
  Briefcase,
  Moon,
  ChevronDown,
  User as UserIcon,
  Settings,
  Sun
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  // Initialize Dark Mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!isAuthenticated) return null; // Wait for redirect or layout

  const navLinks = [
    { name: 'Dashboard',    icon: LayoutDashboard, href: '/' },
    { name: 'Institutions', icon: Building2,        href: '/institutions' },
    { name: 'Branches',     icon: GitBranch,        href: '/branches' },
    { name: 'Departments',  icon: LayoutGrid,       href: '/departments' },
    { name: 'Designations', icon: Briefcase,        href: '/designations' },
    { name: 'Employees',    icon: Users,            href: '/employees' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-sidebar text-zinc-600 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 border-r border-zinc-100 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 shrink-0 px-6 border-b border-zinc-100">
          <Link href="/" className="flex items-center space-x-2.5 text-zinc-900 font-bold text-xl tracking-tight">
            <div className="bg-blue-600/10 p-1.5 rounded-lg border border-blue-600/20">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span>EMS Portal</span>
          </Link>
          <button className="lg:hidden text-zinc-400" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-8">
          <div className="mb-8 flex items-center space-x-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 truncate w-32">{user?.full_name}</p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest truncate w-32">{user?.designation || 'Administrator'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              
              // Only exact match for home to prevent it being active everywhere
              const isTrulyActive = link.href === '/' ? pathname === '/' : isActive;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all border border-transparent ${
                    isTrulyActive
                      ? 'sidebar-link-active'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-blue-600'
                  }`}
                >
                  <Icon size={18} className={isTrulyActive ? 'text-blue-600' : 'text-zinc-400'} />
                  <span className="font-bold text-[14px] tracking-tight">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-100 bg-white">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 text-zinc-500 hover:text-red-600 w-full px-4 py-2.5 rounded-xl hover:bg-red-50 transition font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full relative">
        <header className="h-16 shrink-0 glass-header flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 hover:text-slate-700 lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center">
            <div className="relative text-slate-400 focus-within:text-blue-600 hidden md:block mr-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="pl-10 pr-4 py-2 border-slate-200 dark:border-zinc-800 border rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-600/50 bg-slate-50 dark:bg-zinc-900 focus:bg-white transition"
              />
            </div>
            
            <div className="flex items-center space-x-5 mr-5 border-r border-slate-200 dark:border-zinc-800 pr-5">
              <button className="relative text-slate-500 hover:text-blue-600 transition">
                <Bell size={20} strokeWidth={1.5} />
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-white dark:border-zinc-900">13</span>
              </button>

              <button 
                onClick={toggleDarkMode}
                className="text-slate-500 hover:text-blue-600 transition"
              >
                {isDarkMode ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
              </button>
            </div>

            <div className="relative">
              <div 
                className="flex items-center space-x-3 pr-4 pl-1.5 py-1.5 border border-slate-200 dark:border-zinc-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition select-none"
                onClick={() => setProfileOpen(!isProfileOpen)}
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DU'}
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-slate-700">{user?.full_name || 'Demo User'}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3">
                      <p className="text-[15px] font-bold text-slate-900 truncate">{user?.full_name || 'Demo User'}</p>
                      <p className="text-sm text-slate-500 truncate mt-0.5">{user?.designation || 'Manager'}</p>
                    </div>
                    
                    <div className="h-px bg-slate-50 my-1"></div>

                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center w-full px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer mt-1">
                      <UserIcon size={18} className="mr-3 text-slate-500" strokeWidth={1.5} /> My Profile
                    </Link>
                    <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center w-full px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer mb-1">
                      <Settings size={18} className="mr-3 text-slate-500" strokeWidth={1.5} /> Settings
                    </Link>
                    
                    <div className="h-px bg-slate-50 my-1"></div>
                    
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                    >
                      <LogOut size={18} className="mr-3 text-red-500" strokeWidth={1.5} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
