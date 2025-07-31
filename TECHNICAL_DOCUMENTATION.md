# 🍳 Home Cook App - Technical Documentation

## **Table of Contents**
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Application Architecture](#application-architecture)
- [Core Features & Technical Implementation](#core-features--technical-implementation)
- [Business Logic & Features](#business-logic--features)
- [Technical Optimizations](#technical-optimizations)
- [Scalability Considerations](#scalability-considerations)

---

## **Architecture & Technology Stack**

### **Core Technologies**
- **React Native + Expo SDK 53**: Cross-platform mobile application framework
- **TypeScript**: Full type safety with comprehensive interface definitions
- **Expo Router v5**: File-based routing system with nested layouts
- **Bun**: Fast JavaScript runtime and package manager for development
- **Zustand**: Lightweight state management with persistence middleware

### **Development Environment**
- **Metro Bundler**: JavaScript bundler optimized for React Native
- **Expo Go**: Development client for testing on physical devices
- **Git**: Version control integrated with GitHub repository
- **VS Code**: Development environment with TypeScript support

---

## **Application Architecture**

### **File Structure**
```
app/
├── (auth)/          # Authentication flow with stack navigation
│   ├── _layout.tsx  # Auth stack layout
│   ├── index.tsx    # Landing page
│   ├── login.tsx    # Login form
│   ├── signup.tsx   # Registration form
│   └── user-type.tsx # Role selection
├── (tabs)/          # Main app with bottom tab navigation
│   ├── _layout.tsx  # Tab navigation layout
│   ├── index.tsx    # Home dashboard
│   ├── explore.tsx  # Meal discovery
│   ├── orders.tsx   # Order management
│   ├── messages.tsx # Chat interface
│   └── profile.tsx  # User profile
├── cook/[id].tsx    # Dynamic cook profile pages
├── meal/[id].tsx    # Dynamic meal detail pages
├── rate-order/[id].tsx # Rating system interface
└── transaction-history.tsx # Payment history

components/          # Reusable UI components
├── Button.tsx       # Custom button component
├── Input.tsx        # Form input component
├── MealCard.tsx     # Meal display card
├── CookCard.tsx     # Cook profile card
├── ReservationCard.tsx # Order display card
└── WalletCard.tsx   # Payment interface

store/              # Zustand state management
├── auth-store.ts    # Authentication state
├── meals-store.ts   # Meal management
├── reservations-store.ts # Order tracking
├── payment-store.ts # Wallet & transactions
└── theme-store.ts   # UI theming

types/              # TypeScript type definitions
├── index.ts         # Core interfaces

mocks/              # Mock data for development
├── meals.ts         # Sample meal data
├── users.ts         # Sample user profiles
└── reservations.ts  # Sample orders

utils/              # Utility functions
└── validation.ts    # Form validation helpers
```

### **Navigation Architecture**
- **Nested Stack Navigation**: Authentication flow isolated from main app
- **Bottom Tab Navigation**: 5 tabs (Home, Explore, Orders, Messages, Profile)
- **Dynamic Routes**: Parameterized routes for user-specific content
- **Modal Presentations**: Overlay screens for forms and details

---

## **Core Features & Technical Implementation**

### **🔐 Authentication System**

#### **Technical Stack:**
- Zustand store with AsyncStorage persistence
- Role-based access control (Cook vs Customer)
- Session management with automatic state restoration

#### **Capabilities:**
- Dual user type system with different UI flows
- Persistent login sessions across app restarts
- User profile management with location services
- Mock authentication (ready for backend integration)

#### **Code Example:**
```typescript
// auth-store.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUserType: (type: UserType) => void;
}
```

### **💳 Payment System**

#### **Technical Implementation:**
- **Wallet Management**: Digital wallet with transaction tracking
- **Currency Handling**: Floating-point precision fixes with `roundCurrency()` utility
- **Transaction History**: Complete audit trail with timestamps
- **Payment Processing**: Mock payment gateway with realistic flow

#### **Features:**
- $100 starting balance for customers
- Real-time balance updates
- Transaction categorization (payments, refunds, earnings)
- Payment status tracking (pending → paid → completed)

#### **Code Example:**
```typescript
// payment-store.ts
interface PaymentState {
  wallets: Record<string, Wallet>;
  transactions: Transaction[];
  processPayment: (amount: number, customerId: string, cookId: string) => Promise<string>;
  roundCurrency: (amount: number) => number;
}

// Currency precision utility
roundCurrency: (amount: number) => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
```

### **⭐ Rating & Review System**

#### **Data Structure:**
```typescript
rating: {
  mealRating: number;      // 1-5 stars for meal quality
  cookRating: number;      // 1-5 stars for cook service
  reviewText: string;      // Optional written feedback
  customerId: string;      // Review author
  customerName: string;    // Display name
  createdAt: string;       // ISO timestamp
}
```

#### **UI Components:**
- Interactive star rating input
- Review text field with character limits
- Rating aggregation and display
- Historical review timeline

#### **Implementation:**
```typescript
// Rating calculation with precision
averageRating: (() => {
  const ratedReservations = reservations.filter(r => 
    cookMeals.some(m => m.id === r.mealId) && r.rating?.cookRating
  );
  if (ratedReservations.length === 0) return 0;
  const totalRating = ratedReservations.reduce((sum, r) => sum + (r.rating?.cookRating || 0), 0);
  const avg = totalRating / ratedReservations.length;
  return Math.round(avg * 10) / 10;
})()
```

### **🍽️ Meal Management**

#### **Technical Features:**
- **CRUD Operations**: Create, read, update, delete meals
- **Image Handling**: Placeholder image system with Unsplash integration
- **Inventory Management**: Quantity tracking with automatic decrementation
- **Categorization**: Cuisine types with filtering capabilities

#### **Data Flow:**
- Real-time synchronization between cook and customer views
- Cross-user data persistence with mock backend simulation
- Image URL generation with query parameters for optimal loading

#### **Code Example:**
```typescript
// meals-store.ts
interface MealsState {
  meals: Meal[];
  fetchMeals: () => Promise<void>;
  fetchMealsByCook: (cookId: string) => Promise<Meal[]>;
  createMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => Promise<string>;
  decreaseMealQuantity: (mealId: string, quantity: number) => void;
}
```

### **📱 State Management**

#### **Zustand Stores:**
1. **Auth Store**: User authentication and profile data
2. **Meals Store**: Meal CRUD operations and filtering
3. **Reservations Store**: Order management and status tracking
4. **Payment Store**: Wallet, transactions, and currency utilities
5. **Theme Store**: UI theming and color management
6. **Messaging Store**: Chat functionality (framework ready)

#### **Data Persistence:**
- AsyncStorage integration for offline capability
- Automatic state hydration on app launch
- Cross-session data consistency

#### **Store Configuration:**
```typescript
// Example store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      // ... store methods
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### **🎨 UI/UX System**

#### **Design System:**
- **Color Palette**: Consistent theming with light/dark mode support
- **Typography**: Responsive font scaling based on device size
- **Components**: Reusable UI library (Button, Input, Cards, etc.)
- **Animations**: Smooth transitions and micro-interactions

#### **Responsive Design:**
```typescript
// Dynamic sizing based on device width
const { width } = Dimensions.get('window');

statCard: {
  width: '47%',  // Percentage-based layout
  padding: width < 375 ? 12 : 14,  // Adaptive padding
  fontSize: width < 375 ? 20 : 24,  // Scalable typography
}
```

#### **Color System:**
```typescript
// constants/colors.ts
const lightColors = {
  primary: "#FF6B35",     // Vibrant orange
  secondary: "#4ECDC4",   // Soft teal
  background: "#FAFAFA",
  card: "#FFFFFF",
  text: "#1A1A1A",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};
```

#### **Accessibility:**
- Semantic UI structure
- Color contrast compliance
- Touch target optimization

---

## **Business Logic & Features**

### **🚀 Core Workflows**

#### **Cook Workflow:**
1. **Meal Creation**: Multi-step form with image selection and pricing
2. **Order Management**: Real-time order notifications and status updates
3. **Earnings Tracking**: Weekly/monthly revenue with detailed analytics
4. **Rating Dashboard**: Customer feedback aggregation and display

#### **Customer Workflow:**
1. **Meal Discovery**: Search, filter, and browse local offerings
2. **Ordering Process**: Quantity selection, payment processing, pickup scheduling
3. **Payment Integration**: Wallet-based transactions with history tracking
4. **Rating System**: Post-purchase feedback with dual rating (meal + cook)

### **📊 Analytics & Insights**

#### **Cook Dashboard Metrics:**
- **Active Meals**: Current inventory count
- **Total Orders**: Lifetime order statistics (excluding cancellations)
- **Weekly Earnings**: Revenue calculation with completion status filtering
- **Average Rating**: Real-time rating aggregation with precision rounding
- **Review Analytics**: Recent customer feedback with sentiment display

#### **Data Calculations:**
```typescript
// Cook statistics calculation
const cookStats = {
  activeMeals: cookMeals.length,
  
  totalOrders: reservations.filter(r => 
    cookMeals.some(m => m.id === r.mealId) && r.status !== 'cancelled'
  ).length,
  
  weeklyEarnings: roundCurrency(reservations
    .filter(r => {
      const meal = cookMeals.find(m => m.id === r.mealId);
      const isThisWeek = new Date(r.createdAt) > 
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return meal && r.status === 'completed' && isThisWeek;
    })
    .reduce((sum, r) => {
      const meal = cookMeals.find(m => m.id === r.mealId);
      return sum + (meal ? meal.price * r.quantity : 0);
    }, 0)),
    
  averageRating: Math.round((totalRating / count) * 10) / 10,
  
  totalReviews: reservations.filter(r => 
    cookMeals.some(m => m.id === r.mealId) && r.rating?.cookRating
  ).length
};
```

### **🔄 Order Management System**

#### **Order States:**
```typescript
type OrderStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
```

#### **Status Flow:**
1. **Pending**: Customer places order, payment processed
2. **Confirmed**: Cook accepts order, preparation begins
3. **Ready for Pickup**: Cook marks order ready
4. **Completed**: Customer picks up, rating enabled
5. **Cancelled**: Order cancelled by cook or customer

#### **Real-time Updates:**
```typescript
// reservations-store.ts
updateReservationStatus: (id: string, status: OrderStatus) => {
  set((state) => ({
    reservations: state.reservations.map(r =>
      r.id === id ? { ...r, status } : r
    ),
  }));
  
  // Trigger cross-user synchronization
  setTimeout(() => {
    get().fetchReservations();
  }, 100);
}
```

---

## **Technical Optimizations**

### **Performance**
- **Lazy Loading**: Component-level code splitting
- **Memoization**: React.useCallback for expensive computations
- **Image Optimization**: Query parameters for size-optimized images
- **State Efficiency**: Minimal re-renders with Zustand's selective subscriptions

#### **Performance Optimizations:**
```typescript
// Memoized callback for expensive operations
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  if (isCook && user?.id) {
    const meals = await fetchMealsByCook(user.id);
    setCookMeals(meals);
    await fetchReservations();
  } else {
    await fetchMeals();
  }
  setRefreshing(false);
}, [isCook, user?.id]);

// Optimized image URLs
const imageUrl = `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop`;
```

### **Error Handling**
- TypeScript strict mode for compile-time error prevention
- Runtime error boundaries for graceful failure handling
- Network error resilience with retry mechanisms
- Form validation with real-time feedback

#### **Error Boundaries:**
```typescript
// Form validation example
const validateMeal = (meal: Partial<Meal>): string[] => {
  const errors: string[] = [];
  if (!meal.name?.trim()) errors.push('Meal name is required');
  if (!meal.price || meal.price <= 0) errors.push('Price must be greater than 0');
  if (!meal.availableQuantity || meal.availableQuantity <= 0) errors.push('Quantity must be greater than 0');
  return errors;
};
```

### **Development Experience**
- **Hot Reloading**: Instant code changes during development
- **TypeScript Integration**: Full IntelliSense and type checking
- **Debugging Tools**: React Native debugger compatibility
- **Git Workflow**: Automated version control with meaningful commit messages

#### **Development Commands:**
```bash
# Start development server
bun run start --clear

# Type checking
bunx tsc --noEmit

# Build for production
bunx expo build

# Update dependencies
bunx expo upgrade
```

---

## **Scalability Considerations**

### **Backend Integration Ready**

#### **API Structure:**
```typescript
// Example API integration points
interface APIEndpoints {
  auth: {
    login: '/api/auth/login';
    register: '/api/auth/register';
    refresh: '/api/auth/refresh';
  };
  meals: {
    list: '/api/meals';
    create: '/api/meals';
    update: '/api/meals/:id';
    delete: '/api/meals/:id';
  };
  orders: {
    create: '/api/orders';
    list: '/api/orders';
    update: '/api/orders/:id';
  };
  payments: {
    process: '/api/payments/process';
    history: '/api/payments/history';
    wallet: '/api/payments/wallet';
  };
}
```

#### **Backend Integration Features:**
- Mock data structures mirror real API responses
- Async/await patterns prepared for HTTP requests
- State management designed for real-time data synchronization
- Authentication system ready for JWT token integration

### **Feature Extensions**

#### **Planned Features:**
- **Real-time Chat**: Messaging store foundation implemented
- **Push Notifications**: Expo notifications SDK ready
- **Location Services**: Geographic filtering and mapping
- **Advanced Search**: Full-text search with filtering capabilities
- **Admin Panel**: User management and analytics dashboard

#### **Database Schema (Planned):**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  user_type user_type_enum NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meals table
CREATE TABLE meals (
  id UUID PRIMARY KEY,
  cook_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  available_quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  meal_id UUID REFERENCES meals(id),
  customer_id UUID REFERENCES users(id),
  cook_id UUID REFERENCES users(id),
  status order_status_enum NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Microservices Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  Meals Service  │    │ Orders Service  │
│                 │    │                 │    │                 │
│ - JWT tokens    │    │ - CRUD ops      │    │ - Order flow    │
│ - User profiles │    │ - Search/filter │    │ - Status mgmt   │
│ - Role mgmt     │    │ - Image upload  │    │ - Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Payment Service │
                    │                 │
                    │ - Stripe/PayPal │
                    │ - Wallet mgmt   │
                    │ - Transactions  │
                    └─────────────────┘
```

### **Security Considerations**

#### **Current Security Features:**
- TypeScript for type safety
- Input validation on all forms
- Secure token storage (AsyncStorage)
- Role-based access control

#### **Production Security (Planned):**
- JWT token authentication
- HTTPS encryption
- Rate limiting
- Input sanitization
- SQL injection prevention
- XSS protection

#### **Security Implementation:**
```typescript
// Secure API client
class SecureAPIClient {
  private baseURL: string;
  private token: string | null = null;
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}
```

---

## **Deployment & DevOps**

### **Current Setup**
- **Development**: Expo Go for rapid prototyping
- **Version Control**: Git with GitHub integration
- **Package Management**: Bun for fast installs
- **Code Quality**: TypeScript strict mode

### **Production Deployment (Planned)**

#### **Mobile App Distribution:**
```yaml
# app.json configuration
{
  "expo": {
    "name": "Home Cook",
    "slug": "home-cook",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.homecook.app"
    },
    "android": {
      "package": "com.homecook.app"
    }
  }
}
```

#### **CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
name: Deploy App
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx expo build --platform all
      - run: bunx expo upload
```

### **Monitoring & Analytics**

#### **Performance Monitoring:**
- Expo Analytics for user behavior
- Sentry for error tracking
- Performance metrics with Flipper
- Custom analytics for business metrics

#### **Business Analytics:**
```typescript
// Analytics tracking
interface AnalyticsEvents {
  meal_created: { cookId: string; mealType: string };
  order_placed: { customerId: string; mealId: string; amount: number };
  rating_submitted: { orderId: string; rating: number };
  payment_processed: { amount: number; method: string };
}
```

---

## **Code Quality & Standards**

### **TypeScript Configuration**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### **Coding Standards**
- **ESLint**: Code linting with React Native rules
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages
- **Component Structure**: Consistent file organization

### **Testing Strategy (Planned)**
```typescript
// Unit tests with Jest
describe('Payment Service', () => {
  test('processes payment correctly', async () => {
    const paymentService = new PaymentService();
    const result = await paymentService.processPayment(29.99, 'customer1', 'cook1');
    expect(result).toHaveProperty('transactionId');
    expect(result.status).toBe('completed');
  });
});

// Integration tests with Detox
describe('Order Flow', () => {
  test('complete order process', async () => {
    await element(by.id('meal-card-1')).tap();
    await element(by.id('order-button')).tap();
    await element(by.id('confirm-payment')).tap();
    await expect(element(by.text('Order Confirmed'))).toBeVisible();
  });
});
```

---

This technical documentation provides a comprehensive overview of the Home Cook app's architecture, features, and implementation details. The app demonstrates modern React Native development practices with a focus on scalability, performance, and user experience.

**Repository**: [https://github.com/OmerYilmazlar/Home-Cook](https://github.com/OmerYilmazlar/Home-Cook)

**Last Updated**: July 31, 2025
