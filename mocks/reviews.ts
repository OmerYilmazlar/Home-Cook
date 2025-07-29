import { Review } from '@/types';

export const mockReviews: Review[] = [
  {
    id: '1',
    mealId: '1',
    cookId: '1',
    customerId: '101',
    rating: 5,
    comment: "The enchiladas were amazing! Authentic flavors and generous portions. Will definitely order again.",
    createdAt: '2025-07-05T19:30:00Z'
  },
  {
    id: '2',
    mealId: '2',
    cookId: '2',
    customerId: '102',
    rating: 5,
    comment: "Best dim sum I've had outside of a restaurant. Everything was fresh and delicious!",
    createdAt: '2025-07-06T14:15:00Z'
  },
  {
    id: '3',
    mealId: '3',
    cookId: '3',
    customerId: '101',
    rating: 4,
    comment: "The biryani had wonderful flavors. Would have given 5 stars but it was slightly less spicy than I prefer.",
    createdAt: '2025-07-07T20:00:00Z'
  },
  {
    id: '4',
    mealId: '4',
    cookId: '4',
    customerId: '102',
    rating: 5,
    comment: "This lasagna transported me straight to Italy! Layers of flavor and the perfect amount of cheese.",
    createdAt: '2025-07-08T19:45:00Z'
  },
  {
    id: '5',
    mealId: '7',
    cookId: '3',
    customerId: '101',
    rating: 5,
    comment: "The butter chicken was creamy, flavorful, and perfectly spiced. The naan was fresh and soft too!",
    createdAt: '2025-07-09T19:30:00Z'
  }
];