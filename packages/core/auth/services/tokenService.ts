/**
 * Token Service
 * Mengelola storage dan retrieval token menggunakan SecureStorage (native encrypted)
 * Semua data dienkripsi dengan Tink AEAD (AES-256-GCM)
 */
import SecureStorage from '../../native/SecureStorage';
import type { TokenService } from '../types';
import { getJWTExpiry, isJWTExpired as isJWTExpiredUtil } from '../utils/jwtUtils';

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
const TOKEN_EXPIRY_KEY = '@auth_token_expiry';

export const tokenService: TokenService = {
  /**
   * Get access token from storage
   * SecureStorage handles migration from old AsyncStorage/EncryptedStorage automatically
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await SecureStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('[TokenService] Error getting token:', error);
      return null;
    }
  },

  /**
   * Get refresh token from storage
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStorage.getItem(REFRESH_TOKEN_KEY);
      return refreshToken;
    } catch (error) {
      console.error('[TokenService] Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Save access token to storage (encrypted)
   * Auto-extract expiry from JWT if available
   */
  async setToken(token: string): Promise<void> {
    try {
      await SecureStorage.setItem(TOKEN_KEY, token);
      console.log('[TokenService] Token saved to SecureStorage');

      // Extract expiry from JWT if available
      const jwtExpiry = getJWTExpiry(token);
      if (jwtExpiry) {
        // JWT expiry is in milliseconds, store as timestamp
        await SecureStorage.setItem(TOKEN_EXPIRY_KEY, jwtExpiry.toString());
        console.log('[TokenService] Token expiry extracted from JWT:', new Date(jwtExpiry).toISOString());
      }
    } catch (error) {
      console.error('[TokenService] Error setting token:', error);
      throw error;
    }
  },

  /**
   * Save refresh token to storage (encrypted)
   */
  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await SecureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log('[TokenService] Refresh token saved to SecureStorage');
    } catch (error) {
      console.error('[TokenService] Error setting refresh token:', error);
      throw error;
    }
  },

  /**
   * Clear all tokens from storage
   */
  async clearTokens(): Promise<void> {
    try {
      await SecureStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY]);
      console.log('[TokenService] All tokens cleared');
    } catch (error) {
      console.error('[TokenService] Error clearing tokens:', error);
      throw error;
    }
  },

  /**
   * Get token expiry timestamp
   */
  async getTokenExpiry(): Promise<number | null> {
    try {
      const expiry = await SecureStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('[TokenService] Error getting token expiry:', error);
      return null;
    }
  },

  /**
   * Set token expiry timestamp
   * @param expiresIn - Expires in seconds from now
   */
  async setTokenExpiry(expiresIn: number): Promise<void> {
    try {
      const expiryTimestamp = Date.now() + expiresIn * 1000;
      await SecureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
      console.log('[TokenService] Token expiry set:', new Date(expiryTimestamp).toISOString());
    } catch (error) {
      console.error('[TokenService] Error setting token expiry:', error);
      throw error;
    }
  },

  /**
   * Check if token is expired
   * Checks JWT expiry first, then falls back to stored expiry
   */
  async isTokenExpired(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return true;

      // Try JWT expiry check first (more reliable)
      if (isJWTExpiredUtil(token)) {
        return true;
      }

      // Fallback to stored expiry
      const expiry = await this.getTokenExpiry();
      if (!expiry) return true;
      return Date.now() >= expiry;
    } catch (error) {
      console.error('[TokenService] Error checking token expiry:', error);
      return true;
    }
  },

  /**
   * Get time until token expires (in milliseconds)
   */
  async getTimeUntilExpiry(): Promise<number> {
    try {
      const expiry = await this.getTokenExpiry();
      if (!expiry) return 0;
      const timeLeft = expiry - Date.now();
      return timeLeft > 0 ? timeLeft : 0;
    } catch (error) {
      console.error('Error getting time until expiry:', error);
      return 0;
    }
  },
};
