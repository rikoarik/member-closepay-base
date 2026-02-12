/**
 * Sport Center Plugin
 * Fitness and sports facility booking - gym, court, swimming pool
 */

export { SportCenterScreen } from './components/screens';
export { SportCenterFacilityDetailScreen } from './components/screens';
export { SportCenterBookingScreen } from './components/screens';
export { SportCenterCheckoutScreen } from './components/screens';
export { SportCenterMyBookingsScreen } from './components/screens';
export { SportCenterSearchScreen } from './components/screens';
export { SportCenterSearchResultsScreen } from './components/screens';
export { SportCenterBookingCheckoutScreen } from './components/screens';

export { SportCenterBookingDetailScreen } from './components/screens';

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
    SportCenterBookingDetail: 'SportCenterBookingDetailScreen',
    SportCenterCheckout: 'SportCenterCheckoutScreen',
    SportCenterMyBookings: 'SportCenterMyBookingsScreen',
    SportCenterSearch: 'SportCenterSearchScreen',
    SportCenterSearchResults: 'SportCenterSearchResultsScreen',
    SportCenterBookingCheckout: 'SportCenterBookingCheckoutScreen',
  },
};
