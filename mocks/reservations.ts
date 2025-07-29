import { Reservation } from '@/types';

export const mockReservations: Reservation[] = [
  {
    id: '1',
    mealId: '1',
    customerId: '101',
    cookId: '1',
    status: 'confirmed',
    quantity: 2,
    totalPrice: 25.98,
    totalAmount: 25.98,
    pickupTime: '2025-07-10T18:00:00Z',
    createdAt: '2025-07-09T15:30:00Z',
    paymentStatus: 'paid',
    paymentConfirmed: true
  },
  {
    id: '2',
    mealId: '3',
    customerId: '101',
    cookId: '3',
    status: 'pending',
    quantity: 1,
    totalPrice: 14.99,
    totalAmount: 14.99,
    pickupTime: '2025-07-10T19:00:00Z',
    createdAt: '2025-07-09T16:45:00Z',
    paymentStatus: 'paid',
    paymentConfirmed: true
  },
  // Add some past reservations for customer 101 to test "Past" tab
  {
    id: '5',
    mealId: '2',
    customerId: '101',
    cookId: '2',
    status: 'completed',
    quantity: 1,
    totalPrice: 18.99,
    pickupTime: '2025-07-25T12:30:00Z',
    createdAt: '2025-07-24T10:15:00Z'
  },
  {
    id: '6',
    mealId: '5',
    customerId: '101',
    cookId: '4',
    status: 'cancelled',
    quantity: 2,
    totalPrice: 31.98,
    pickupTime: '2025-07-26T19:00:00Z',
    createdAt: '2025-07-25T14:20:00Z'
  },
  // Add some past reservations for cook ID '1' (Maria Garcia) to test cook's "Past" tab
  {
    id: '7',
    mealId: '1',
    customerId: '102',
    cookId: '1',
    status: 'completed',
    quantity: 1,
    totalPrice: 12.99,
    pickupTime: '2025-07-27T13:00:00Z',
    createdAt: '2025-07-26T09:00:00Z'
  },
  {
    id: '8',
    mealId: '1',
    customerId: '103',
    cookId: '1',
    status: 'cancelled',
    quantity: 3,
    totalPrice: 38.97,
    pickupTime: '2025-07-28T18:30:00Z',
    createdAt: '2025-07-27T15:30:00Z'
  },
  {
    id: '3',
    mealId: '2',
    customerId: '102',
    cookId: '2',
    status: 'completed',
    quantity: 2,
    totalPrice: 37.98,
    pickupTime: '2025-07-09T12:30:00Z',
    createdAt: '2025-07-08T10:15:00Z'
  },
  {
    id: '4',
    mealId: '7',
    customerId: '102',
    cookId: '3',
    status: 'confirmed',
    quantity: 1,
    totalPrice: 15.99,
    pickupTime: '2025-07-11T18:30:00Z',
    createdAt: '2025-07-09T14:20:00Z'
  }
];