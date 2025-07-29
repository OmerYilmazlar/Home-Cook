import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '@/store/auth-store';
import { useReservationsStore } from '@/store/reservations-store';
import { useMealsStore } from '@/store/meals-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { mockCooks } from '@/mocks/users';

export default function RateOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { selectedReservation, fetchReservationById, submitRating } = useReservationsStore();
  const { meals } = useMealsStore();
  
  const [mealRating, setMealRating] = useState(0);
  const [cookRating, setCookRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReservationById(id);
    }
  }, [id]);

  if (!selectedReservation || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Rate Your Order</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const meal = meals.find(m => m.id === selectedReservation.mealId);
  const cook = mockCooks.find(c => c.id === selectedReservation.cookId);

  const renderStarRating = (rating: number, setRating: (rating: number) => void, label: string) => (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color={star <= rating ? Colors.warning || '#f59e0b' : Colors.borderLight}
              fill={star <= rating ? Colors.warning || '#f59e0b' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>
        {rating === 0 ? 'Tap to rate' : 
         rating === 1 ? 'Poor' :
         rating === 2 ? 'Fair' :
         rating === 3 ? 'Good' :
         rating === 4 ? 'Very Good' :
         'Excellent'}
      </Text>
    </View>
  );

  const handleSubmitRating = async () => {
    if (mealRating === 0 || cookRating === 0) {
      Alert.alert('Rating Required', 'Please rate both the meal and the cook before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRating(selectedReservation.id, {
        mealRating,
        cookRating,
        reviewText: reviewText.trim(),
        customerId: user.id,
        customerName: user.name || 'Anonymous'
      });

      Alert.alert(
        'Thank You!',
        'Your rating has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Rate Your Order</Text>
      </View>

      <View style={styles.content}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>Your Order</Text>
            <Text style={styles.orderDate}>
              {new Date(selectedReservation.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          {meal && (
            <View style={styles.mealInfo}>
              <Image
                source={{ uri: meal.images[0] }}
                style={styles.mealImage}
                contentFit="cover"
              />
              <View style={styles.mealDetails}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealPrice}>
                  ${meal.price.toFixed(2)} × {selectedReservation.quantity}
                </Text>
                <Text style={styles.cookName}>by {cook?.name}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Meal Rating */}
        {renderStarRating(mealRating, setMealRating, `How was "${meal?.name}"?`)}

        {/* Cook Rating */}
        {renderStarRating(cookRating, setCookRating, `How was your experience with ${cook?.name}?`)}

        {/* Review Text */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Add a Review (Optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Tell others about your experience..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>{reviewText.length}/500</Text>
        </View>

        {/* Submit Button */}
        <Button
          title={isSubmitting ? "Submitting..." : "Submit Rating"}
          onPress={handleSubmitRating}
          disabled={isSubmitting || mealRating === 0 || cookRating === 0}
          style={styles.submitButton}
        />

        <Text style={styles.helpText}>
          Your rating helps other customers and supports our home cooks!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.subtext,
  },
  content: {
    padding: 20,
  },
  orderSummary: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.subtext,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  mealPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  cookName: {
    fontSize: 12,
    color: Colors.subtext,
  },
  ratingSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '500',
  },
  reviewSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    backgroundColor: Colors.background,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
});
