import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, User, MessageCircle } from 'lucide-react-native';
import { useReservationsStore } from '@/store/reservations-store';
import { useAuthStore } from '@/store/auth-store';
import { useMessagingStore } from '@/store/messaging-store';
import { useMealsStore } from '@/store/meals-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { mockCooks, mockCustomers } from '@/mocks/users';

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { selectedReservation, fetchReservationById, updateReservationStatus, isLoading } = useReservationsStore();
  const { user } = useAuthStore();
  const { createConversation } = useMessagingStore();
  const { meals, fetchMeals } = useMealsStore();
  
  useEffect(() => {
    if (id) {
      console.log('Reservation detail screen: fetching reservation with ID:', id);
      fetchReservationById(id);
    }
    // Also ensure meals are loaded
    fetchMeals();
  }, [id]);
  
  console.log('Reservation detail screen state:', {
    id,
    selectedReservation: selectedReservation ? {
      id: selectedReservation.id,
      mealId: selectedReservation.mealId,
      status: selectedReservation.status
    } : null,
    isLoading,
    mealsCount: meals.length
  });
  
  if (!selectedReservation) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const meal = meals.find(m => m.id === selectedReservation.mealId);
  const cook = mockCooks.find(c => c.id === selectedReservation.cookId);
  const customer = mockCustomers.find(c => c.id === selectedReservation.customerId);
  
  console.log('Meal lookup:', {
    mealId: selectedReservation.mealId,
    mealFound: !!meal,
    mealName: meal?.name,
    totalMealsAvailable: meals.length
  });
  
  const isCook = user?.userType === 'cook';
  const isCustomer = user?.userType === 'customer';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.primary;
      case 'confirmed':
        return Colors.secondary;
      case 'ready_for_pickup':
        return Colors.success;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.subtext;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'ready_for_pickup':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const handleUpdateStatus = async (status: any) => {
    try {
      await updateReservationStatus(selectedReservation.id, status);
      Alert.alert('Success', `Reservation has been ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update reservation status');
    }
  };
  
  const handleContact = async () => {
    if (!user) return;
    
    const otherUserId = isCook ? selectedReservation.customerId : selectedReservation.cookId;
    
    try {
      const conversationId = await createConversation([user.id, otherUserId]);
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservation Details</Text>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(selectedReservation.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(selectedReservation.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Information</Text>
        
        <View style={styles.mealCard}>
          <Text style={styles.mealName}>
            {meal?.name || `Meal ID: ${selectedReservation.mealId}`}
          </Text>
          <Text style={styles.mealDescription} numberOfLines={3}>
            {meal?.description || 'Meal details not available'}
          </Text>
          
          {meal?.allergens && meal.allergens.length > 0 && (
            <View style={styles.allergensContainer}>
              <Text style={styles.allergensTitle}>Allergens:</Text>
              <Text style={styles.allergensText}>
                {meal.allergens.join(', ')}
              </Text>
            </View>
          )}
          
          {meal?.cuisineType && (
            <Text style={styles.cuisineType}>
              Cuisine: {meal.cuisineType}
            </Text>
          )}
          
          <View style={styles.mealDetails}>
            <Text style={styles.quantity}>Quantity: {selectedReservation.quantity}</Text>
            <Text style={styles.price}>
              ${selectedReservation.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup Details</Text>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.detailText}>
              {formatDate(selectedReservation.pickupTime)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.detailText}>
              {formatTime(selectedReservation.pickupTime)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.detailText}>
              {cook?.location?.address}
            </Text>
          </View>
        </View>
      </View>
      
      {isCook && customer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <User size={20} color={Colors.primary} />
              <Text style={styles.userName}>{customer.name}</Text>
            </View>
            
            <Button
              title="Contact Customer"
              onPress={handleContact}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      )}
      
      {isCustomer && cook && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cook Information</Text>
          
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <User size={20} color={Colors.primary} />
              <Text style={styles.userName}>{cook.name}</Text>
            </View>
            
            <Button
              title="Contact Cook"
              onPress={handleContact}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      )}
      
      {isCook && selectedReservation.status === 'pending' && (
        <View style={styles.actionContainer}>
          <Button
            title="Confirm Order"
            onPress={() => handleUpdateStatus('confirmed')}
            style={styles.actionButton}
          />
          <Button
            title="Cancel Order"
            onPress={() => handleUpdateStatus('cancelled')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      )}
      
      {isCook && selectedReservation.status === 'confirmed' && (
        <View style={styles.actionContainer}>
          <Button
            title="Mark Ready for Pickup"
            onPress={() => handleUpdateStatus('ready_for_pickup')}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      )}
      
      {isCook && selectedReservation.status === 'ready_for_pickup' && (
        <View style={styles.actionContainer}>
          <Text style={styles.waitingText}>
            Waiting for customer pickup & payment confirmation
          </Text>
        </View>
      )}
      
      {isCustomer && selectedReservation.status === 'ready_for_pickup' && (
        <View style={styles.actionContainer}>
          <Text style={styles.pickupReadyText}>
            Your order is ready for pickup!
          </Text>
          <Button
            title="Confirm Pickup & Payment"
            onPress={() => handleUpdateStatus('completed')}
            variant="primary"
            style={styles.actionButton}
          />
        </View>
      )}
      
      {isCustomer && selectedReservation.status === 'pending' && (
        <View style={styles.actionContainer}>
          <Button
            title="Cancel Reservation"
            onPress={() => handleUpdateStatus('cancelled')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  section: {
    padding: 16,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
  },
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: Colors.text,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary,
    textAlign: 'center',
    padding: 16,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 8,
  },
  pickupReadyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    textAlign: 'center',
    padding: 16,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 8,
    marginBottom: 16,
  },
  allergensContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 6,
  },
  allergensTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  allergensText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  cuisineType: {
    fontSize: 14,
    color: Colors.subtext,
    marginTop: 8,
    fontStyle: 'italic',
  },
});