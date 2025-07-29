import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { cuisines } from '@/mocks/cuisines';
import Colors from '@/constants/colors';

interface FilterBarProps {
  selectedCuisine: string | null;
  selectedRating: number | null;
  onSelectCuisine: (cuisine: string | null) => void;
  onSelectRating: (rating: number | null) => void;
}

export default function FilterBar({
  selectedCuisine,
  selectedRating,
  onSelectCuisine,
  onSelectRating,
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineContainer}
      >
        <Pressable
          style={[
            styles.cuisineItem,
            selectedCuisine === null && styles.selectedCuisine
          ]}
          onPress={() => onSelectCuisine(null)}
        >
          <Text style={[
            styles.cuisineText,
            selectedCuisine === null && styles.selectedCuisineText
          ]}>
            All
          </Text>
        </Pressable>
        
        {cuisines.map((cuisine) => (
          <Pressable
            key={cuisine.id}
            style={[
              styles.cuisineItem,
              selectedCuisine === cuisine.name && styles.selectedCuisine
            ]}
            onPress={() => onSelectCuisine(cuisine.name)}
          >
            <Text style={styles.cuisineIcon}>{cuisine.icon}</Text>
            <Text style={[
              styles.cuisineText,
              selectedCuisine === cuisine.name && styles.selectedCuisineText
            ]}>
              {cuisine.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Rating:</Text>
        
        <View style={styles.starsContainer}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Pressable
              key={rating}
              style={styles.ratingItem}
              onPress={() => onSelectRating(selectedRating === rating ? null : rating)}
            >
              <Star
                size={20}
                color={Colors.rating}
                fill={selectedRating === rating || (selectedRating && rating <= selectedRating) 
                  ? Colors.rating 
                  : Colors.transparent}
              />
              <Text style={styles.ratingText}>{rating}+</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
  },
  cuisineContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cuisineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCuisine: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  cuisineIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  cuisineText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  selectedCuisineText: {
    color: Colors.white,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.subtext,
  },
});