import { serverAuthService } from './authService';

export interface ApiResponse {
  status: number;
  data: any;
}

/**
 * Handles incoming API requests for /api/auth/* and /api/admin/* routes.
 * Supports Express router or Vite connect middleware.
 */
export function handleAuthApiRequest(
  urlPath: string,
  method: string,
  body: any = {},
  headers: Record<string, string | string[] | undefined> = {}
): ApiResponse {
  const authHeader = headers['authorization'] || headers['Authorization'];
  let token = '';
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  // 1. POST /api/auth/register
  if (urlPath === '/api/auth/register' && method === 'POST') {
    const result = serverAuthService.register(body);
    return {
      status: result.success ? 201 : 400,
      data: result
    };
  }

  // 2. POST /api/auth/login
  if (urlPath === '/api/auth/login' && method === 'POST') {
    const { identifier, password } = body;
    const result = serverAuthService.login(identifier, password);
    return {
      status: result.success ? 200 : result.code === 'USER_NOT_FOUND' ? 404 : 401,
      data: result
    };
  }

  // 3. POST /api/auth/admin-login
  if (urlPath === '/api/auth/admin-login' && method === 'POST') {
    const { adminId, password } = body;
    const result = serverAuthService.adminLogin(adminId, password);
    return {
      status: result.success ? 200 : result.code === 'FORBIDDEN' ? 403 : 401,
      data: result
    };
  }

  // 4. GET /api/auth/session
  if (urlPath === '/api/auth/session' && method === 'GET') {
    if (!token) {
      return {
        status: 401,
        data: { success: false, error: 'Unauthorized: Missing bearer session token' }
      };
    }
    const result = serverAuthService.verifyToken(token);
    return {
      status: result.valid ? 200 : 401,
      data: {
        success: result.valid,
        valid: result.valid,
        user: result.user,
        serverVerified: result.valid,
        error: result.error
      }
    };
  }

  // 5. POST /api/auth/logout
  if (urlPath === '/api/auth/logout' && method === 'POST') {
    serverAuthService.logout(token);
    return {
      status: 200,
      data: { success: true, message: 'Logged out successfully' }
    };
  }

  // 6. POST /api/auth/forgot-password
  if (urlPath === '/api/auth/forgot-password' && method === 'POST') {
    const { email } = body;
    const result = serverAuthService.forgotPassword(email);
    return {
      status: 200,
      data: result
    };
  }

  // 7. POST /api/auth/reset-password
  if (urlPath === '/api/auth/reset-password' && method === 'POST') {
    const { token: resetToken, newPassword } = body;
    const result = serverAuthService.resetPassword(resetToken, newPassword);
    return {
      status: result.success ? 200 : 400,
      data: result
    };
  }

  // 8. GET /api/auth/cloud-status
  if (urlPath === '/api/auth/cloud-status' && method === 'GET') {
    const config = serverAuthService.getCloudAuthConfig();
    return {
      status: 200,
      data: {
        success: true,
        cloudAuth: config
      }
    };
  }

  // 9. POST /api/auth/google
  if (urlPath === '/api/auth/google' && method === 'POST') {
    const config = serverAuthService.getCloudAuthConfig();
    if (!config.googleConfigured) {
      return {
        status: 501,
        data: {
          success: false,
          error: 'Google Login Configuration Required',
          status: 'BLOCKED — GOOGLE AUTH CONFIGURATION REQUIRED',
          missingConfiguration: config.missingGoogleKeys,
          instructions: [
            'Create or link a Firebase/Google Cloud Project.',
            'Enable Google Sign-in Provider in Firebase Authentication console.',
            'Add authorized domains (e.g. localhost, your app domain).',
            'Configure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN and GOOGLE_CLIENT_ID.'
          ]
        }
      };
    }

    return {
      status: 501,
      data: { success: false, error: 'Google OAuth flow requires client SDK initialization.' }
    };
  }

  // 10. POST /api/auth/phone/send-otp
  if (urlPath === '/api/auth/phone/send-otp' && method === 'POST') {
    const config = serverAuthService.getCloudAuthConfig();
    if (!config.phoneConfigured) {
      return {
        status: 501,
        data: {
          success: false,
          error: 'Phone Auth Configuration Required',
          status: 'BLOCKED — PHONE AUTH CONFIGURATION REQUIRED',
          missingConfiguration: config.missingPhoneKeys,
          instructions: [
            'Enable Phone Provider in Firebase Authentication or configure SMS Gateway API.',
            'Configure SMS_GATEWAY_API_KEY or Firebase App Verification reCAPTCHA.',
            'No fake OTP (e.g. 123456) will be accepted in production.'
          ]
        }
      };
    }

    return {
      status: 501,
      data: { success: false, error: 'SMS Gateway service unavailable.' }
    };
  }

  // 11. GET /api/admin/users (Protected Admin Route)
  if (urlPath === '/api/admin/users' && method === 'GET') {
    const result = serverAuthService.getAdminUsersList(token);
    return {
      status: result.success ? 200 : 403,
      data: result
    };
  }

  // 12. POST /api/admin/users/status (Protected Admin Route)
  if (urlPath === '/api/admin/users/status' && method === 'POST') {
    const { targetUserId, status } = body;
    const result = serverAuthService.setAdminUserStatus(token, targetUserId, status);
    return {
      status: result.success ? 200 : 403,
      data: result
    };
  }

  // 13. POST /api/admin/users/role (Protected Admin Route)
  if (urlPath === '/api/admin/users/role' && method === 'POST') {
    const { targetUserId, newRole } = body;
    const result = serverAuthService.setAdminUserRole(token, targetUserId, newRole);
    return {
      status: result.success ? 200 : 403,
      data: result
    };
  }

  return {
    status: 404,
    data: {
      success: false,
      error: `Endpoint not found: ${method} ${urlPath}`
    }
  };
}
