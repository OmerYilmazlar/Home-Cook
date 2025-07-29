import { Meal } from '@/types';

export const mockMeals: Meal[] = [
  {
    id: '1',
    cookId: '1',
    name: 'Authentic Chicken Enchiladas',
    description: 'Homemade corn tortillas filled with seasoned chicken, topped with red enchilada sauce and melted cheese. Served with rice and beans.',
    price: 12.99,
    cuisineType: 'Mexican',
    images: [
      'https://images.unsplash.com/photo-1534352956036-cd81e27dd615',
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f'
    ],
    ingredients: ['Corn tortillas', 'Chicken', 'Cheese', 'Enchilada sauce', 'Rice', 'Beans'],
    allergens: ['Dairy', 'Gluten'],
    availableQuantity: 8,
    pickupTimes: [
      {
        from: '2025-07-10T17:00:00Z',
        to: '2025-07-10T19:00:00Z'
      },
      {
        from: '2025-07-11T17:00:00Z',
        to: '2025-07-11T19:00:00Z'
      }
    ],
    rating: 4.8,
    reviewCount: 24,
    createdAt: '2025-07-09T14:30:00Z'
  },
  {
    id: '2',
    cookId: '2',
    name: 'Homemade Dim Sum Platter',
    description: 'Assortment of handmade dim sum including har gow (shrimp dumplings), siu mai (pork dumplings), and char siu bao (BBQ pork buns).',
    price: 18.99,
    cuisineType: 'Chinese',
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d',
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c'
    ],
    ingredients: ['Shrimp', 'Pork', 'Flour', 'Bamboo shoots', 'Mushrooms'],
    allergens: ['Shellfish', 'Gluten'],
    availableQuantity: 5,
    pickupTimes: [
      {
        from: '2025-07-10T11:00:00Z',
        to: '2025-07-10T13:00:00Z'
      },
      {
        from: '2025-07-11T11:00:00Z',
        to: '2025-07-11T13:00:00Z'
      }
    ],
    rating: 4.9,
    reviewCount: 31,
    createdAt: '2025-07-09T09:15:00Z'
  },
  {
    id: '3',
    cookId: '3',
    name: 'Vegetable Biryani',
    description: 'Fragrant basmati rice cooked with mixed vegetables, saffron, and aromatic spices. Served with raita and papadum.',
    price: 14.99,
    cuisineType: 'Indian',
    images: [
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7'
    ],
    ingredients: ['Basmati rice', 'Mixed vegetables', 'Saffron', 'Spices', 'Yogurt'],
    allergens: ['Dairy'],
    availableQuantity: 6,
    pickupTimes: [
      {
        from: '2025-07-10T18:00:00Z',
        to: '2025-07-10T20:00:00Z'
      },
      {
        from: '2025-07-11T18:00:00Z',
        to: '2025-07-11T20:00:00Z'
      }
    ],
    rating: 4.7,
    reviewCount: 19,
    createdAt: '2025-07-09T11:45:00Z'
  },
  {
    id: '4',
    cookId: '4',
    name: 'Homemade Lasagna',
    description: 'Traditional Italian lasagna with layers of pasta, rich meat sauce, béchamel, and three cheeses. Served with garlic bread.',
    price: 16.99,
    cuisineType: 'Italian',
    images: [
      'https://images.unsplash.com/photo-1574894709920-11b28e7367e3',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141'
    ],
    ingredients: ['Pasta sheets', 'Ground beef', 'Tomatoes', 'Cheese', 'Béchamel sauce'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    availableQuantity: 4,
    pickupTimes: [
      {
        from: '2025-07-10T17:30:00Z',
        to: '2025-07-10T19:30:00Z'
      },
      {
        from: '2025-07-11T17:30:00Z',
        to: '2025-07-11T19:30:00Z'
      }
    ],
    rating: 4.9,
    reviewCount: 27,
    createdAt: '2025-07-09T10:00:00Z'
  },
  {
    id: '5',
    cookId: '1',
    name: 'Homemade Guacamole & Chips',
    description: 'Fresh guacamole made with ripe avocados, lime, cilantro, and a hint of jalapeño. Served with homemade tortilla chips.',
    price: 8.99,
    cuisineType: 'Mexican',
    images: [
      'https://images.unsplash.com/photo-1600335895229-6e75511892c8',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b'
    ],
    ingredients: ['Avocados', 'Lime', 'Cilantro', 'Jalapeño', 'Corn tortillas'],
    allergens: ['Gluten'],
    availableQuantity: 10,
    pickupTimes: [
      {
        from: '2025-07-10T16:00:00Z',
        to: '2025-07-10T20:00:00Z'
      },
      {
        from: '2025-07-11T16:00:00Z',
        to: '2025-07-11T20:00:00Z'
      }
    ],
    rating: 4.6,
    reviewCount: 15,
    createdAt: '2025-07-09T15:20:00Z'
  },
  {
    id: '6',
    cookId: '2',
    name: 'Kung Pao Chicken',
    description: 'Spicy stir-fried chicken with peanuts, vegetables, and chili peppers. Served with steamed rice.',
    price: 13.99,
    cuisineType: 'Chinese',
    images: [
      'https://images.unsplash.com/photo-1525755662778-989d0524087e',
      'https://images.unsplash.com/photo-1623689046286-01d442216df1'
    ],
    ingredients: ['Chicken', 'Peanuts', 'Bell peppers', 'Chili peppers', 'Rice'],
    allergens: ['Nuts'],
    availableQuantity: 7,
    pickupTimes: [
      {
        from: '2025-07-10T17:00:00Z',
        to: '2025-07-10T19:00:00Z'
      },
      {
        from: '2025-07-11T17:00:00Z',
        to: '2025-07-11T19:00:00Z'
      }
    ],
    rating: 4.8,
    reviewCount: 22,
    createdAt: '2025-07-09T12:10:00Z'
  },
  {
    id: '7',
    cookId: '3',
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich, creamy tomato sauce with aromatic spices. Served with naan bread and basmati rice.',
    price: 15.99,
    cuisineType: 'Indian',
    images: [
      'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db',
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641'
    ],
    ingredients: ['Chicken', 'Tomatoes', 'Cream', 'Spices', 'Rice', 'Naan'],
    allergens: ['Dairy', 'Gluten'],
    availableQuantity: 5,
    pickupTimes: [
      {
        from: '2025-07-10T18:00:00Z',
        to: '2025-07-10T20:00:00Z'
      },
      {
        from: '2025-07-11T18:00:00Z',
        to: '2025-07-11T20:00:00Z'
      }
    ],
    rating: 4.9,
    reviewCount: 29,
    createdAt: '2025-07-09T13:30:00Z'
  },
  {
    id: '8',
    cookId: '4',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream, dusted with cocoa powder.',
    price: 7.99,
    cuisineType: 'Italian',
    images: [
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
      'https://images.unsplash.com/photo-1542124948-dc391252a940'
    ],
    ingredients: ['Ladyfingers', 'Mascarpone', 'Coffee', 'Cocoa', 'Eggs'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    availableQuantity: 8,
    pickupTimes: [
      {
        from: '2025-07-10T15:00:00Z',
        to: '2025-07-10T20:00:00Z'
      },
      {
        from: '2025-07-11T15:00:00Z',
        to: '2025-07-11T20:00:00Z'
      }
    ],
    rating: 4.9,
    reviewCount: 34,
    createdAt: '2025-07-09T14:00:00Z'
  }
];