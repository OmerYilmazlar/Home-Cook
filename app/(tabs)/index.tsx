import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Platform, Dimensions, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MapPin, TrendingUp, DollarSign, Clock, Plus, Sparkles, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth-store';
import { useMealsStore } from '@/store/meals-store';
import { useReservationsStore } from '@/store/reservations-store';
import { usePaymentStore } from '@/store/payment-store';
import { useTheme } from '@/store/theme-store';
import Colors from '@/constants/colors';
import MealCard from '@/components/MealCard';
import CookCard from '@/components/CookCard';
import Button from '@/components/Button';
import { mockCooks } from '@/mocks/users';
import { Meal, Cook } from '@/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { meals, fetchMeals, fetchMealsByCook, isLoading } = useMealsStore();
  const { reservations, fetchReservations } = useReservationsStore();
  const { roundCurrency } = usePaymentStore();
  const { colors } = useTheme();
  
  const [refreshing, setRefreshing] = useState(false);
  const [cookMeals, setCookMeals] = useState<Meal[]>([]);
  const [cooksWithUpdatedRatings, setCooksWithUpdatedRatings] = useState<Cook[]>([]);
  
  const isCook = user?.userType === 'cook';
  
  useEffect(() => {
    if (isCook && user?.id) {
      // Fetch cook's own meals
      fetchMealsByCook(user.id).then(setCookMeals);
      fetchReservations();
    } else {
      // Fetch all meals for customers
      fetchMeals();
      // Also fetch reservations to calculate cook ratings
      fetchReservations();
    }
  }, [isCook, user?.id]);
  
  // Refresh meals when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isCook && user?.id) {
        fetchMealsByCook(user.id).then(setCookMeals);
      } else {
        fetchMeals();
        // Also refresh reservations to get updated ratings
        fetchReservations();
      }
    }, [isCook, user?.id])
  );
  
  const onRefresh = async () => {
    setRefreshing(true);
    if (isCook && user?.id) {
      const meals = await fetchMealsByCook(user.id);
      setCookMeals(meals);
      await fetchReservations();
    } else {
      await fetchMeals();
      // Also refresh reservations to get updated ratings
      await fetchReservations();
    }
    setRefreshing(false);
  };
  
  const handleAddMeal = () => {
    router.push('/add-meal');
  };

  const handleEditMeal = (mealId: string) => {
    router.push(`/edit-meal/${mealId}`);
  };

  const { deleteMeal } = useMealsStore.getState();
  const handleDeleteMeal = (mealId: string, name: string) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteMeal(mealId);
              await onRefresh();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete meal');
            }
          }
        }
      ]
    );
  };
  
  // Calculate cook stats
  const cookStats = {
    activeMeals: cookMeals?.length || 0,
    totalOrders: (reservations || []).filter(r => 
      (cookMeals || []).some(m => m.id === r.mealId) && r.status !== 'cancelled'
    ).length,
    weeklyEarnings: roundCurrency((reservations || [])
      .filter(r => {
        const meal = (cookMeals || []).find(m => m.id === r.mealId);
        const isThisWeek = new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return meal && r.status === 'completed' && isThisWeek;
      })
      .reduce((sum, r) => {
        const meal = (cookMeals || []).find(m => m.id === r.mealId);
        return sum + (meal ? meal.price * r.quantity : 0);
      }, 0)),
    averageRating: (() => {
      const ratedReservations = (reservations || []).filter(r => 
        (cookMeals || []).some(m => m.id === r.mealId) && r.rating?.cookRating
      );
      if (ratedReservations.length === 0) return 0;
      const totalRating = ratedReservations.reduce((sum, r) => sum + (r.rating?.cookRating || 0), 0);
      const avg = totalRating / ratedReservations.length;
      return Math.round(avg * 10) / 10;
    })(),
    totalReviews: (reservations || []).filter(r => 
      (cookMeals || []).some(m => m.id === r.mealId) && r.rating?.cookRating
    ).length
  };
  
  const featuredMeals = isCook ? (cookMeals || []).slice(0, 4) : (meals || []).slice(0, 4);
  // Use updated cooks if available, otherwise fall back to mockCooks
  const topCooks = (cooksWithUpdatedRatings.length > 0 ? cooksWithUpdatedRatings : mockCooks || []).slice(0, 3) as Cook[];
  
  // Update cook ratings when component mounts or when reservations change
  useEffect(() => {
    const updateCookRatings = () => {
      const updatedCooks = mockCooks.map(cook => {
        // Calculate rating from all reservations for this cook
        const cookReservations = reservations.filter(r => r.cookId === cook.id && r.rating?.cookRating);
        
        if (cookReservations.length === 0) {
          return { ...cook, rating: 0, reviewCount: 0 };
        }
        
        const totalRating = cookReservations.reduce((sum, r) => sum + (r.rating?.cookRating || 0), 0);
        const averageRating = totalRating / cookReservations.length;
        
        return {
          ...cook,
          rating: Math.round(averageRating * 10) / 10,
          reviewCount: cookReservations.length
        };
      });
      
      setCooksWithUpdatedRatings(updatedCooks);
    };
    
    if (reservations.length > 0) {
      updateCookRatings();
    }
  }, [reservations]);
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user?.name?.split(' ')[0]}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.subtext} />
            <Text style={[styles.location, { color: colors.subtext }]}>
              {user?.location?.address || 'San Francisco, CA'}
            </Text>
          </View>
        </View>
        
        {isCook && (
          <View style={styles.headerRight}>
            <Button
              title="Add Meal"
              onPress={handleAddMeal}
              size="small"
              leftIcon={<Plus size={16} color={colors.white} />}
              style={styles.addMealButton}
            />
          </View>
        )}
      </View>
      
      {isCook ? (
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cookDashboard}
        >
          <View style={styles.dashboardHeader}>
            <Sparkles size={24} color={colors.white} />
            <Text style={[styles.dashboardTitle, { color: colors.white }]}>Your Dashboard</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.cardSecondary }]}>
                <TrendingUp size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{cookStats.activeMeals}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Active Meals</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.cardSecondary }]}>
                <Clock size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{cookStats.totalOrders}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Total Orders</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.cardSecondary }]}>
                <DollarSign size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>${cookStats.weeklyEarnings}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>This Week</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.cardSecondary }]}>
                <Star size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {cookStats.averageRating > 0 ? cookStats.averageRating.toString() : 'N/A'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>
                Rating ({cookStats.totalReviews})
              </Text>
            </View>
          </View>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <Sparkles size={28} color={colors.white} style={styles.bannerIcon} />
            <Text style={[styles.bannerTitle, { color: colors.white }]}>Discover Local Homemade Food</Text>
            <Text style={[styles.bannerText, { color: colors.white }]}>
              Support home cooks in your community and enjoy authentic meals
            </Text>
            <Button
              title="Explore Meals"
              onPress={() => router.push('/explore')}
              size="small"
              variant="outline"
              style={StyleSheet.flatten([styles.bannerButton, { backgroundColor: colors.white, borderColor: colors.white }])}
              textStyle={StyleSheet.flatten([styles.bannerButtonText, { color: colors.primary }])}
            />
          </View>
        </LinearGradient>
      )}
      
      {isCook && cookStats.totalReviews > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Reviews</Text>
          </View>
          
          <View style={styles.reviewsContainer}>
            {(reservations || [])
              .filter(r => (cookMeals || []).some(m => m.id === r.mealId) && r.rating?.cookRating)
              .sort((a, b) => new Date(b.rating?.createdAt || 0).getTime() - new Date(a.rating?.createdAt || 0).getTime())
              .slice(0, 3)
              .map(reservation => {
                const meal = (cookMeals || []).find(m => m.id === reservation.mealId);
                return (
                  <View key={reservation.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
                    <View style={styles.reviewHeader}>
                      <Text style={[styles.customerName, { color: colors.text }]}>
                        {reservation.rating?.customerName}
                      </Text>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={14}
                            color={star <= (reservation.rating?.cookRating || 0) ? Colors.warning : colors.border}
                            fill={star <= (reservation.rating?.cookRating || 0) ? Colors.warning : 'transparent'}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={[styles.mealNameSmall, { color: colors.subtext }]}>
                      {meal?.name}
                    </Text>
                    {reservation.rating?.reviewText && (
                      <Text style={[styles.reviewText, { color: colors.text }]}>
                        "{reservation.rating.reviewText}"
                      </Text>
                    )}
                    <Text style={[styles.reviewDate, { color: colors.subtext }]}>
                      {new Date(reservation.rating?.createdAt || 0).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isCook ? 'Your Meals' : 'Featured Meals'}
          </Text>
          <Text
            style={[styles.seeAll, { color: colors.primary }]}
            onPress={() => router.push(isCook ? '/my-meals' : '/explore')}
          >
            See All
          </Text>
        </View>
        
        {featuredMeals.length > 0 ? (
          <View style={styles.mealsContainer}>
            {featuredMeals.map(meal => (
              <View key={meal.id}>
                <MealCard meal={meal} />
                {isCook && user?.id === meal.cookId && (
                  <View style={styles.mealActions}>
                    <Button
                      title="Edit"
                      variant="outline"
                      size="small"
                      onPress={() => handleEditMeal(meal.id)}
                      style={styles.actionButton}
                      testID={`home-edit-${meal.id}`}
                    />
                    <Button
                      title="Delete"
                      variant="outline"
                      size="small"
                      onPress={() => handleDeleteMeal(meal.id, meal.name)}
                      style={[styles.actionButton, styles.deleteButton]}
                      testID={`home-delete-${meal.id}`}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyStateText, { color: colors.subtext }]}>
              {isCook ? 'No meals created yet' : 'No meals available'}
            </Text>
            {isCook && (
              <Button
                title="Create Your First Meal"
                onPress={handleAddMeal}
                size="small"
                style={styles.emptyStateButton}
              />
            )}
          </View>
        )}
      </View>
      
      {!isCook && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Cooks Near You</Text>
            <Text
              style={[styles.seeAll, { color: colors.primary }]}
              onPress={() => router.push('/explore?view=cooks')}
            >
              See All
            </Text>
          </View>
          
          <View style={styles.cooksContainer}>
            {topCooks.map(cook => (
              <CookCard key={cook.id} cook={cook} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingTop: 8,
    minHeight: 60,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    fontSize: 15,
    marginLeft: 6,
    fontWeight: '500',
  },
  addMealButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 100,
    flexShrink: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cookDashboard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: -0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%', // Use percentage for consistent spacing
    alignItems: 'center',
    padding: width < 375 ? 12 : 14,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: width < 375 ? 40 : 48,
    height: width < 375 ? 40 : 48,
    borderRadius: width < 375 ? 20 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width < 375 ? 8 : 12,
  },
  statValue: {
    fontSize: width < 375 ? 20 : 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: width < 375 ? 11 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  banner: {
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerContent: {
    padding: 24,
    alignItems: 'flex-start',
  },
  bannerIcon: {
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  bannerText: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  bannerButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerButtonText: {
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 15,
    fontWeight: '600',
  },
  mealsContainer: {
    gap: 20,
  },
  cooksContainer: {
    gap: 20,
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    borderColor: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 17,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  emptyStateButton: {
    alignSelf: 'center',
    borderRadius: 12,
  },
  reviewsContainer: {
    gap: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  mealNameSmall: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: '500',
  },
});