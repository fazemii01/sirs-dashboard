export interface AuthSession {
  isAuthenticated: boolean;
  role: string | null;
  username: string | null;
  name: string | null;
  dashboardUrl: string;
}

/**
 * Checks whether the stored authentication session is valid and not expired.
 * Cleans up expired tokens automatically from localStorage.
 */
export function getAuthSession(): AuthSession {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      role: null,
      username: null,
      name: null,
      dashboardUrl: '/dashboard',
    };
  }

  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  const username = localStorage.getItem('username');
  const name = localStorage.getItem('user_name');

  const defaultResult: AuthSession = {
    isAuthenticated: false,
    role: null,
    username: null,
    name: null,
    dashboardUrl: '/dashboard',
  };

  if (!token || token.trim() === '') {
    return defaultResult;
  }

  // Check expiration if token is a standard JWT (contains dots)
  if (token.includes('.')) {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        // Base64URL decode
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);

        if (payload && typeof payload.exp === 'number') {
          const nowInSeconds = Math.floor(Date.now() / 1000);
          if (payload.exp < nowInSeconds) {
            // Token has expired! Clean up localStorage
            clearAuthSession();
            return defaultResult;
          }
        }
      }
    } catch {
      // If parsing fails, proceed with existing token if non-empty
    }
  }

  const normalizedRole = (role || 'admin').toLowerCase();
  const dashboardUrl = normalizedRole === 'petugas' ? '/dashboard/tagihan' : '/dashboard';

  return {
    isAuthenticated: true,
    role: normalizedRole,
    username: username || 'User',
    name: name || (normalizedRole === 'ketua' ? 'Ketua / Kadis' : 'Admin'),
    dashboardUrl,
  };
}

/**
 * Clears authentication data from localStorage.
 */
export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_name');
  }
}

