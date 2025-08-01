import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Map, List } from 'lucide-react-native';
import { useMealsStore } from '@/store/meals-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import MealCard from '@/components/MealCard';
import CookCard from '@/components/CookCard';
import FilterBar from '@/components/FilterBar';
import CustomMapView from '@/components/MapView';
import { mockCooks } from '@/mocks/users';

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ view?: string }>();
  const { filteredMeals, fetchMeals, setCuisineFilter, setRatingFilter, setSearchQuery, searchQuery, cuisineFilter, ratingFilter } = useMealsStore();
  const { user } = useAuthStore();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>(user?.userType === 'customer' ? 'map' : 'list');
  const [contentType, setContentType] = useState<'meals' | 'cooks'>(params.view === 'cooks' ? 'cooks' : 'meals');
  
  useEffect(() => {
    fetchMeals();
  }, []);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  
  const renderMealItem = ({ item }: { item: any }) => (
    <MealCard meal={item} />
  );
  
  const renderCookItem = ({ item }: { item: any }) => (
    <CookCard cook={item} />
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.subtext} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={contentType === 'meals' ? "Search delicious meals..." : "Find amazing cooks..."}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.grey}
          />
        </View>
        
        <View style={styles.toggleContainer}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                contentType === 'meals' && styles.viewToggleButtonActive
              ]}
              onPress={() => setContentType('meals')}
            >
              <Text style={[
                styles.viewToggleText,
                contentType === 'meals' && styles.viewToggleTextActive
              ]}>
                Meals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                contentType === 'cooks' && styles.viewToggleButtonActive
              ]}
              onPress={() => setContentType('cooks')}
            >
              <Text style={[
                styles.viewToggleText,
                contentType === 'cooks' && styles.viewToggleTextActive
              ]}>
                Cooks
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {contentType === 'meals' && (
        <View style={styles.filterContainer}>
          <FilterBar
            selectedCuisine={cuisineFilter}
            selectedRating={ratingFilter}
            onSelectCuisine={setCuisineFilter}
            onSelectRating={setRatingFilter}
          />
        </View>
      )}
      
      <View style={styles.viewModeContainer}>
        <View style={styles.viewModeButtons}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' && styles.viewModeButtonActive
            ]}
            onPress={() => setViewMode('list')}
          >
            <List size={18} color={viewMode === 'list' ? Colors.primary : Colors.subtext} />
            <Text style={[
              styles.viewModeText,
              viewMode === 'list' && styles.viewModeTextActive
            ]}>
              List
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'map' && styles.viewModeButtonActive
            ]}
            onPress={() => setViewMode('map')}
          >
            <Map size={18} color={viewMode === 'map' ? Colors.primary : Colors.subtext} />
            <Text style={[
              styles.viewModeText,
              viewMode === 'map' && styles.viewModeTextActive
            ]}>
              Map
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.resultCount}>
          {contentType === 'meals' ? filteredMeals.length : mockCooks.length} results
        </Text>
      </View>
      
      {viewMode === 'list' ? (
        <FlatList
          data={contentType === 'meals' ? filteredMeals : mockCooks}
          renderItem={contentType === 'meals' ? renderMealItem : renderCookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.mapContainer}>
          <CustomMapView contentType={contentType} />
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
  searchContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  toggleContainer: {
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  viewToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.subtext,
  },
  viewToggleTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingBottom: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  viewModeButtons: {
    flexDirection: 'row',
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 13,
    color: Colors.subtext,
    marginLeft: 6,
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.cardSecondary,
  },
  map: {
    flex: 1,
  },

});