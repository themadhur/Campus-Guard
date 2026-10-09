import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Building2,
  FileText,
  User,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'home' | 'report' | 'track' | 'admin' | 'my-reports';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin, isDemoAdmin, user, profile, signOut } = useAuth();

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0];
  const isLoggedIn = Boolean(user || profile);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Campus Guard</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Report. Track. Improve.</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('track')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'track'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              Track Complaint
            </button>

            {/* My Reports (For signed in students) */}
            {isLoggedIn && (
              <button
                onClick={() => handleNav('my-reports')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'my-reports'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-500" />
                My Reports
              </button>
            )}

            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'admin'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Admin Portal
              {isAdmin && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    isDemoAdmin
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isDemoAdmin ? 'Demo' : 'Admin'}
                </span>
              )}
            </button>

            <div className="h-5 w-px bg-slate-200 mx-2" />

            {/* Prominent Report Issue CTA Button */}
            <button
              onClick={() => handleNav('report')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/25 transition active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              Report Issue
            </button>

            {/* User Profile / Sign In */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <div
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
                  onClick={() => handleNav('my-reports')}
                  title={`Logged in as ${displayName}`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {displayName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="ml-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Sign In</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => handleNav('report')}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Report
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => handleNav('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'home' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => handleNav('report')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'report' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            Report an Issue
          </button>
          <button
            onClick={() => handleNav('track')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'track' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
            }`}
          >
            <Search className="w-4 h-4 text-slate-500" />
            Track Complaint
          </button>

          {isLoggedIn && (
            <button
              onClick={() => handleNav('my-reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === 'my-reports' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              My Reports
            </button>
          )}

          <button
            onClick={() => handleNav('admin')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span>Admin Portal</span>
            </div>
            {isAdmin && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                {isDemoAdmin ? 'Demo Admin' : 'Admin'}
              </span>
            )}
          </button>

          <div className="pt-2 border-t border-slate-100">
            {isLoggedIn ? (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-slate-600 font-semibold">{displayName}</span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-red-600 font-medium hover:underline"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full text-center bg-blue-600 text-white font-semibold py-2 rounded-xl text-xs"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
