import { create } from 'zustand';
import { Reservation } from '@/types';
import { mockReservations } from '@/mocks/reservations';
import { usePaymentStore } from '@/store/payment-store';
import { useMealsStore } from '@/store/meals-store';

interface ReservationsState {
  reservations: Reservation[];
  customerReservations: Reservation[];
  cookReservations: Reservation[];
  selectedReservation: Reservation | null;
  isLoading: boolean;
  error: string | null;
  
  fetchReservations: () => Promise<void>;
  fetchReservationById: (id: string) => Promise<void>;
  fetchCustomerReservations: (customerId: string) => Promise<void>;
  fetchCookReservations: (cookId: string) => Promise<void>;
  createReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  submitRating: (reservationId: string, rating: { mealRating: number; cookRating: number; reviewText: string; customerId: string; customerName: string }) => Promise<void>;
  refreshAllReservations: (currentUserId: string, userType: 'customer' | 'cook') => Promise<void>;
}

export const useReservationsStore = create<ReservationsState>((set, get) => ({
  reservations: [],
  customerReservations: [],
  cookReservations: [],
  selectedReservation: null,
  isLoading: false,
  error: null,
  
  fetchReservations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ 
        reservations: mockReservations,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch reservations', 
        isLoading: false 
      });
    }
  },
  
  fetchReservationById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching reservation by ID:', id);
      console.log('Available reservations in mock data:', mockReservations.map(r => ({ id: r.id, status: r.status })));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const state = get();
      console.log('Available reservations in state:', state.reservations.map(r => ({ id: r.id, status: r.status })));
      
      // Search in all possible locations
      let reservation = 
        // First check in all reservations (includes newly created ones)
        state.reservations.find(r => r.id === id) ||
        // Check in mock data
        mockReservations.find(r => r.id === id) ||
        // Check in customer/cook reservations
        state.customerReservations.find(r => r.id === id) ||
        state.cookReservations.find(r => r.id === id);
      
      if (!reservation) {
        console.error('Reservation not found with ID:', id);
        console.error('Available reservation IDs:', [
          ...state.reservations.map(r => r.id),
          ...mockReservations.map(r => r.id),
          ...state.customerReservations.map(r => r.id),
          ...state.cookReservations.map(r => r.id)
        ]);
        throw new Error('Reservation not found');
      }
      
      console.log('Found reservation:', reservation);
      
      set({ selectedReservation: reservation, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch reservation:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch reservation', 
        isLoading: false 
      });
    }
  },
  
  fetchCustomerReservations: async (customerId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching customer reservations for:', customerId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Include both mock reservations and any new ones in the store
      const state = get();
      const mockCustomerReservations = mockReservations.filter(r => r.customerId === customerId);
      const newReservations = state.reservations.filter(r => 
        r.customerId === customerId && !mockReservations.find(mock => mock.id === r.id)
      );
      
      const allCustomerReservations = [...mockCustomerReservations, ...newReservations];
      
      console.log('Found customer reservations:', allCustomerReservations.length);
      console.log('Reservation statuses:', allCustomerReservations.map(r => ({ id: r.id, status: r.status })));
      
      set({ customerReservations: allCustomerReservations, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch customer reservations:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch customer reservations', 
        isLoading: false 
      });
    }
  },
  
  fetchCookReservations: async (cookId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching cook reservations for:', cookId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Include both mock reservations and any new ones in the store
      const state = get();
      const mockCookReservations = mockReservations.filter(r => r.cookId === cookId);
      const newReservations = state.reservations.filter(r => 
        r.cookId === cookId && !mockReservations.find(mock => mock.id === r.id)
      );
      
      const allCookReservations = [...mockCookReservations, ...newReservations];
      
      console.log('Found cook reservations:', allCookReservations.length);
      console.log('Cook reservation statuses:', allCookReservations.map(r => ({ id: r.id, status: r.status })));
      
      set({ cookReservations: allCookReservations, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch cook reservations:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch cook reservations', 
        isLoading: false 
      });
    }
  },
  
  createReservation: async (reservation) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Creating reservation:', reservation);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newReservation: Reservation = {
        ...reservation,
        id: `new-${Date.now()}`,
        createdAt: new Date().toISOString(),
        paymentStatus: 'pending', // Payment will be processed later
        totalAmount: reservation.totalAmount || reservation.totalPrice,
      };
      
      console.log('New reservation created:', newReservation);
      
      // CRITICAL: Add to mock data directly for persistence
      mockReservations.push(newReservation);
      console.log('Added new reservation to mock data. Total mock reservations:', mockReservations.length);
      console.log('New reservation added with ID:', newReservation.id);
      
      // Decrease meal quantity immediately upon reservation
      try {
        const { decreaseMealQuantity } = useMealsStore.getState();
        decreaseMealQuantity(reservation.mealId, reservation.quantity);
        console.log(`Decreased meal quantity for meal ${reservation.mealId} by ${reservation.quantity}`);
      } catch (error) {
        console.error('Failed to decrease meal quantity:', error);
        // Continue with reservation creation even if quantity update fails
      }
      
      set(state => {
        console.log('Current state before update:', {
          customerReservationsLength: state.customerReservations.length,
          cookReservationsLength: state.cookReservations.length,
          newReservationCustomerId: reservation.customerId,
          newReservationCookId: reservation.cookId
        });
        
        // Always add to the customer reservations if it matches the customer
        const updatedCustomerReservations = state.customerReservations.length === 0 ||
          state.customerReservations.some(r => r.customerId === reservation.customerId)
          ? [...state.customerReservations, newReservation]
          : state.customerReservations;
          
        // Always add to the cook reservations if it matches the cook
        const updatedCookReservations = state.cookReservations.length === 0 ||
          state.cookReservations.some(r => r.cookId === reservation.cookId)
          ? [...state.cookReservations, newReservation]
          : state.cookReservations;
        
        const newState = {
          reservations: [...state.reservations, newReservation],
          customerReservations: updatedCustomerReservations,
          cookReservations: updatedCookReservations,
          isLoading: false 
        };
        
        console.log('Updated state:', {
          customerReservationsLength: newState.customerReservations.length,
          cookReservationsLength: newState.cookReservations.length
        });
        
        return newState;
      });
    } catch (error) {
      console.error('Failed to create reservation:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create reservation', 
        isLoading: false 
      });
      throw error; // Re-throw to handle in UI
    }
  },
  
  updateReservationStatus: async (id: string, status: Reservation['status']) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Updating reservation status:', { id, status });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Process payment when meal is ready for pickup
      if (status === 'ready_for_pickup') {
        try {
          const { reservations } = get();
          const reservation = reservations.find(r => r.id === id);
          
          if (reservation && !reservation.paymentId) {
            const { processPayment } = usePaymentStore.getState();
            const paymentAmount = reservation.totalAmount || reservation.totalPrice;
            const transaction = await processPayment(
              reservation.customerId,
              reservation.cookId,
              paymentAmount,
              reservation.id,
              `Payment for ${reservation.quantity}x meal pickup`
            );
            
            console.log('Payment processed for ready meal:', {
              reservationId: reservation.id,
              transactionId: transaction.id,
              amount: paymentAmount
            });
            
            // Update the reservation with payment info in mock data
            const mockReservation = mockReservations.find(r => r.id === id);
            if (mockReservation) {
              mockReservation.paymentId = transaction.id;
              mockReservation.paymentStatus = 'paid';
            }
          }
        } catch (paymentError) {
          console.error('Payment failed for ready meal:', paymentError);
          set({ 
            error: `Payment failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`, 
            isLoading: false 
          });
          throw new Error(`Payment failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`);
        }
      }
      
      // Handle payment completion when order is completed
      if (status === 'completed') {
        try {
          const { reservations } = get();
          const reservation = reservations.find(r => r.id === id);
          
          if (reservation?.paymentId) {
            const { completePayment } = usePaymentStore.getState();
            const success = await completePayment(reservation.paymentId);
            
            if (success) {
              console.log('Payment completed for reservation:', id);
            } else {
              console.error('Failed to complete payment for reservation:', id);
            }
          }
        } catch (paymentError) {
          console.error('Error completing payment:', paymentError);
          // Continue with status update even if payment completion fails
        }
      }
      
      set(state => {
        // Update the main reservations array
        const updatedReservations = state.reservations.map(reservation => {
          if (reservation.id === id) {
            const updatedReservation = { ...reservation, status };
            // Mark payment as paid when meal is ready for pickup or completed
            if (status === 'ready_for_pickup' || status === 'completed') {
              updatedReservation.paymentStatus = 'paid' as const;
            }
            return updatedReservation;
          }
          return reservation;
        });
        
        // Update customer reservations
        const updatedCustomerReservations = state.customerReservations.map(reservation => {
          if (reservation.id === id) {
            const updatedReservation = { ...reservation, status };
            if (status === 'ready_for_pickup' || status === 'completed') {
              updatedReservation.paymentStatus = 'paid' as const;
            }
            return updatedReservation;
          }
          return reservation;
        });
        
        // Update cook reservations
        const updatedCookReservations = state.cookReservations.map(reservation => {
          if (reservation.id === id) {
            const updatedReservation = { ...reservation, status };
            if (status === 'ready_for_pickup' || status === 'completed') {
              updatedReservation.paymentStatus = 'paid' as const;
            }
            return updatedReservation;
          }
          return reservation;
        });
        
        // Update selected reservation
        const updatedSelectedReservation = 
          state.selectedReservation?.id === id 
            ? { 
                ...state.selectedReservation, 
                status,
                ...(status === 'completed' && state.selectedReservation.paymentId ? { paymentStatus: 'paid' as const } : {})
              } 
            : state.selectedReservation;
        
        // CRITICAL: Also update the mock data directly to ensure persistence
        const mockReservationIndex = mockReservations.findIndex(r => r.id === id);
        if (mockReservationIndex !== -1) {
          mockReservations[mockReservationIndex] = {
            ...mockReservations[mockReservationIndex],
            status
          };
          console.log('Updated mock reservation:', {
            id,
            newStatus: status,
            mockReservation: mockReservations[mockReservationIndex]
          });
        }
        
        // Handle meal quantity decrease when order is confirmed
        if (status === 'confirmed') {
          try {
            const { reservations } = get();
            const reservation = reservations.find(r => r.id === id) || 
                              mockReservations.find(r => r.id === id);
            
            if (reservation) {
              const { decreaseMealQuantity } = useMealsStore.getState();
              // Don't await here since we're in a synchronous callback
              decreaseMealQuantity(reservation.mealId, reservation.quantity).catch(error => {
                console.error('Error decreasing meal quantity:', error);
              });
              console.log('Meal quantity decrease triggered for confirmed order:', {
                reservationId: id,
                mealId: reservation.mealId,
                quantity: reservation.quantity
              });
            }
          } catch (mealError) {
            console.error('Error decreasing meal quantity:', mealError);
            // Continue with status update even if meal quantity decrease fails
          }
        }
        
        // If status is 'completed', we would decrease meal availability here
        // In a real app, this would be handled by the backend
        if (status === 'completed') {
          console.log('Order completed - meal inventory should be decreased');
          // TODO: Implement meal inventory decrease
        }
        
        console.log('Status update complete:', {
          reservationId: id,
          newStatus: status,
          updatedInMockData: mockReservationIndex !== -1
        });
        
        return { 
          reservations: updatedReservations,
          customerReservations: updatedCustomerReservations,
          cookReservations: updatedCookReservations,
          selectedReservation: updatedSelectedReservation,
          isLoading: false 
        };
      });
      
      // Auto-redirect to past section when customer completes order
      if (status === 'completed') {
        // Get current user to check if they're a customer
        try {
          const { useAuthStore } = await import('./auth-store');
          const currentUser = useAuthStore.getState().user;
          
          if (currentUser?.userType === 'customer') {
            // Import router dynamically to avoid circular dependencies
            setTimeout(() => {
              try {
                const { router } = require('expo-router');
                router.push('/(tabs)/orders?tab=past');
                console.log('Redirected customer to past orders after completion');
              } catch (error) {
                console.error('Failed to redirect to past orders:', error);
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Failed to check user type for redirect:', error);
        }
      }
      
      // Force refresh all reservation data to ensure sync across all users
      // This simulates real-time updates that would happen in a real app
      setTimeout(async () => {
        try {
          // Get the updated reservation to find affected users
          const updatedReservation = get().reservations.find(r => r.id === id) || 
                                   mockReservations.find(r => r.id === id);
          
          if (updatedReservation) {
            // Refresh both customer and cook data
            await get().fetchCustomerReservations(updatedReservation.customerId);
            await get().fetchCookReservations(updatedReservation.cookId);
            console.log('Cross-user reservation sync completed');
          }
        } catch (syncError) {
          console.error('Failed to sync reservations across users:', syncError);
        }
      }, 100); // Small delay to ensure state update completes first
      
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update reservation status', 
        isLoading: false 
      });
    }
  },
  
  cancelReservation: async (id: string) => {
    return get().updateReservationStatus(id, 'cancelled');
  },

  submitRating: async (reservationId: string, rating: { mealRating: number; cookRating: number; reviewText: string; customerId: string; customerName: string }) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Submitting rating for reservation:', reservationId, rating);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the reservation with rating data
      const { reservations } = get();
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (reservation) {
        // Add rating to the reservation
        const updatedReservation = {
          ...reservation,
          rating: {
            mealRating: rating.mealRating,
            cookRating: rating.cookRating,
            reviewText: rating.reviewText,
            customerId: rating.customerId,
            customerName: rating.customerName,
            createdAt: new Date().toISOString()
          }
        };
        
        // Update in all reservation arrays
        set(state => ({
          reservations: state.reservations.map(r => 
            r.id === reservationId ? updatedReservation : r
          ),
          customerReservations: state.customerReservations.map(r => 
            r.id === reservationId ? updatedReservation : r
          ),
          cookReservations: state.cookReservations.map(r => 
            r.id === reservationId ? updatedReservation : r
          ),
          selectedReservation: state.selectedReservation?.id === reservationId 
            ? updatedReservation 
            : state.selectedReservation,
          isLoading: false,
        }));
        
        // Update mock data for persistence
        const mockReservation = mockReservations.find(r => r.id === reservationId);
        if (mockReservation) {
          mockReservation.rating = updatedReservation.rating;
        }
        
        // Update meal and cook ratings (this would typically be done on the backend)
        const { useMealsStore } = await import('./meals-store');
        const { useAuthStore } = await import('./auth-store');
        
        if (reservation.mealId) {
          // Update meal rating - this is a simplified approach
          // In a real app, you'd aggregate all ratings for the meal
          useMealsStore.getState().updateMealRating(reservation.mealId, rating.mealRating);
        }
        
        // Update cook's rating and review count
        if (reservation.cookId) {
          // Update in auth store (this will update the logged-in user if it's the cook)
          useAuthStore.getState().updateUserRating(reservation.cookId, rating.cookRating);
          
          // Also update the cook in mockCooks for consistency
          try {
            const { mockCooks } = await import('@/mocks/users');
            const cookIndex = mockCooks.findIndex(c => c.id === reservation.cookId);
            if (cookIndex !== -1) {
              const cook = mockCooks[cookIndex];
              const currentRating = cook.rating || 0;
              const currentReviewCount = cook.reviewCount || 0;
              const newReviewCount = currentReviewCount + 1;
              const totalRatingPoints = (currentRating * currentReviewCount) + rating.cookRating;
              const newAverageRating = totalRatingPoints / newReviewCount;
              
              // Update the mock cook data
              mockCooks[cookIndex] = {
                ...cook,
                rating: Math.round(newAverageRating * 10) / 10,
                reviewCount: newReviewCount
              };
              
              console.log('Updated cook in mockCooks:', {
                cookId: reservation.cookId,
                newRating: mockCooks[cookIndex].rating,
                newReviewCount: mockCooks[cookIndex].reviewCount
              });
              
              // Force refresh the current user if they are the cook being rated
              const currentUser = useAuthStore.getState().user;
              if (currentUser && currentUser.id === reservation.cookId) {
                // Update the current user with the new rating
                const updatedUser = {
                  ...currentUser,
                  rating: mockCooks[cookIndex].rating,
                  reviewCount: mockCooks[cookIndex].reviewCount
                };
                useAuthStore.setState({ user: updatedUser });
                console.log('Updated current user rating in auth store:', updatedUser);
              }
            }
          } catch (error) {
            console.error('Failed to update cook in mockCooks:', error);
          }
        }
        
        console.log('Rating submitted successfully');
      }
      
    } catch (error) {
      console.error('Failed to submit rating:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit rating', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  refreshAllReservations: async (currentUserId: string, userType: 'customer' | 'cook') => {
    try {
      console.log('Refreshing all reservations for:', { currentUserId, userType });
      
      if (userType === 'customer') {
        await get().fetchCustomerReservations(currentUserId);
      } else if (userType === 'cook') {
        await get().fetchCookReservations(currentUserId);
      }
      
      console.log('Reservation refresh complete');
    } catch (error) {
      console.error('Failed to refresh reservations:', error);
    }
  },
}));