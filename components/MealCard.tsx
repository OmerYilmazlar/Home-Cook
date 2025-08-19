import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Star, Clock } from 'lucide-react-native';
import { Meal } from '@/types';
import Colors from '@/constants/colors';

interface MealCardProps {
  meal: Meal;
  compact?: boolean;
  onPress?: () => void;
  showCookInfo?: boolean;
}

export default function MealCard({ meal, compact = false, onPress, showCookInfo = true }: MealCardProps) {
  const router = useRouter();
  
  const fallbackUri = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&auto=format';
  const initialUri = useMemo(() => {
    const first = (meal.images && meal.images.length > 0) ? meal.images[0] : undefined;
    const isHttp = typeof first === 'string' && /^https?:\/\//.test(first);
    const sanitized = isHttp ? first as string : fallbackUri;
    return sanitized;
  }, [meal.images]);

  const [imageUri, setImageUri] = useState<string>(initialUri);

  const handleImageError = useCallback((e: any) => {
    console.warn('MealCard: image load error for meal', meal.id, 'uri:', imageUri, e?.nativeEvent ?? {});
    setImageUri(fallbackUri);
  }, [meal.id, imageUri]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/meal/${meal.id}`);
    }
  };
  
  return (
    <Pressable 
      style={[styles.container, compact && styles.compactContainer]} 
      onPress={handlePress}
    >
      <View style={styles.imageContainer} testID="meal-card-image-container">
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, compact && styles.compactImage]}
          contentFit="cover"
          transition={200}
          placeholder={fallbackUri}
          onError={handleImageError}
          accessibilityLabel={`Image of ${meal.name}`}
          testID="meal-card-image"
        />
        {meal.availableQuantity === 0 && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
        
        <View style={styles.tagsContainer}>
          <View style={styles.cuisineContainer}>
            <Text style={styles.cuisine}>{meal.cuisineType}</Text>
          </View>
          
          {meal.pickupTimes && meal.pickupTimes.length > 0 && (
            <View style={styles.timeContainer}>
              <Clock size={12} color={Colors.subtext} />
              <Text style={styles.timeText}>
                {new Date(meal.pickupTimes[0].from).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
            </View>
          )}
        </View>
        
        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {meal.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${meal.price.toFixed(2)}</Text>
            {meal.availableQuantity > 0 && (
              <Text style={styles.quantity}>{meal.availableQuantity} left</Text>
            )}
          </View>
          
          <View style={styles.ratingContainer}>
            <Star size={14} color={Colors.rating} fill={Colors.rating} />
            <Text style={styles.rating}>
              {meal.rating?.toFixed(1) || '0.0'} ({meal.reviewCount || 0})
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  compactContainer: {
    flexDirection: 'row',
    height: 110,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 200,
    width: '100%',
  },
  compactImage: {
    height: '100%',
    width: 110,
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  soldOutText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  cuisineContainer: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  cuisine: {
    fontSize: 12,
    color: Colors.subtext,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    color: Colors.subtext,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  quantity: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 2,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rating: {
    fontSize: 13,
    color: Colors.subtext,
    fontWeight: '600',
  },
});