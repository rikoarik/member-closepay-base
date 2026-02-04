/**
 * Auth Service
 * Unified AuthService dengan support untuk mock dan real API
 * Uses environment-based switch untuk determine implementation
 */
import type {
  AuthService,
  AuthResponse,
  User,
  MetadataResponse,
  TagItem,
  SignUpData,
  SignUpResponse,
} from '../types';
import { tokenService } from './tokenService';
import { configService, axiosInstance } from '@core/config';
import { encode as base64Encode } from 'base-64';
import { ApiError, NetworkError, isAxiosError, axiosErrorToApiError } from '@core/config/types/errors';
import { validateString, validateEmail, validateId, throwIfInvalid } from '@core/config/utils/validation';
import { logger } from '@core/config/services/loggerService';
import { handleApiError, getUserFriendlyMessage } from '@core/config/utils/errorHandler';
import type { JWTPayload } from '../utils/jwtUtils';
import { decodeJWT } from '../utils/jwtUtils';

// ============================================================================
// REAL API IMPLEMENTATION
// ============================================================================

/**
 * Interface untuk response login (real API)
 */
export interface LoginResponse {
    status_code: number;
    type: string;
    message: string;
    data: {
        token_type: string;
        access_token: string;
        expires_in: number;
    };
}

/**
 * Generate random string untuk nonce
 * @param length - Length of the random string to generate (default: 20)
 * @returns Random alphanumeric string
 */
export const generateRandomString = (length: number = 20): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
};

/**
 * Encode credentials ke Base64 untuk Basic Auth
 * @param username - Username to encode
 * @param password - Password to encode
 * @returns Base64 encoded credentials string
 */
export const encodeCredentials = (username: string, password: string): string => {
    const credentials = `${username}:${password}`;
    return base64Encode(credentials);
};

/**
 * Real API: Login dengan Basic Auth (Nonce)
 * @param username - Username untuk login
 * @param password - Password untuk login
 * @returns LoginResponse dengan access token
 * @throws Error jika login gagal
 */
const loginWithNonceAPI = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        // Generate random nonce
        const randomNonce = generateRandomString(20);
        logger.debug('Generated nonce:', randomNonce);

        // Encode credentials to Base64
        const base64Credentials = encodeCredentials(username, password);

        const response = await axiosInstance.post<LoginResponse>(
            '/auth/account/login',
            {
                nonce: randomNonce,
            },
            {
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                },
            }
        );

        // Save tokens and expiry to storage
        const { access_token, expires_in } = response.data.data;
        await tokenService.setToken(access_token);
        await tokenService.setTokenExpiry(expires_in);

        logger.info('Login successful, token saved');

        return response.data;
    } catch (error: unknown) {
        logger.error('Login failed', error);

        const apiError = handleApiError(error);
        const errorMessage = getUserFriendlyMessage(apiError);
        throw new Error(errorMessage);
    }
};

/**
 * Real API: Logout
 * Revokes the current access token on the server
 * @returns Promise yang resolve saat logout berhasil
 * @throws Error jika logout gagal
 */
const logoutAPI = async (): Promise<unknown> => {
    try {
        const response = await axiosInstance.delete('/auth/account/revoke');
        logger.info('Logout successful');
        return response.data;
    } catch (error: unknown) {
        logger.error('Logout failed', error);
        throw error;
    }
};

// Export for use in authStore
export const loginWithNonce = loginWithNonceAPI;
export const logout = logoutAPI;

// ============================================================================
// MOCK IMPLEMENTATION (for development/testing)
// ============================================================================

/**
 * Get mock users from environment variables or use defaults
 * SECURITY: In production, mock users should be disabled or loaded from secure config
 * Never hardcode credentials in production code
 */
function getMockUsers(): Array<{
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}> {
  return [
    { id: '1', username: 'member', password: 'Pass1234!', email: 'member@solusiuntuknegeri.com', name: 'Member Test', role: 'member', permissions: ['read', 'write'] },
  ];
}

const MOCK_COMPANY = {
  id: 'company-1',
  name: 'Merchant Closepay',
  segmentId: 'balance-management',
  config: {},
};

/**
 * Simulate API delay
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

/**
 * Generate mock JWT token dengan format yang valid
 * Format JWT: header.payload.signature (3 parts separated by dots)
 * 
 * @param userId - User ID untuk dimasukkan ke payload
 * @param expiresIn - Expiry time in seconds (default: 24 hours)
 * @returns Mock JWT token dengan format yang valid
 */
