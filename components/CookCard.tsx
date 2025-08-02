import React from 'react';
import { StyleSheet, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Star, Heart } from 'lucide-react-native';
import { Cook } from '@/types';
import Colors from '@/constants/colors';
import { useFavoritesStore } from '@/store/favorites-store';
import { useAuthStore } from '@/store/auth-store';

interface CookCardProps {
  cook: Cook;
  showFavoriteButton?: boolean;
}

export default function CookCard({ cook, showFavoriteButton = true }: CookCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addFavoriteCook, removeFavoriteCook, isFavoriteCook } = useFavoritesStore();
  
  const isFavorite = isFavoriteCook(cook.id);
  const isCustomer = user?.userType === 'customer';
  
  const handlePress = () => {
    router.push(`/cook/${cook.id}`);
  };
  
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    
    if (isFavorite) {
      removeFavoriteCook(cook.id);
    } else {
      addFavoriteCook(cook);
    }
  };
  
  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Image
          source={{ uri: cook.avatar }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        
        <View style={styles.headerContent}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{cook.name}</Text>
            {showFavoriteButton && isCustomer && (
              <TouchableOpacity 
                style={styles.favoriteButton} 
                onPress={handleFavoritePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Heart 
                  size={20} 
                  color={isFavorite ? Colors.error : Colors.subtext} 
                  fill={isFavorite ? Colors.error : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.rating} fill={Colors.rating} />
            <Text style={styles.rating}>
              {cook.rating?.toFixed(1) || '0.0'} ({cook.reviewCount || 0})
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cuisineContainer}>
        {cook.cuisineTypes?.map((cuisine, index) => (
          <View key={index} style={styles.cuisineTag}>
            <Text style={styles.cuisineText}>{cuisine}</Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.bio} numberOfLines={2}>
        {cook.bio}
      </Text>
      
      <View style={styles.footer}>
        <View style={[
          styles.statusIndicator, 
          cook.availableForPickup ? styles.available : styles.unavailable
        ]} />
        <Text style={styles.statusText}>
          {cook.availableForPickup ? 'Available for pickup' : 'Not available'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: Colors.borderLight,
  },
  headerContent: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  favoriteButton: {
    padding: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 4,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  cuisineTag: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cuisineText: {
    fontSize: 12,
    color: Colors.subtext,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  available: {
    backgroundColor: Colors.success,
  },
  unavailable: {
    backgroundColor: Colors.inactive,
  },
  statusText: {
    fontSize: 14,
    color: Colors.subtext,
  },
});