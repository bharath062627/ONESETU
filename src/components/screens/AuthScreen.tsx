import React, { useState } from 'react';
import { store } from '../../services/store';
import { authService, AuthResult } from '../../services/authService';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  X,
  ExternalLink,
  RotateCw
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cloud OAuth / Phone Modal States
  const [cloudConfigModal, setCloudConfigModal] = useState<{
    provider: 'Google' | 'Phone';
    title: string;
    missingKeys: string[];
    instructions: string[];
  } | null>(null);

  // Phone OTP Flow State (for real phone auth)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('+91 ');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await authService.loginWithEmail(email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        store.updateUser({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          roles: res.user.roles,
          activeRole: res.user.activeRole
        });
        store.navigateTo('home');
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Unable to connect to authentication service.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await authService.register({
        name,
        email,
        phone,
        password,
        role: 'CUSTOMER'
      });
      setIsLoading(false);

      if (res.success && res.user) {
        store.updateUser({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          roles: res.user.roles,
          activeRole: res.user.activeRole
        });
        store.navigateTo('roles');
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check your inputs.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Registration request failed.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to reset password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.forgotPassword(email);
      setIsLoading(false);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Password reset request failed.');
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    const res = await authService.loginWithGoogle();
    if (res.cloudConfigRequired) {
      setCloudConfigModal({
        provider: 'Google',
        title: 'Google Login Configuration Required',
        missingKeys: res.missingConfig || ['GOOGLE_CLIENT_ID', 'Firebase Google Sign-In Provider'],
        instructions: res.instructions || [
          'Enable Google provider in Firebase Authentication console.',
          'Configure GOOGLE_CLIENT_ID and authorized redirect URIs.',
          'No fake Google authentication is allowed in production.'
        ]
      });
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handlePhoneClick = async () => {
    setErrorMsg(null);
    const res = await authService.sendPhoneOtp(phoneInput);
    if (res.cloudConfigRequired) {
      setCloudConfigModal({
        provider: 'Phone',
        title: 'Phone Auth Configuration Required',
        missingKeys: res.missingConfig || ['SMS_GATEWAY_API_KEY', 'Firebase Phone Auth / reCAPTCHA'],
        instructions: res.instructions || [
          'Enable Phone Authentication in Firebase Authentication with SMS reCAPTCHA.',
          'Or configure SMS Gateway credentials (SMS_GATEWAY_API_KEY).',
          'Fake OTP (e.g. 123456) is strictly prohibited in production.'
        ]
      });
    } else {
      setIsPhoneModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-10 pb-6 overflow-y-auto select-none">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.goBack()}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Link to Restricted Admin Login */}
        <button
          onClick={() => store.navigateTo('admin-login')}
          className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Brand & Heading */}
      <div className="mt-2 text-center">
        <div className="mx-auto w-16 h-16 relative flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="36" cy="42" r="7" fill="#F97316" />
            <path d="M26 62 C26 50, 46 50, 46 62 Z" fill="#F97316" />
            <circle cx="50" cy="34" r="7.5" fill="#EAB308" />
            <path d="M40 56 C40 44, 60 44, 60 56 Z" fill="#EAB308" />
            <circle cx="68" cy="34" r="7.5" fill="#10B981" />
            <path d="M58 56 C58 44, 78 44, 78 56 Z" fill="#10B981" />
            <circle cx="82" cy="42" r="7" fill="#0EA5E9" />
            <path d="M72 62 C72 50, 92 50, 92 62 Z" fill="#0EA5E9" />
            <path d="M18 84 Q60 58 102 84" stroke="#065F46" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-1 font-['Outfit']">Welcome to ONESETU</h2>
        <p className="text-xs text-slate-500 mt-0.5">One Platform. Every Local Need.</p>
      </div>

      {/* Error / Success Feedback */}
      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Segmented Tab: Sign In / Sign Up */}
      {mode !== 'forgot_password' && (
        <div className="mt-5 p-1 bg-slate-100 rounded-xl flex">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>
      )}

      {/* Forms */}
      {mode === 'forgot_password' ? (
        <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
          <div className="text-left mb-2">
            <h3 className="text-sm font-bold text-slate-800">Reset Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your registered email address and we'll send password recovery instructions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Sending reset link...' : 'Send Reset Instructions'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="mt-5 space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create password (min 6 characters)' : 'Enter your password'}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          {mode === 'signin' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50"
          >
            {isLoading
              ? 'Authenticating...'
              : mode === 'signin'
              ? 'Sign In with Email'
              : 'Create Account'}
          </button>
        </form>
      )}

      {/* Social / Phone Buttons (When not in forgot password mode) */}
      {mode !== 'forgot_password' && (
        <>
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handlePhoneClick}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Continue with Phone Number</span>
            </button>
          </div>
        </>
      )}

      {/* Switch mode footer */}
      {mode !== 'forgot_password' && (
        <div className="mt-auto pt-4 text-center">
          <p className="text-xs text-slate-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="font-bold text-emerald-700 hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      )}

      {/* Cloud Configuration Required Modal (Prompt Mandate) */}
      {cloudConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">{cloudConfigModal.title}</h3>
              </div>
              <button
                onClick={() => setCloudConfigModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                ONESETU operates on verified zero-trust standards. Real OAuth/SMS integration requires official cloud provider credentials. Fake authentication is strictly disabled in production.
              </p>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Required Credentials:</span>
                <ul className="list-disc pl-4 text-amber-800 space-y-0.5 font-mono text-[11px]">
                  {cloudConfigModal.missingKeys.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Setup Instructions:</span>
                <ul className="list-disc pl-4 text-slate-700 space-y-1 text-[11px]">
                  {cloudConfigModal.instructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setCloudConfigModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
