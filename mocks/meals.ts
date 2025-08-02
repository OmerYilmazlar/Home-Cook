import { Meal } from '@/types';

export const mockMeals: Meal[] = [
  {
    id: 'meal-1',
    cookId: 'cook-1', // Maria's ID
    name: 'Authentic Chicken Tacos al Pastor',
    description: 'Traditional Mexican tacos with marinated chicken, fresh pineapple, onions, and cilantro. Served with homemade corn tortillas and spicy salsa verde.',
    price: 15,
    cuisineType: 'Mexican',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center'],
    ingredients: [
      'Chicken thighs',
      'Corn tortillas',
      'Fresh pineapple',
      'White onion',
      'Fresh cilantro',
      'Lime',
      'Achiote paste',
      'Orange juice',
      'Garlic',
      'Cumin',
      'Oregano',
      'Tomatillos',
      'Jalapeño peppers',
      'Salt'
    ],
    allergens: [
      'May contain traces of gluten from corn processing'
    ],
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