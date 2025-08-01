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
    rating: 4.8,
    reviewCount: 127,
    cuisineTypes: ['Mexican', 'Latin American'],
    availableForPickup: true
  },
  {
    id: 'cook-2',
    name: 'David Chen',
    email: 'david@example.com',
    userType: 'cook',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: 'Chinatown, San Francisco'
    },
    bio: 'Specializing in authentic Sichuan and Cantonese dishes with fresh, locally sourced ingredients.',
    rating: 4.9,
    reviewCount: 89,
    cuisineTypes: ['Chinese', 'Asian'],
    availableForPickup: true
  },
  {
    id: 'cook-3',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    userType: 'cook',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: 'Castro District, San Francisco'
    },
    bio: 'Farm-to-table American cuisine with a focus on seasonal ingredients and comfort food classics.',
    rating: 4.7,
    reviewCount: 156,
    cuisineTypes: ['American', 'Comfort Food'],
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
  },
  {
    id: 'customer-2',
    name: 'Emily Davis',
    email: 'emily@example.com',
    userType: 'customer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    location: {
      latitude: 37.7749,
      longitude: -122.4094,
      address: 'Marina District, San Francisco'
    },
    favorites: []
  },
  {
    id: 'customer-3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    userType: 'customer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: {
      latitude: 37.7649,
      longitude: -122.4394,
      address: 'Richmond District, San Francisco'
    },
    favorites: []
  }
];