import { Cook, Customer } from '@/types';

export const mockCooks: Cook[] = [
  {
    id: 'cook-1',
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    userType: 'cook',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'Mission District, San Francisco'
    },
    bio: 'Authentic Mexican cuisine made with love and traditional recipes passed down through generations.',
    rating: 0,
    reviewCount: 0,
    cuisineTypes: ['Mexican', 'Latin American'],
    availableForPickup: true
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: 'John Smith',
    email: 'john@example.com',
    userType: 'customer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: {
      latitude: 37.7849,
      longitude: -122.4194,
      address: 'SOMA, San Francisco'
    },
    favorites: []
  }
];