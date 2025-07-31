import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, Clock, Calendar, User, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealsStore } from '@/store/meals-store';
import { useAuthStore } from '@/store/auth-store';
import { useReservationsStore } from '@/store/reservations-store';
import { useMessagingStore } from '@/store/messaging-store';
import { usePaymentStore } from '@/store/payment-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { mockCooks, mockCustomers } from '@/mocks/users';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { selectedMeal, fetchMealById, isLoading } = useMealsStore();
  const { user } = useAuthStore();
  const { createReservation, reservations, fetchReservations } = useReservationsStore();
  const { createConversation } = useMessagingStore();
  const { initializeWallet } = usePaymentStore();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      fetchMealById(id);
    }
    // Fetch reservations to get the reviews
    fetchReservations();
  }, [id]);
  
  useEffect(() => {
    if (selectedMeal?.pickupTimes && selectedMeal.pickupTimes.length > 0) {
      setSelectedPickupTime(selectedMeal.pickupTimes[0].from);
    }
  }, [selectedMeal]);
  
  // Initialize wallets for users
  useEffect(() => {
    if (user) {
      initializeWallet(user.id, user.userType === 'customer' ? 100 : 0);
    }
    if (selectedMeal?.cookId) {
      initializeWallet(selectedMeal.cookId, 0);
    }
  }, [user, selectedMeal]);
  
  if (!selectedMeal) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const cook = (mockCooks || []).find(c => c.id === selectedMeal.cookId);
  
  if (!cook) {
    console.log('Cook not found for meal:', selectedMeal.cookId);
  }
  
  // Get actual reviews from reservations that have ratings for this meal
  const mealReviews = (reservations || [])
    .filter(r => r.mealId === selectedMeal.id && r.rating)
    .sort((a, b) => new Date(b.rating!.createdAt).getTime() - new Date(a.rating!.createdAt).getTime());
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
  
  const handleIncreaseQuantity = () => {
    if (quantity < selectedMeal.availableQuantity) {
      setQuantity(quantity + 1);
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleReserve = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to reserve a meal');
      return;
    }
    
    if (user.userType === 'cook') {
      Alert.alert('Not Available', 'As a cook, you cannot reserve meals');
      return;
    }
    
    if (!selectedPickupTime) {
      Alert.alert('Select Pickup Time', 'Please select a pickup time');
      return;
    }
    
    try {
      await createReservation({
        mealId: selectedMeal.id,
        customerId: user.id,
        cookId: selectedMeal.cookId,
        status: 'pending',
        quantity,
        totalPrice: selectedMeal.price * quantity,
        pickupTime: selectedPickupTime,
      });
      
      Alert.alert(
        'Reservation Successful! 🎉',
        `Your meal has been reserved for pickup at ${new Date(selectedPickupTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. The cook has been notified and will prepare your order. Payment will be processed when your meal is ready for pickup.`,
        [
          {
            text: 'View Orders',
            onPress: () => {
              // Navigate to orders and trigger a refresh
              router.push('/orders');
            },
          },
          {
            text: 'OK',
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reserve meal';
      Alert.alert('Reservation Failed', errorMessage);
    }
  };
  
  const handleContactCook = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to contact the cook');
      return;
    }
    
    if (!cook) {
      Alert.alert('Error', 'Cook information not available');
      return;
    }
    
    try {
      const conversationId = await createConversation([user.id, cook.id]);
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedMeal.images && selectedMeal.images.length > 0 ? selectedMeal.images[0] : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' }}
            style={styles.image}
            contentFit="cover"
            placeholder="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
          />
        </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{selectedMeal.name}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.rating} fill={Colors.rating} />
            <Text style={styles.rating}>
              {selectedMeal.rating?.toFixed(1)} ({selectedMeal.reviewCount} reviews)
            </Text>
          </View>
          
          <Text style={styles.price}>${selectedMeal.price.toFixed(2)}</Text>
        </View>
        
        <View style={styles.cookContainer}>
          {cook?.avatar && (
            <Image
              source={{ uri: cook.avatar }}
              style={styles.cookAvatar}
              contentFit="cover"
            />
          )}
          
          <View style={styles.cookInfo}>
            <Text style={styles.cookName}>By {cook?.name || 'Unknown Cook'}</Text>
            {cook?.id && (
              <TouchableOpacity onPress={() => router.push(`/cook/${cook.id}`)}>
                <Text style={styles.viewProfile}>View Profile</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {user?.id !== selectedMeal.cookId && cook && (
            <Button
              title="Contact"
              onPress={handleContactCook}
              variant="outline"
              size="small"
              style={styles.contactButton}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{selectedMeal.description}</Text>
        </View>
        
        {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.tagsContainer}>
              {(selectedMeal.ingredients || []).map((ingredient, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {selectedMeal.allergens && selectedMeal.allergens.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergens</Text>
            <View style={styles.tagsContainer}>
              {(selectedMeal.allergens || []).map((allergen, index) => (
                <View key={index} style={[styles.tag, styles.allergenTag]}>
                  <Text style={styles.tagText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Times</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(selectedMeal.pickupTimes || []).map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pickupTimeCard,
                  selectedPickupTime === time.from && styles.selectedPickupTime
                ]}
                onPress={() => setSelectedPickupTime(time.from)}
              >
                <View style={styles.pickupTimeHeader}>
                  <Calendar size={16} color={Colors.subtext} />
                  <Text style={styles.pickupTimeDate}>
                    {formatDate(time.from)}
                  </Text>
                </View>
                
                <View style={styles.pickupTimeContent}>
                  <Clock size={16} color={Colors.subtext} />
                  <Text style={styles.pickupTimeText}>
                    {formatTime(time.from)} - {formatTime(time.to)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {(mealReviews || []).length > 0 ? (
            <View style={styles.reviewsContainer}>
              {(mealReviews || []).map(reservation => (
                <View key={reservation.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>
                        {reservation.rating!.customerName}
                      </Text>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={14}
                            color={star <= reservation.rating!.mealRating ? Colors.rating : Colors.border}
                            fill={star <= reservation.rating!.mealRating ? Colors.rating : 'transparent'}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(reservation.rating!.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  {reservation.rating!.reviewText && reservation.rating!.reviewText.trim() !== '' && (
                    <Text style={styles.reviewComment}>
                      {reservation.rating!.reviewText}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>
                Be the first to order and leave a review!
              </Text>
            </View>
          )}
        </View>
      </View>
      </ScrollView>
      
      {user?.userType === 'customer' && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecreaseQuantity}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncreaseQuantity}
              disabled={quantity >= selectedMeal.availableQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <Button
            title={`Reserve Meal • $${(selectedMeal.price * quantity).toFixed(2)}`}
            onPress={handleReserve}
            style={styles.reserveButton}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the footer
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cookAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cookInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cookName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  viewProfile: {
    fontSize: 14,
    color: Colors.primary,
  },
  contactButton: {
    paddingHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  allergenTag: {
    backgroundColor: '#FFF3F3',
  },
  tagText: {
    fontSize: 14,
    color: Colors.subtext,
  },
  pickupTimeCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 150,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedPickupTime: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 126, 54, 0.05)',
  },
  pickupTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupTimeDate: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: 4,
  },
  pickupTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupTimeText: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  reserveButton: {
    flex: 1,
  },
  reviewsContainer: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.subtext,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.subtext,
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    opacity: 0.8,
  },
});