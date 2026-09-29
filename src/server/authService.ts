import crypto from 'crypto';
import { User, UserRole, CloudAuthConfig } from '../types';

export interface StoredUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  issuedAt: number;
  expiresAt: number;
}

// Server Secret for HMAC Session Token Signing
const SERVER_AUTH_SECRET = process.env.AUTH_SECRET || 'onesetu_hmac_jwt_master_secret_2026_secure';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function createSignedToken(payload: SessionPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SERVER_AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifySignedToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', SERVER_AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.expiresAt < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

class ServerAuthService {
  private users: Map<string, StoredUser> = new Map();
  private identifierIndex: Map<string, string> = new Map(); // identifier -> userId
  private revokedTokens: Set<string> = new Set();
  private passwordResetTokens: Map<string, { userId: string; expiresAt: number }> = new Map();

  constructor() {
    this.seedDefaultAccounts();
  }

  private seedDefaultAccounts() {
    // 1. Initial Administrator account
    // ADMIN ID: admin@123 / admin@onesetu.org
    // ADMIN PASSWORD: admin@123 (hashed with PBKDF2)
    const adminSalt = generateSalt();
    const adminUser: StoredUser = {
      id: 'usr-admin-01',
      name: 'System Administrator',
      email: 'admin@onesetu.org',
      phone: '+91 98000 00112',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roles: ['ADMIN'],
      activeRole: 'ADMIN',
      location: 'Bengaluru, Karnataka',
      verified: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-09-29',
      status: 'ACTIVE',
      auth_provider: 'email',
      passwordSalt: adminSalt,
      passwordHash: hashPassword('admin@123', adminSalt)
    };
    this.users.set(adminUser.id, adminUser);
    this.identifierIndex.set('admin@123', adminUser.id);
    this.identifierIndex.set('admin@onesetu.org', adminUser.id);

    // 2. Pre-seeded verified Customer account
    const custSalt = generateSalt();
    const custUser: StoredUser = {
      id: 'usr-customer-01',
      name: 'Anand Kumar',
      email: 'anand@example.com',
      phone: '+91 98450 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      roles: ['CUSTOMER'],
      activeRole: 'CUSTOMER',
      location: 'Mysuru, Karnataka',
      verified: true,
      createdAt: '2026-02-15',
      updatedAt: '2026-09-29',
      status: 'ACTIVE',
      auth_provider: 'email',
      passwordSalt: custSalt,
      passwordHash: hashPassword('Customer@123', custSalt)
    };
    this.users.set(custUser.id, custUser);
    this.identifierIndex.set(custUser.email.toLowerCase(), custUser.id);
    this.identifierIndex.set(custUser.phone, custUser.id);

    // 3. Pre-seeded Farmer account
    const farmerSalt = generateSalt();
    const farmerUser: StoredUser = {
      id: 'usr-farmer-01',
      name: 'Ramesh Gowda',
      email: 'ramesh.farmer@example.com',
      phone: '+91 94480 34567',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      roles: ['FARMER', 'CUSTOMER'],
      activeRole: 'FARMER',
      location: 'Mandya, Karnataka',
      verified: true,
      createdAt: '2026-03-01',
      updatedAt: '2026-09-29',
      status: 'ACTIVE',
      auth_provider: 'email',
      passwordSalt: farmerSalt,
      passwordHash: hashPassword('Farmer@123', farmerSalt)
    };
    this.users.set(farmerUser.id, farmerUser);
    this.identifierIndex.set(farmerUser.email.toLowerCase(), farmerUser.id);
    this.identifierIndex.set(farmerUser.phone, farmerUser.id);
  }

  public register(params: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    location?: string;
  }): { success: boolean; user?: User; token?: string; error?: string } {
    const { name, email, phone, password, role = 'CUSTOMER', location = 'Mysuru, Karnataka' } = params;

    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters in length.' };
    }
    if (!phone || phone.trim().length < 10) {
      return { success: false, error: 'A valid phone number is required.' };
    }

    // CRITICAL SECURITY ENFORCEMENT:
    // Ordinary users CANNOT register directly with the protected role 'ADMIN'.
    if (role === 'ADMIN') {
      return {
        success: false,
        error: 'Privilege escalation rejected: The ADMIN role cannot be self-assigned during registration.'
      };
    }

    const cleanEmail = email.toLowerCase().trim();
    if (this.identifierIndex.has(cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const salt = generateSalt();
    const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const assignedRoles: UserRole[] = role ? [role] : ['CUSTOMER'];

    const storedUser: StoredUser = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      roles: assignedRoles,
      activeRole: assignedRoles[0],
      location,
      verified: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      auth_provider: 'email',
      passwordSalt: salt,
      passwordHash: hashPassword(password, salt)
    };

    this.users.set(newId, storedUser);
    this.identifierIndex.set(cleanEmail, newId);
    this.identifierIndex.set(phone.trim(), newId);

    const token = this.generateTokenForUser(storedUser);
    return {
      success: true,
      user: this.sanitizeUser(storedUser),
      token
    };
  }

  public login(identifier: string, password: string): {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
    code?: string;
  } {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Email or ID is required.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const cleanId = identifier.trim().toLowerCase();
    const userId = this.identifierIndex.get(cleanId);
    if (!userId) {
      return { success: false, error: 'Account not found. Please verify your email or sign up.', code: 'USER_NOT_FOUND' };
    }

    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'Account not found.', code: 'USER_NOT_FOUND' };
    }

    if (user.status === 'DISABLED') {
      return { success: false, error: 'Account disabled. Please contact system support.', code: 'ACCOUNT_DISABLED' };
    }

    const computedHash = hashPassword(password, user.passwordSalt);
    if (computedHash !== user.passwordHash) {
      return { success: false, error: 'Invalid password. Please try again.', code: 'WRONG_PASSWORD' };
    }

    const token = this.generateTokenForUser(user);
    return {
      success: true,
      user: this.sanitizeUser(user),
      token
    };
  }

  public adminLogin(adminId: string, password: string): {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
    code?: string;
  } {
    const loginRes = this.login(adminId, password);
    if (!loginRes.success || !loginRes.user) {
      return loginRes;
    }

    // Verify trusted backend role
    if (loginRes.user.activeRole !== 'ADMIN' && !loginRes.user.roles.includes('ADMIN')) {
      return {
        success: false,
        error: 'Access denied. Administrator privileges required.',
        code: 'FORBIDDEN'
      };
    }

    return loginRes;
  }

  public verifyToken(token: string): { valid: boolean; user?: User; error?: string } {
    if (!token) return { valid: false, error: 'Token is required' };
    if (this.revokedTokens.has(token)) {
      return { valid: false, error: 'Session has been revoked' };
    }

    const payload = verifySignedToken(token);
    if (!payload) {
      return { valid: false, error: 'Invalid or expired session token' };
    }

    const user = this.users.get(payload.userId);
    if (!user || user.status === 'DISABLED') {
      return { valid: false, error: 'User does not exist or has been disabled' };
    }

    return {
      valid: true,
      user: this.sanitizeUser(user)
    };
  }

  public logout(token: string): boolean {
    if (token) {
      this.revokedTokens.add(token);
    }
    return true;
  }

  public forgotPassword(email: string): { success: boolean; message: string; resetToken?: string } {
    const cleanEmail = (email || '').toLowerCase().trim();
    const userId = this.identifierIndex.get(cleanEmail);
    if (!userId) {
      // Security best practice: don't reveal if email doesn't exist
      return {
        success: true,
        message: 'If an account matches that email address, password reset instructions have been dispatched.'
      };
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    this.passwordResetTokens.set(resetToken, {
      userId,
      expiresAt: Date.now() + 3600000 // 1 hour
    });

    return {
      success: true,
      message: 'Password reset link sent to your registered email.',
      resetToken // Returned for local testing environment
    };
  }

  public resetPassword(token: string, newPassword: string): { success: boolean; error?: string } {
    if (!token || !newPassword || newPassword.length < 6) {
      return { success: false, error: 'Valid reset token and minimum 6-character password required.' };
    }

    const entry = this.passwordResetTokens.get(token);
    if (!entry || entry.expiresAt < Date.now()) {
      return { success: false, error: 'Reset token is invalid or has expired.' };
    }

    const user = this.users.get(entry.userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    user.passwordSalt = generateSalt();
    user.passwordHash = hashPassword(newPassword, user.passwordSalt);
    user.updatedAt = new Date().toISOString().split('T')[0];
    this.passwordResetTokens.delete(token);

    return { success: true };
  }

  // Admin User Moderation
  public getAdminUsersList(callerToken: string): { success: boolean; users?: User[]; error?: string } {
    const auth = this.verifyToken(callerToken);
    if (!auth.valid || !auth.user || auth.user.activeRole !== 'ADMIN') {
      return { success: false, error: 'Forbidden: Admin authorization required' };
    }

    const list: User[] = Array.from(this.users.values()).map(u => this.sanitizeUser(u));
    return { success: true, users: list };
  }

  public setAdminUserStatus(
    callerToken: string,
    targetUserId: string,
    status: 'ACTIVE' | 'DISABLED'
  ): { success: boolean; error?: string } {
    const auth = this.verifyToken(callerToken);
    if (!auth.valid || !auth.user || auth.user.activeRole !== 'ADMIN') {
      return { success: false, error: 'Forbidden: Admin authorization required' };
    }

    const target = this.users.get(targetUserId);
    if (!target) return { success: false, error: 'Target user not found' };

    // Prevent disabling the root admin
    if (target.id === 'usr-admin-01' && status === 'DISABLED') {
      return { success: false, error: 'Cannot disable the primary root administrator account.' };
    }

    target.status = status;
    target.updatedAt = new Date().toISOString().split('T')[0];
    return { success: true };
  }

  public setAdminUserRole(
    callerToken: string,
    targetUserId: string,
    newRole: UserRole
  ): { success: boolean; error?: string } {
    const auth = this.verifyToken(callerToken);
    if (!auth.valid || !auth.user || auth.user.activeRole !== 'ADMIN') {
      return { success: false, error: 'Forbidden: Admin authorization required' };
    }

    const target = this.users.get(targetUserId);
    if (!target) return { success: false, error: 'Target user not found' };

    target.activeRole = newRole;
    if (!target.roles.includes(newRole)) {
      target.roles.push(newRole);
    }
    target.updatedAt = new Date().toISOString().split('T')[0];
    return { success: true };
  }

  public getCloudAuthConfig(): CloudAuthConfig {
    const hasFirebase = Boolean(
      process.env.VITE_FIREBASE_API_KEY &&
      process.env.VITE_FIREBASE_PROJECT_ID &&
      process.env.VITE_FIREBASE_AUTH_DOMAIN
    );

    const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID || (hasFirebase && process.env.VITE_FIREBASE_GOOGLE_AUTH === 'true'));
    const hasPhone = Boolean(process.env.SMS_GATEWAY_API_KEY || (hasFirebase && process.env.VITE_FIREBASE_PHONE_AUTH === 'true'));

    const missingFirebaseKeys: string[] = [];
    if (!process.env.VITE_FIREBASE_API_KEY) missingFirebaseKeys.push('VITE_FIREBASE_API_KEY');
    if (!process.env.VITE_FIREBASE_PROJECT_ID) missingFirebaseKeys.push('VITE_FIREBASE_PROJECT_ID');
    if (!process.env.VITE_FIREBASE_AUTH_DOMAIN) missingFirebaseKeys.push('VITE_FIREBASE_AUTH_DOMAIN');

    const missingGoogleKeys: string[] = [];
    if (!process.env.GOOGLE_CLIENT_ID) missingGoogleKeys.push('GOOGLE_CLIENT_ID / Firebase Google Sign-in Provider');

    const missingPhoneKeys: string[] = [];
    if (!process.env.SMS_GATEWAY_API_KEY) missingPhoneKeys.push('SMS_GATEWAY_API_KEY / Firebase Phone Auth reCAPTCHA');

    return {
      firebaseConfigured: hasFirebase,
      googleConfigured: hasGoogle,
      phoneConfigured: hasPhone,
      missingFirebaseKeys,
      missingGoogleKeys,
      missingPhoneKeys
    };
  }

  private generateTokenForUser(user: StoredUser): string {
    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.activeRole,
      roles: user.roles,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    return createSignedToken(payload);
  }

  private sanitizeUser(stored: StoredUser): User {
    const { passwordHash, passwordSalt, ...safeUser } = stored;
    return safeUser;
  }
}

export const serverAuthService = new ServerAuthService();
