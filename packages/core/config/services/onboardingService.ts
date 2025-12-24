/**
 * Onboarding Service
 * Service untuk manage onboarding state
 */

import SecureStorage from '../../native/SecureStorage';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

class OnboardingService {
  /**
   * Check if onboarding is completed
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await SecureStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    try {
      await SecureStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  /**
   * Reset onboarding (for testing or re-onboarding)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await SecureStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }
}

export const onboardingService = new OnboardingService();

