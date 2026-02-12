/**
 * Sport Center Booking Model
 */

export type SportCenterBookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface SportCenterBooking {
  userEmail: string | undefined;
  id: string;
  facilityId: string;
  facilityName: string;
  facilityImageUrl?: string;
  category: string;
  date: string;
  timeSlot: string;
  status: SportCenterBookingStatus;
  amount: number;
  courtName?: string;
  address?: string;
  createdAt?: string;
}
