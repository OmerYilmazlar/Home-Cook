import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, MapPin, Heart } from 'lucide-react-native';
import { useMealsStore } from '@/store/meals-store';
import { useAuthStore } from '@/store/auth-store';
import { useMessagingStore } from '@/store/messaging-store';
import { useFavoritesStore } from '@/store/favorites-store';
import Colors from '@/constants/colors';
import MealCard from '@/components/MealCard';
import Button from '@/components/Button';
import { userService } from '@/lib/database';
import type { Cook, Meal } from '@/types';

export default function CookProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { user } = useAuthStore();
  const { fetchMealsByCook } = useMealsStore();
  const { createConversation } = useMessagingStore();
  const { addFavoriteCook, removeFavoriteCook, isFavoriteCook } = useFavoritesStore();

  const [cook, setCook] = useState<Cook | null>(null);
  const [cookMeals, setCookMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCook = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔎 CookProfile: loading cook by id', id);
      const foundCook = await userService.getUserById(String(id));
      if (!foundCook || foundCook.userType !== 'cook') {
        console.log('⚠️ CookProfile: cook not found or not a cook', foundCook);
        setCook(null);
        setCookMeals([]);
        setError('Cook not found');
        return;
      }
      setCook(foundCook as Cook);
      console.log('✅ CookProfile: cook loaded', foundCook.id, foundCook.name);
      const meals = await fetchMealsByCook(foundCook.id);
      setCookMeals(meals);
      console.log('✅ CookProfile: meals loaded', meals.length);
    } catch (e) {
      console.error('❌ CookProfile: load error', e);
      setError(e instanceof Error ? e.message : 'Failed to load cook');
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchMealsByCook]);

  useEffect(() => {
    void loadCook();
  }, [loadCook]);

  const isOwnProfile = useMemo(() => (user?.id && cook?.id ? user.id === cook.id : false), [user?.id, cook?.id]);
  const isCustomer = useMemo(() => user?.userType === 'customer', [user?.userType]);
  const isFavorite = useMemo(() => (cook ? isFavoriteCook(cook.id) : false), [cook, isFavoriteCook]);

  const handleContactCook = useCallback(async () => {
    if (!user || !cook) {
      Alert.alert('Login Required', 'Please log in to contact the cook');
      return;
    }
    try {
      const conversationId = await createConversation([user.id, cook.id]);
      router.push(`/messages/${conversationId}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to start conversation');
    }
  }, [user, cook, createConversation, router]);

  const handleFavoritePress = useCallback(() => {
    if (!cook) return;
    if (isFavorite) {
      removeFavoriteCook(cook.id);
    } else {
      addFavoriteCook(cook);
    }
  }, [cook, isFavorite, addFavoriteCook, removeFavoriteCook]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="cook-profile-loading">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !cook) {
    return (
      <View style={styles.loadingContainer} testID="cook-profile-error">
        <Text style={styles.errorText}>{error ?? 'Cook not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCook} accessibilityRole="button">
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ratingText = cook.rating !== undefined && cook.rating !== null ? (Number(cook.rating).toFixed(1)) : '0.0';
  const reviewCountText = cook.reviewCount ?? 0;
  const cuisines = cook.cuisineTypes ?? [];

  return (
    <ScrollView style={styles.container} testID="cook-profile">
      <View style={styles.header}>
        <Image
          source={cook.avatar ? { uri: cook.avatar } : require('@/assets/images/icon.png')}
          style={styles.avatar}
          contentFit="cover"
          testID="cook-avatar"
        />

        <View style={styles.headerContent}>
          <Text style={styles.name} testID="cook-name">{cook.name}</Text>

          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.rating} fill={Colors.rating} />
            <Text style={styles.rating}>{ratingText} ({reviewCountText} reviews)</Text>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.subtext} />
            <Text style={styles.location}>{cook.location?.address ?? 'No address provided'}</Text>
          </View>

          <View style={styles.cuisineContainer}>
            {cuisines.map((cuisine: string, index: number) => (
              <View key={`${cuisine}-${index}`} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{cuisine}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {!isOwnProfile && (
        <View style={styles.actionContainer}>
          <View style={styles.buttonRow}>
            <Button
              title="Contact Cook"
              onPress={handleContactCook}
              style={styles.contactButton}
            />
            {isCustomer && (
              <TouchableOpacity
                style={[styles.favoriteButtonLarge, isFavorite && styles.favoriteButtonActive]}
                onPress={handleFavoritePress}
                testID="favorite-cook-button"
                accessibilityRole="button"
              >
                <Heart
                  size={24}
                  color={isFavorite ? Colors.white : Colors.error}
                  fill={isFavorite ? Colors.white : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.bioContainer}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{cook.bio ?? 'No bio yet.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Meals</Text>
        {cookMeals.length > 0 ? (
          cookMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))
        ) : (
          <Text style={styles.noMealsText}>No meals available at the moment</Text>
        )}
      </View>
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
    padding: 24,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 16,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerContent: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold' as const,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 4,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cuisineTag: {
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineText: {
    fontSize: 12,
    color: Colors.subtext,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactButton: {
    flex: 1,
  },
  favoriteButtonLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonActive: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  bioContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  section: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  noMealsText: {
    fontSize: 16,
    color: Colors.subtext,
    fontStyle: 'italic' as const,
    textAlign: 'center',
    marginVertical: 24,
  },
});