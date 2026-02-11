/**
 * Sport Center Booking Model
 */

export type SportCenterBookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface SportCenterBooking {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityImageUrl?: string;
  category: string;
  date: string;
  timeSlot: string;
  status: SportCenterBookingStatus;
  amount: number;
  createdAt?: string;
}