function generateMockJWT(userId: string, expiresIn: number = 24 * 60 * 60): string {
  // JWT Header (standard)
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // JWT Payload dengan claims yang valid
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const payload: JWTPayload = {
    sub: userId, // Subject (user ID)
    iat: now, // Issued at
    exp: now + expiresIn, // Expiry
    jti: `mock_${userId}_${Date.now()}`, // JWT ID
    type: 'access',
  };

  // Encode header dan payload ke Base64URL
  const encodeBase64URL = (obj: object): string => {
    const json = JSON.stringify(obj);
    const base64 = base64Encode(json);
    // Convert to Base64URL: replace + with -, / with _, and remove padding =
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const encodedHeader = encodeBase64URL(header);
  const encodedPayload = encodeBase64URL(payload);

  // Mock signature (tidak perlu valid untuk mock, tapi harus ada)
  const signature = base64Encode(`mock_signature_${userId}_${Date.now()}`)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Combine: header.payload.signature
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Mock API service untuk login
 */
const mockLoginAPI = async (
  username: string,
  password: string,
): Promise<AuthResponse> => {
  // Simulate network delay
  await delay(1000);

  // Support both username and email (extract username from email if needed)
  const loginUsername = username.includes('@') 
    ? username.split('@')[0] 
    : username;

  // Find user
  const mockUsers = getMockUsers();
  const user = mockUsers.find(
    u => u.username === loginUsername && u.password === password,
  );

  if (!user) {
    throw new Error('Invalid email atau password');
  }

  // Generate mock tokens dengan format JWT yang valid
  const token = generateMockJWT(user.id, 24 * 60 * 60); // 24 hours expiry
  const refreshToken = generateMockJWT(user.id, 7 * 24 * 60 * 60); // 7 days expiry

  // Return auth response
  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    },
    company: MOCK_COMPANY,
  };
};

/**
 * Mock API service untuk get profile
 */
const mockGetProfileAPI = async (): Promise<User> => {
  await delay(500);
  const token = await tokenService.getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  // Extract user ID from token (decode JWT payload)
  let userId = '1';
  try {
    const payload = decodeJWT(token);
    userId = payload?.sub || '1';
  } catch (error) {
    // Fallback: try to extract from old format if token is not JWT
    userId = token.split('_')[2] || '1';
  }
  const mockUsers = getMockUsers();
  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };
};

/**
 * Mock API service untuk refresh token
 */
const mockRefreshTokenAPI = async (): Promise<string> => {
  await delay(500);
  const refreshToken = await tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Extract user ID from refresh token
  let userId = '1';
  try {
    const payload = decodeJWT(refreshToken);
    userId = payload?.sub || '1';
  } catch (error) {
    // Fallback: try to extract from old format if token is not JWT
    userId = refreshToken.split('_')[2] || '1';
  }

  // Generate new token dengan format JWT yang valid
  const newToken = generateMockJWT(userId, 24 * 60 * 60); // 24 hours expiry
  return newToken;
};

const MOCK_METADATA: MetadataResponse = {
  data: {
    items: [
      {
        data: {
          key: 'name',
          display: 'Nama Lengkap',
          typeData: 'Text',
          tag: 'BasicData',
          isRequired: true,
          isVisible: true,
        },
      },
      {
        data: {
          key: 'email',
          display: 'Email',
          typeData: 'Email',
          tag: 'BasicData',
          isRequired: true,
          isVisible: true,
        },
      },
      {
        data: {
          key: 'phone',
          display: 'Nomor Telepon',
          typeData: 'Phone',
          tag: 'BasicData',
          isRequired: false,
          isVisible: true,
        },
      },
    ],
  },
};

const MOCK_TAGS: TagItem[] = [
  { name: 'Member', isSelfRegisterSupported: true },
  { name: 'Premium', isSelfRegisterSupported: true },
];

const mockGetSignUpMetadataAPI = async (): Promise<MetadataResponse> => {
  await delay(300);
  return MOCK_METADATA;
};

const mockGetSignUpTagsAPI = async (): Promise<TagItem[]> => {
  await delay(200);
  return MOCK_TAGS;
};

