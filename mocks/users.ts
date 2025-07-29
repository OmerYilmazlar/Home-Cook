import { Cook, Customer } from '@/types';

export const mockCooks: Cook[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    phone: '555-123-4567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    userType: 'cook',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Main St, San Francisco, CA'
    },
    bio: 'Passionate home cook specializing in authentic Mexican cuisine passed down through generations.',
    cuisineTypes: ['Mexican', 'Latin American'],
    rating: 4.8,
    reviewCount: 42,
    availableForPickup: true
  },
  {
    id: '2',
    name: 'James Chen',
    email: 'james@example.com',
    phone: '555-987-6543',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    userType: 'cook',
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: '456 Oak St, San Francisco, CA'
    },
    bio: 'Former restaurant chef now cooking authentic Chinese dishes from my home kitchen.',
    cuisineTypes: ['Chinese', 'Asian Fusion'],
    rating: 4.9,
    reviewCount: 37,
    availableForPickup: true
  },
  {
    id: '3',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '555-456-7890',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    userType: 'cook',
    location: {
      latitude: 37.7694,
      longitude: -122.4862,
      address: '789 Sunset Blvd, San Francisco, CA'
    },
    bio: 'Sharing my family recipes of authentic Indian cuisine with a modern twist.',
    cuisineTypes: ['Indian', 'Vegetarian'],
    rating: 4.7,
    reviewCount: 28,
    availableForPickup: true
  },
  {
    id: '4',
    name: 'Sofia Rossi',
    email: 'sofia@example.com',
    phone: '555-789-0123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    userType: 'cook',
    location: {
      latitude: 37.7569,
      longitude: -122.4478,
      address: '101 Pine St, San Francisco, CA'
    },
    bio: 'Italian home cook with a passion for pasta and traditional recipes from my grandmother.',
    cuisineTypes: ['Italian', 'Mediterranean'],
    rating: 4.6,
    reviewCount: 31,
    availableForPickup: true
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david@example.com',
    phone: '555-555-1234',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    userType: 'cook',
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: '567 Mission St, San Francisco, CA'
    },
    bio: 'Korean-American chef bringing authentic Korean flavors with a modern California twist.',
    cuisineTypes: ['Korean', 'Asian Fusion'],
    rating: 4.9,
    reviewCount: 45,
    availableForPickup: true
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '101',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '555-111-2222',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    userType: 'customer',
    location: {
      latitude: 37.7739,
      longitude: -122.4312,
      address: '222 Market St, San Francisco, CA'
    },
    favorites: ['1', '5', '8'],
    rating: 4.9,
    reviewCount: 15
  },
  {
    id: '102',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    phone: '555-333-4444',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4',
    userType: 'customer',
    location: {
      latitude: 37.7833,
      longitude: -122.4324,
      address: '333 Mission St, San Francisco, CA'
    },
    favorites: ['3', '7'],
    rating: 4.8,
    reviewCount: 9
  },
  {
    id: '103',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '555-777-8888',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5',
    userType: 'customer',
    location: {
      latitude: 37.7649,
      longitude: -122.4194,
      address: '444 Valencia St, San Francisco, CA'
    },
    favorites: ['2', '4', '6'],
    rating: 4.7,
    reviewCount: 12
  }
];