/**
 * Sport Center Plugin
 * Fitness and sports facility booking - gym, court, swimming pool
 */

export { SportCenterScreen } from './components/screens';
export { SportCenterFacilityDetailScreen } from './components/screens';
export { SportCenterBookingScreen } from './components/screens';
export { SportCenterCheckoutScreen } from './components/screens';
export { SportCenterMyBookingsScreen } from './components/screens';

export { useSportCenterData, useSportCenterBookings, getNearbyFacilities } from './hooks';
export type { SportCenterFacility, SportCenterBooking } from './models';
export {
  FacilityCard,
  FacilityCardSkeleton,
  SportCenterCategoryTabs,
  VenueTerdekatCard,
} from './components/shared';
export type { SportCenterCategoryTab } from './components/shared';

export const SportCenterModule = {
  id: 'sport-center',
  name: 'Sport Center',
  screens: {
    SportCenter: 'SportCenterScreen',
    SportCenterFacilityDetail: 'SportCenterFacilityDetailScreen',
    SportCenterBooking: 'SportCenterBookingScreen',
    SportCenterCheckout: 'SportCenterCheckoutScreen',
    SportCenterMyBookings: 'SportCenterMyBookingsScreen',
  },
};
