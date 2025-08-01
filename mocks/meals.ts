import { Meal } from '@/types';

export const mockMeals: Meal[] = [
  {
    id: 'meal-1',
    cookId: 'cook-1', // Maria's ID
    name: 'test',
    description: 'test',
    price: 10,
    cuisineType: 'Mexican',
    images: [],
    availableQuantity: 2,
    pickupTimes: [
      {
        from: '2025-10-10T10:10:00.000Z',
        to: '2025-10-10T12:12:00.000Z'
      }
    ],
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString()
  }
];