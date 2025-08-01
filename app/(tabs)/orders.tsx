import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useReservationsStore } from '@/store/reservations-store';
import { useMealsStore } from '@/store/meals-store';
import Colors from '@/constants/colors';
import ReservationCard from '@/components/ReservationCard';
import EmptyState from '@/components/EmptyState';
import { mockCooks, mockCustomers } from '@/mocks/users';


export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { meals, fetchMeals } = useMealsStore();
  const { 
    customerReservations, 
    cookReservations, 
    fetchCustomerReservations, 
    fetchCookReservations,
    updateReservationStatus,
    isLoading 
  } = useReservationsStore();
  
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>(
    tab === 'past' ? 'past' : 'upcoming'
  );
  
  // Update active tab when tab parameter changes
  useEffect(() => {
    if (tab === 'past') {
      setActiveTab('past');
    }
  }, [tab]);
  
  // Load meals when component mounts
  useEffect(() => {
    fetchMeals();
  }, []);
  
  // Refresh reservations when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        console.log('Orders screen focused - refreshing reservations for:', user.userType);
        if (user.userType === 'customer') {
          fetchCustomerReservations(user.id);
        } else if (user.userType === 'cook') {
          fetchCookReservations(user.id);
        }
      }
    }, [user, fetchCustomerReservations, fetchCookReservations])
  );
  
  useEffect(() => {
    if (user) {
      if (user.userType === 'customer') {
        fetchCustomerReservations(user.id);
      } else if (user.userType === 'cook') {
        fetchCookReservations(user.id);
      }
    }
  }, [user]);
  
  const isCook = user?.userType === 'cook';
  const reservations = isCook ? cookReservations : customerReservations;
  
  const upcomingReservations = reservations.filter(
    r => r.status === 'pending' || r.status === 'confirmed' || r.status === 'ready_for_pickup'
  );
  
  const pastReservations = reservations.filter(
    r => r.status === 'completed' || r.status === 'cancelled'
  );
  
  const displayReservations = activeTab === 'upcoming' ? upcomingReservations : pastReservations;
  
  console.log('Orders screen state:', {
    activeTab,
    totalReservations: reservations.length,
    upcomingCount: upcomingReservations.length,
    pastCount: pastReservations.length,
    displayCount: displayReservations.length,
    userType: user?.userType,
    userId: user?.id,
    isCook,
    reservationsIds: reservations.map(r => ({ id: r.id, status: r.status }))
  });
  
  const getMealName = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    return meal?.name || 'Unknown Meal';
  };
  
  const getMeal = (mealId: string) => {
    return meals.find(m => m.id === mealId);
  };
  
  const getCookName = (cookId: string) => {
    const cook = mockCooks.find(c => c.id === cookId);
    return cook?.name || 'Unknown Cook';
  };
  
  const getCustomerName = (customerId: string) => {
    const customer = mockCustomers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };
  
  const handleStatusChange = async (id: string, status: any) => {
    console.log('Handling status change:', { id, status, userType: user?.userType });
    
    try {
      await updateReservationStatus(id, status);
      
      // Force refresh after status change to ensure UI reflects the update
      setTimeout(() => {
        if (user) {
          console.log('Refreshing after status change for:', user.userType);
          if (user.userType === 'customer') {
            fetchCustomerReservations(user.id);
          } else if (user.userType === 'cook') {
            fetchCookReservations(user.id);
          }
        }
      }, 500); // Give enough time for the status update to complete
      
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  const renderReservationItem = ({ item }: { item: any }) => (
    <ReservationCard
      reservation={item}
      meal={getMeal(item.mealId)}
      mealName={getMealName(item.mealId)}
      cookName={isCook ? undefined : getCookName(item.cookId)}
      customerName={isCook ? getCustomerName(item.customerId) : undefined}
      showActions={isCook && activeTab === 'upcoming'}
      onStatusChange={handleStatusChange}
      userType={isCook ? 'cook' : 'customer'}
    />
  );
  
  // Only show empty state if there are no reservations at all (both upcoming and past)
  const hasNoReservationsAtAll = upcomingReservations.length === 0 && pastReservations.length === 0;
  
  if (hasNoReservationsAtAll && !isLoading) {
    return (
      <EmptyState
        title={isCook ? "No Orders Yet" : "No Orders Yet"}
        message={
          isCook 
            ? "When customers place orders for your meals, they will appear here."
            : "Your orders will appear here after you reserve meals from cooks."
        }
        image="https://images.unsplash.com/photo-1484980972926-edee96e0960d"
        buttonText={isCook ? "Add a Meal" : "Browse Meals"}
        onButtonPress={() => isCook ? router.push('/add-meal') : router.push('/explore')}
      />
    );
  }
  
  return (
    <View style={styles.container}>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && styles.activeTab
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'past' && styles.activeTab
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>
      
      {displayReservations.length === 0 ? (
        <View style={styles.emptyTabContainer}>
          <Text style={styles.emptyTabText}>
            {activeTab === 'upcoming' ? 'No upcoming orders' : 'No past orders'}
          </Text>
          <Text style={styles.emptyTabSubtext}>
            {activeTab === 'upcoming' 
              ? 'Your upcoming orders will appear here'
              : 'Your completed and cancelled orders will appear here'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayReservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    borderRadius: 8,
  },
  activeTab: {
    borderBottomColor: Colors.primary,
    backgroundColor: Colors.cardSecondary,
  },
  tabText: {
    fontSize: 15,
    color: Colors.subtext,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTabText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyTabSubtext: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
});