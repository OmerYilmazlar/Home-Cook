export type UserType = 'cook' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  userType: UserType;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  bio?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Cook extends User {
  userType: 'cook';
  cuisineTypes?: string[];
  meals?: Meal[];
  availableForPickup?: boolean;
}

export interface Customer extends User {
  userType: 'customer';
  favorites?: string[]; // meal IDs
  reservations?: Reservation[];
}

export interface Meal {
  id: string;
  cookId: string;
  name: string;
  description: string;
  price: number;
  cuisineType: string;
  images: string[];
  ingredients?: string[];
  allergens?: string[];
  availableQuantity: number;
  pickupTimes: {
    from: string; // ISO string
    to: string; // ISO string
  }[];
  rating?: number;
  reviewCount?: number;
  createdAt: string; // ISO string
}

export interface Reservation {
  id: string;
  mealId: string;
  customerId: string;
  cookId: string;
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
  quantity: number;
  totalPrice: number;
  totalAmount?: number; // Same as totalPrice, for payment compatibility - defaults to totalPrice
  pickupTime: string; // ISO string
  createdAt: string; // ISO string
  paymentConfirmed?: boolean; // Track if payment is confirmed
  paymentId?: string; // Transaction ID from payment system
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  rating?: {
    mealRating: number;
    cookRating: number;
    reviewText: string;
    customerId: string;
    customerName: string;
    createdAt: string;
  };
}

export interface Review {
  id: string;
  mealId: string;
  cookId: string;
  customerId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO string
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string; // ISO string
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  lastMessage?: Message;
  unreadCount: number;
}