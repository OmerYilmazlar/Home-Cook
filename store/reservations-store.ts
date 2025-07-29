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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const state = get();
      
      // First check in all reservations (includes newly created ones)
      let reservation = state.reservations.find(r => r.id === id);
      
      // If not found, check in mock data
      if (!reservation) {
        reservation = mockReservations.find(r => r.id === id);
      }
      
      // If still not found, check in customer/cook reservations
      if (!reservation) {
        reservation = state.customerReservations.find(r => r.id === id) || 
                     state.cookReservations.find(r => r.id === id);
      }
      
      if (!reservation) {
        console.error('Reservation not found with ID:', id);
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
      };
      
      console.log('New reservation created:', newReservation);
      
      // CRITICAL: Add to mock data directly for persistence
      mockReservations.push(newReservation);
      console.log('Added new reservation to mock data. Total mock reservations:', mockReservations.length);
      
      // Process payment when creating reservation
      try {
        const { processPayment } = usePaymentStore.getState();
        const paymentAmount = reservation.totalAmount || reservation.totalPrice;
        const transaction = await processPayment(
          reservation.customerId,
          reservation.cookId,
          paymentAmount,
          newReservation.id,
          `Payment for ${reservation.quantity}x meal reservation`
        );
        
        // Update reservation with payment info
        newReservation.paymentId = transaction.id;
        newReservation.paymentStatus = 'pending' as const; // Payment is processed but not completed yet
        newReservation.totalAmount = paymentAmount;
        
        console.log('Payment processed for reservation:', {
          reservationId: newReservation.id,
          transactionId: transaction.id,
          amount: paymentAmount
        });
      } catch (paymentError) {
        console.error('Payment failed:', paymentError);
        throw new Error(`Payment failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`);
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
            // Mark payment as paid when order is completed
            if (status === 'completed' && reservation.paymentId) {
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
            if (status === 'completed' && reservation.paymentId) {
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
            if (status === 'completed' && reservation.paymentId) {
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
        if (reservation.mealId) {
          // Update meal rating - this is a simplified approach
          // In a real app, you'd aggregate all ratings for the meal
          useMealsStore.getState().updateMealRating(reservation.mealId, rating.mealRating);
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