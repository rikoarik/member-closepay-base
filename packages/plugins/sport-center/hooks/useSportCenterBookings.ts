/**
 * useSportCenterBookings Hook
 * Manages Sport Center booking state
 */

import { useState, useCallback, useMemo } from 'react';
import type { SportCenterBooking } from '../models';

const MOCK_BOOKINGS: SportCenterBooking[] = [
  {
    id: 'b1',
    facilityId: 'f1',
    facilityName: 'Fitness First Premium',
    facilityImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    category: 'gym',
    date: '2025-02-11',
    timeSlot: '10:00',
    status: 'upcoming',
    amount: 50000,
    createdAt: '2025-02-10T14:00:00',
  },
  {
    id: 'b2',
    facilityId: 'f5',
    facilityName: 'Kolam Renang Keluarga',
    facilityImageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400',
    category: 'pool',
    date: '2025-02-09',
    timeSlot: '08:00',
    status: 'completed',
    amount: 25000,
    createdAt: '2025-02-08T09:00:00',
  },
];

export function useSportCenterBookings() {
  const [bookings, setBookings] = useState<SportCenterBooking[]>(MOCK_BOOKINGS);

  const addBooking = useCallback((booking: Omit<SportCenterBooking, 'id'>) => {
    const newBooking: SportCenterBooking = {
      ...booking,
      id: `b${Date.now()}`,
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  }, []);

  const recentBookings = useMemo(
    () => bookings.filter((b) => b.status === 'upcoming' || b.status === 'completed').slice(0, 5),
    [bookings]
  );

  return {
    bookings,
    recentBookings,
    addBooking,
  };
}
