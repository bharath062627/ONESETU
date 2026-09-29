import React, { useState } from 'react';
import { store } from '../../services/store';
import { authService } from '../../services/authService';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await authService.adminLogin(adminId, password);
      setIsLoading(false);

      if (res.success && res.user) {
        // Sync with central store
        store.updateUser({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          roles: res.user.roles,
          activeRole: res.user.activeRole
        });
        store.navigateTo('admin');
      } else {
        setErrorMsg(res.error || 'Admin authentication failed. Access denied.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Server connection error during admin authentication.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white px-6 pt-10 pb-6 overflow-y-auto select-none">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.navigateTo('home')}
          className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          title="Return to Public Portal"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          Restricted Zone
        </span>
      </div>

      {/* Brand & Heading */}
      <div className="mt-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-9 h-9 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-white mt-3 tracking-tight font-['Outfit']">
          ONESETU ADMIN
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Authorized personnel only. All access attempts and administrative modifications are cryptographically audited.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mt-5 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {/* Admin Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Admin ID Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Admin ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Enter your Admin ID"
              className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password"
              className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Verifying credentials...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>LOGIN</span>
            </>
          )}
        </button>
      </form>

      {/* Security notice */}
      <div className="mt-auto pt-6 text-center border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
        <p>
          Protected by server-side PBKDF2 cryptography and role-based access control.
        </p>
        <div>
          <button
            type="button"
            onClick={() => store.navigateTo('auth')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            ← Back to Normal User Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