const mockRegisterAPI = async (): Promise<SignUpResponse> => {
  await delay(800);
  // Generate mock JWT token untuk new user
  const mockToken = generateMockJWT('new_user', 24 * 60 * 60); // 24 hours expiry
  return {
    data: {
      responseType: 'token',
      authData: {
        authToken: mockToken,
        noId: 'mock-member-1',
        securityCode: 'mock-security-code',
      },
    },
  };
};

const mockSendForgotPasswordOtpAPI = async (): Promise<void> => {
  await delay(500);
};

const mockVerifyForgotPasswordOtpAPI = async (): Promise<void> => {
  await delay(300);
};

const mockResetPasswordAPI = async (): Promise<void> => {
  await delay(500);
};

// ============================================================================
// UNIFIED AUTH SERVICE
// ============================================================================

/**
 * Determine if should use mock based on config or environment
 */
const shouldUseMock = (): boolean => {
  const config = configService.getConfig();
  return config?.services?.auth?.useMock ?? true; // Default mock, no API
};

export const authService: AuthService = {
  /**
   * Login dengan username dan password
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    // Validate inputs
    throwIfInvalid(validateString(username, 'username', 1, 100));
    throwIfInvalid(validateString(password, 'password', 1, 255));

    try {
      if (shouldUseMock()) {
        const response = await mockLoginAPI(username, password);
        // Save tokens to storage
        await tokenService.setToken(response.token);
        await tokenService.setRefreshToken(response.refreshToken);
        return response;
      } else {
        // Use real API (nonce-based login)
        const response = await loginWithNonceAPI(username, password);
        // Token already saved in loginWithNonceAPI
        // Convert to AuthResponse format
        return {
          token: response.data.access_token,
          refreshToken: '', // TODO: Get from response if available
          user: {
            id: 'user-1', // TODO: Get from API response
            username,
            name: 'User', // TODO: Get from API response
          },
          company: {
            id: 'company-1', // TODO: Get from API response
            name: 'Merchant Closepay',
            segmentId: 'balance-management',
          },
        };
      }
    } catch (error) {
      logger.error('Login error', error);
      throw error;
    }
  },

  /**
   * Logout - clear tokens
   * Revokes token on server dan menghapus tokens dari storage
   * @returns Promise yang resolve saat logout berhasil
   * @throws Error jika logout gagal (tokens tetap di-clear)
   */
  async logout(): Promise<void> {
    try {
      if (!shouldUseMock()) {
        // Call real API logout
        await logoutAPI();
      }
      // Always clear tokens
      await tokenService.clearTokens();
    } catch (error) {
      logger.error('Logout error', error);
      // Even if API fails, clear tokens
      await tokenService.clearTokens();
      throw error;
    }
  },

  /**
   * Get user profile
   * Mengambil data profil user yang sedang login
   * @returns User profile data
   * @throws Error jika tidak authenticated atau gagal mengambil profile
   */
  async getProfile(): Promise<User> {
    try {
      if (shouldUseMock()) {
        return await mockGetProfileAPI();
      } else {
        // TODO: Implement real API call to get profile
        // Backend endpoint: GET /user/profile atau GET /auth/profile
        // For now, return basic user info as fallback
        const token = await tokenService.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }
        return {
          id: 'user-1',
          username: 'user',
          name: 'User',
        };
      }
    } catch (error) {
      logger.error('Get profile error', error);
      throw error;
    }
  },

  /**
   * Refresh access token
   * Memperbarui access token menggunakan refresh token
   * @returns New access token
   * @throws Error jika refresh gagal (tokens akan di-clear)
   */
  async refreshToken(): Promise<string> {
    try {
      if (shouldUseMock()) {
        const newToken = await mockRefreshTokenAPI();
        await tokenService.setToken(newToken);
        return newToken;
      } else {
        // TODO: Implement real API refresh token call
        // Backend endpoint: POST /auth/refresh dengan refresh_token
        // For now, throw error (should use axios interceptor for token refresh)
        throw new Error('Token refresh not implemented for real API - use axios interceptor');
      }
    } catch (error) {
      logger.error('Refresh token error', error);
      // Clear tokens if refresh fails
      await tokenService.clearTokens();
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns True jika user sudah authenticated (simplified check)
   * @note Ini adalah simplified check. Di production, sebaiknya check token validity dan expiry
   */
  isAuthenticated(): boolean {
    // This is a synchronous check, so we'll use a simple approach
    // In a real app, you might want to check token expiry
    // For now, we'll check if token exists in storage synchronously
    // Note: AsyncStorage.getItem is async, so this is a simplified check
    // In production, you'd want to check token validity and expiry
    return true; // Will be properly implemented with token check
  },

  /**
   * Get metadata for sign up form
   */
  async getSignUpMetadata(companyId: string, userType: string = 'MEMBER'): Promise<MetadataResponse> {
    throwIfInvalid(validateId(companyId, 'companyId'));
    throwIfInvalid(validateString(userType, 'userType', 1, 50));

    if (shouldUseMock()) {
      return mockGetSignUpMetadataAPI();
    }

    try {
      const response = await axiosInstance.get<MetadataResponse>(
        `user/info/company/metadata/get?companyId=${companyId}&userType=${userType}`
      );
      return response.data;
    } catch (error: unknown) {
      logger.error('Get metadata error', error);
      const apiError = handleApiError(error);
      const errorMessage = getUserFriendlyMessage(apiError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get tags for sign up
   */
  async getSignUpTags(companyId: string): Promise<TagItem[]> {
    throwIfInvalid(validateId(companyId, 'companyId'));

    if (shouldUseMock()) {
      return mockGetSignUpTagsAPI();
    }

    try {
      const response = await axiosInstance.get<{ data: TagItem[] }>(
        `user/info/company/tags/register/${companyId}`
      );
      return response.data.data.filter((tag) => tag.isSelfRegisterSupported);
    } catch (error: unknown) {
      logger.error('Get tags error', error);
      return [];
    }
  },

  /**
   * Register new user
   */
  async register(data: SignUpData, otp?: string): Promise<SignUpResponse> {
    throwIfInvalid(validateId(data.companyId, 'companyId'));
    if (otp) {
      throwIfInvalid(validateString(otp, 'otp', 1, 10));
    }

    if (shouldUseMock()) {
      return mockRegisterAPI();
    }

    try {
      const headers: Record<string, string> = {};
      if (otp) {
        headers['Otp-Security-Code'] = otp;
      }

      const response = await axiosInstance.post<SignUpResponse>(
        'user/account/member/register',
        {
          ...data,
          otp: otp || null,
        },
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      logger.error('Register error', error);
      const apiError = handleApiError(error);
      const errorMessage = getUserFriendlyMessage(apiError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Send OTP for forgot password
   */
  async sendForgotPasswordOtp(email: string): Promise<void> {
    throwIfInvalid(validateEmail(email, 'email'));

    if (shouldUseMock()) {
      return mockSendForgotPasswordOtpAPI();
    }

    try {
      const response = await axiosInstance.post(
        '/auth/account/forgot-password/send-otp',
        { email }
      );
      logger.info('Send forgot password OTP successful');
      return response.data;
    } catch (error: unknown) {
      logger.error('Send forgot password OTP error', error);
      const apiError = handleApiError(error);
      const errorMessage = getUserFriendlyMessage(apiError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Verify OTP for forgot password
   */
  async verifyForgotPasswordOtp(email: string, otp: string): Promise<void> {
    throwIfInvalid(validateEmail(email, 'email'));
    throwIfInvalid(validateString(otp, 'otp', 1, 10));

    if (shouldUseMock()) {
      return mockVerifyForgotPasswordOtpAPI();
    }

    try {
      const response = await axiosInstance.post(
        '/auth/account/forgot-password/verify-otp',
        { email, otp }
      );
      logger.info('Verify forgot password OTP successful');
      return response.data;
    } catch (error: unknown) {
      logger.error('Verify forgot password OTP error', error);
      const apiError = handleApiError(error);
      const errorMessage = getUserFriendlyMessage(apiError);
      throw new Error(errorMessage);
    }
  },

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    throwIfInvalid(validateEmail(email, 'email'));
    throwIfInvalid(validateString(otp, 'otp', 1, 10));
    throwIfInvalid(validateString(newPassword, 'newPassword', 6, 255));

    if (shouldUseMock()) {
      return mockResetPasswordAPI();
    }

    try {
      const response = await axiosInstance.post(
        '/auth/account/forgot-password/reset',
        { email, otp, newPassword }
      );
      logger.info('Reset password successful');
      return response.data;
    } catch (error: unknown) {
      logger.error('Reset password error', error);
      const apiError = handleApiError(error);
      const errorMessage = getUserFriendlyMessage(apiError);
      throw new Error(errorMessage);
    }
  },
};
