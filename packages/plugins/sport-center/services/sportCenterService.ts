/**
 * Sport Center Service
 * Booking logic (mock - untuk development)
 */

import type { SportCenterTimeSlot } from '../models';

export const getAvailableTimeSlots = async (
  facilityId: string,
  date: string
): Promise<SportCenterTimeSlot[]> => {
  const slots: SportCenterTimeSlot[] = [
    { time: '08:00', available: true, price: 50000 },
    { time: '09:00', available: true, price: 50000 },
    { time: '10:00', available: false, price: 50000 },
    { time: '11:00', available: true, price: 50000 },
    { time: '12:00', available: true, price: 50000 },
    { time: '13:00', available: true, price: 50000 },
    { time: '14:00', available: false, price: 50000 },
    { time: '15:00', available: true, price: 50000 },
    { time: '16:00', available: true, price: 50000 },
    { time: '17:00', available: true, price: 50000 },
  ];
  return Promise.resolve(slots);
};
