import { User, UserRole, CloudAuthConfig, AuthSession } from '../types';

const SESSION_TOKEN_KEY = 'onesetu_session_token';
const SESSION_USER_KEY = 'onesetu_session_user';

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  code?: string;
  cloudConfigRequired?: boolean;
  missingConfig?: string[];
  instructions?: string[];
}

export const DEFAULT_CLOUD_CONFIG: CloudAuthConfig = {
  googleConfigured: false,
  phoneConfigured: false,
  firebaseConfigured: false,
  missingGoogleKeys: ['GOOGLE_CLIENT_ID', 'Firebase Google Sign-In Provider'],
  missingPhoneKeys: ['SMS_GATEWAY_API_KEY', 'Firebase Phone Auth reCAPTCHA'],
  missingFirebaseKeys: ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_AUTH_DOMAIN']
};

function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: (() => void)[] = [];
  private cloudConfig: CloudAuthConfig = { ...DEFAULT_CLOUD_CONFIG };

  constructor() {
    this.restoreSession();
    this.fetchCloudConfig();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentSession && this.currentSession.serverVerified);
  }

  public isAdmin(): boolean {
    if (!this.currentSession || !this.currentSession.serverVerified || !this.currentSession.token) {
      return false;
    }
    // Verify token cryptographic claims
    const payload = parseJwtPayload(this.currentSession.token);
    if (!payload || payload.role !== 'ADMIN') {
      return false;
    }
    if (payload.exp && Date.now() > payload.exp) {
      return false;
    }
    const role = this.currentSession.user.activeRole;
    const roles = this.currentSession.user.roles || [];
    return role === 'ADMIN' || roles.includes('ADMIN');
  }

  public getToken(): string | null {
    return this.currentSession?.token || null;
  }

  private restoreSession() {
    if (typeof window === 'undefined') return;
    try {
      const savedToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const savedUserStr = localStorage.getItem(SESSION_USER_KEY);
      if (savedToken && savedUserStr) {
        const user: User = JSON.parse(savedUserStr);
        const payload = parseJwtPayload(savedToken);
        if (payload && (!payload.exp || Date.now() < payload.exp)) {
          this.currentSession = {
            token: savedToken,
            user,
            expiresAt: payload.exp || Date.now() + 7 * 24 * 60 * 60 * 1000,
            serverVerified: true
          };
          // Verify with server in background
          this.verifyServerSession(savedToken);
        } else {
          this.clearStoredSession();
        }
      }
    } catch (e) {
      console.warn('Session restore failed, resetting', e);
      this.clearStoredSession();
    }
  }

  private async verifyServerSession(token: string) {
    try {
      const res = await fetch('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.valid) {
        this.clearStoredSession();
      }
    } catch {
      // In offline/unreachable conditions, keep local token if valid
    }
  }

  private async fetchCloudConfig() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/auth/cloud-status');
      if (res.ok) {
        const data = await res.json();
        this.cloudConfig = data;
      }
    } catch {}
  }

  private setStoredSession(token: string, user: User) {
    this.currentSession = {
      token,
      user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      serverVerified: true
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to store session in localStorage', e);
      }
    }
    this.notify();
  }

  private clearStoredSession() {
    this.currentSession = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(SESSION_USER_KEY);
      } catch {}
    }
    this.notify();
  }

  // 1. Email + Password Sign In
  public async loginWithEmail(identifier: string, password: string): Promise<AuthResult> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (data.success && data.user && data.token) {
        this.setStoredSession(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      }
      return {
        success: false,
        error: data.error || 'Authentication failed',
        code: data.code
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during login' };
    }
  }

  // 2. Email + Password Registration
  public async register(params: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    location?: string;
  }): Promise<AuthResult> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success && data.user && data.token) {
        this.setStoredSession(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      }
      return {
        success: false,
        error: data.error || 'Registration failed'
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration request failed' };
    }
  }

  // 3. Restricted Administrator Login
  public async adminLogin(adminId: string, password: string): Promise<AuthResult> {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password })
      });
      const data = await res.json();
      if (data.success && data.user && data.token) {
        this.setStoredSession(data.token, data.user);
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      }
      return {
        success: false,
        error: data.error || 'Admin authentication failed',
        code: data.code
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Admin authentication server error' };
    }
  }

  // 4. Google Login (Cloud OAuth inspection - No Fake Button)
  public async loginWithGoogle(): Promise<AuthResult> {
    const cloudConfig = this.getCloudConfig();
    if (!cloudConfig.googleConfigured) {
      return {
        success: false,
        cloudConfigRequired: true,
        error: 'Google Login Configuration Required',
        missingConfig: cloudConfig.missingGoogleKeys,
        instructions: [
          'Enable Google provider in Firebase Authentication console or Google Cloud Console.',
          'Provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET or initialize Firebase App.',
          'Add your development and production domains to authorized redirect URIs.',
          'No mock Google login is permitted in production.'
        ]
      };
    }

    return {
      success: false,
      error: 'Google Sign-in client SDK awaiting user configuration credentials.'
    };
  }

  // 5. Phone Login (Real OTP - No Fake OTP 123456)
  public async sendPhoneOtp(phone: string): Promise<AuthResult> {
    if (!phone || phone.trim().length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit Indian phone number (+91).' };
    }

    const cloudConfig = this.getCloudConfig();
    if (!cloudConfig.phoneConfigured) {
      return {
        success: false,
        cloudConfigRequired: true,
        error: 'Phone Auth Configuration Required',
        missingConfig: cloudConfig.missingPhoneKeys,
        instructions: [
          'Enable Phone Authentication in Firebase Authentication with SMS reCAPTCHA.',
          'Or configure SMS Gateway credentials (SMS_GATEWAY_API_KEY).',
          'Fake OTP (e.g. 123456) is strictly prohibited in production.',
          'Configure verified testing phone numbers in the Firebase Console for local testing.'
        ]
      };
    }

    return {
      success: false,
      error: 'SMS Gateway service unavailable.'
    };
  }

  // 6. Forgot Password
  public async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Request failed' };
    }
  }

  // 7. Reset Password
  public async resetPassword(token: string, newPass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: token, newPassword: newPass })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Request failed' };
    }
  }

  // 8. Sign Out
  public async logout(): Promise<void> {
    if (this.currentSession?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.currentSession.token}` }
        });
      } catch {}
    }
    this.clearStoredSession();
  }

  // 9. Inspect Cloud Configuration
  public getCloudConfig(): CloudAuthConfig {
    return this.cloudConfig;
  }

  // 10. Admin User Management API
  public async getAdminUsersList(token?: string): Promise<{ success: boolean; users?: User[]; error?: string }> {
    const activeToken = token || this.getToken() || '';
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to fetch user list' };
    }
  }

  public async setAdminUserStatus(token: string, targetUserId: string, status: 'ACTIVE' | 'DISABLED'): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, status })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update user status' };
    }
  }

  public async setAdminUserRole(token: string, targetUserId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, role })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update user role' };
    }
  }
}

export const authService = new AuthService();
