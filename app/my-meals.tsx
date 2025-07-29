import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Plus, Search, Filter } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useMealsStore } from '@/store/meals-store';
import { Meal } from '@/types';
import Colors from '@/constants/colors';
import MealCard from '@/components/MealCard';
import EmptyState from '@/components/EmptyState';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function MyMealsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { meals, isLoading, fetchMeals, deleteMeal } = useMealsStore();
  
  const [myMeals, setMyMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  useEffect(() => {
    fetchMeals();
  }, []);
  
  // Refresh meals when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      fetchMeals();
    }, [])
  );
  
  useEffect(() => {
    if (user) {
      const cookMeals = meals.filter(meal => meal.cookId === user.id);
      setMyMeals(cookMeals);
      applyFilters(cookMeals, searchQuery, showAvailableOnly);
    } else {
      setMyMeals([]);
      setFilteredMeals([]);
    }
  }, [meals, user]);
  
  useEffect(() => {
    applyFilters(myMeals, searchQuery, showAvailableOnly);
  }, [searchQuery, showAvailableOnly, myMeals]);
  
  const applyFilters = (mealsToFilter: Meal[], query: string, availableOnly: boolean) => {
    let filtered = [...mealsToFilter];
    
    // Apply search filter
    if (query) {
      const searchQuery = query.toLowerCase();
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchQuery) || 
        meal.description.toLowerCase().includes(searchQuery) ||
        meal.cuisineType.toLowerCase().includes(searchQuery)
      );
    }
    
    // Apply availability filter
    if (availableOnly) {
      filtered = filtered.filter(meal => meal.availableQuantity > 0);
    }
    
    setFilteredMeals(filtered);
  };
  
  const handleAddMeal = () => {
    router.push('/add-meal');
  };
  
  const handleMealPress = (meal: Meal) => {
    router.push(`/meal/${meal.id}`);
  };
  
  const handleEditMeal = (meal: Meal) => {
    router.push(`/edit-meal/${meal.id}`);
  };
  
  const handleDeleteMeal = (meal: Meal) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${meal.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteMeal(meal.id);
              Alert.alert('Success', 'Meal deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const toggleAvailabilityFilter = () => {
    setShowAvailableOnly(!showAvailableOnly);
  };
  
  if (!user || user.userType !== 'cook') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'My Meals' }} />
        <EmptyState
          title="Access Denied"
          message="Only cooks can view this page"
          buttonText="Go Back"
          onButtonPress={() => router.back()}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'My Meals',
          headerRight: () => (
            <TouchableOpacity onPress={handleAddMeal} style={styles.addButton}>
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <Input
          placeholder="Search your meals..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={Colors.subtext} />}
          containerStyle={styles.searchInput}
        />
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            showAvailableOnly && styles.filterButtonActive
          ]} 
          onPress={toggleAvailabilityFilter}
        >
          <Filter size={20} color={showAvailableOnly ? Colors.white : Colors.primary} />
          <Text style={[
            styles.filterButtonText,
            showAvailableOnly && styles.filterButtonTextActive
          ]}>
            Available Only
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{myMeals.length}</Text>
          <Text style={styles.statLabel}>Total Meals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {myMeals.filter(meal => meal.availableQuantity > 0).length}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {myMeals.filter(meal => meal.availableQuantity === 0).length}
          </Text>
          <Text style={styles.statLabel}>Sold Out</Text>
        </View>
      </View>
      
      {filteredMeals.length === 0 ? (
        <EmptyState
          title={myMeals.length === 0 ? "No Meals Yet" : "No Meals Found"}
          message={
            myMeals.length === 0 
              ? "Start by adding your first delicious meal!"
              : searchQuery 
                ? "Try adjusting your search or filters"
                : "No meals match your current filters"
          }
          buttonText={myMeals.length === 0 ? "Add Your First Meal" : undefined}
          onButtonPress={myMeals.length === 0 ? handleAddMeal : undefined}
        />
      ) : (
        <ScrollView 
          style={styles.mealsContainer}
          contentContainerStyle={styles.mealsContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredMeals.map((meal) => (
            <View key={meal.id} style={styles.mealCardContainer}>
              <MealCard
                meal={meal}
                onPress={() => handleMealPress(meal)}
                showCookInfo={false}
              />
              
              <View style={styles.mealActions}>
                <Button
                  title="Edit"
                  onPress={() => handleEditMeal(meal)}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDeleteMeal(meal)}
                  variant="outline"
                  size="small"
                  style={[styles.actionButton, styles.deleteButton]}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addButton: {
    padding: 8,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
  },
  mealsContainer: {
    flex: 1,
  },
  mealsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  mealCardContainer: {
    marginBottom: 16,
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
});