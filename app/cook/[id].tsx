import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, MapPin, MessageCircle } from 'lucide-react-native';
import { useMealsStore } from '@/store/meals-store';
import { useAuthStore } from '@/store/auth-store';
import { useMessagingStore } from '@/store/messaging-store';
import Colors from '@/constants/colors';
import MealCard from '@/components/MealCard';
import Button from '@/components/Button';
import { mockCooks } from '@/mocks/users';
import { mockReviews } from '@/mocks/reviews';
import { mockMeals } from '@/mocks/meals';

export default function CookProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const { fetchMealsByCook } = useMealsStore();
  const { createConversation } = useMessagingStore();
  
  const [cook, setCook] = useState<any>(null);
  const [cookMeals, setCookMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadCook = async () => {
      setIsLoading(true);
      
      // Find cook in mock data
      const foundCook = mockCooks.find(c => c.id === id);
      setCook(foundCook);
      
      if (foundCook) {
        // Fetch meals by cook
        const meals = await fetchMealsByCook(foundCook.id);
        setCookMeals(meals);
      }
      
      setIsLoading(false);
    };
    
    if (id) {
      loadCook();
    }
  }, [id]);
  
  if (isLoading || !cook) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const handleContactCook = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to contact the cook');
      return;
    }
    
    try {
      const conversationId = await createConversation([user.id, cook.id]);
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };
  
  // Check if current user is viewing their own profile
  const isOwnProfile = user?.id === cook.id;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: cook.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        
        <View style={styles.headerContent}>
          <Text style={styles.name}>{cook.name}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.rating} fill={Colors.rating} />
            <Text style={styles.rating}>
              {cook.rating?.toFixed(1)} ({cook.reviewCount} reviews)
            </Text>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.subtext} />
            <Text style={styles.location}>{cook.location?.address}</Text>
          </View>
          
          <View style={styles.cuisineContainer}>
            {cook.cuisineTypes?.map((cuisine: string, index: number) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{cuisine}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {!isOwnProfile && (
        <View style={styles.actionContainer}>
          <Button
            title="Contact Cook"
            onPress={handleContactCook}
            fullWidth
          />
        </View>
      )}
      
      <View style={styles.bioContainer}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{cook.bio}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Meals</Text>
        
        {cookMeals.length > 0 ? (
          cookMeals.map(meal => (
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
  bioContainer: {
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
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 24,
  },
});