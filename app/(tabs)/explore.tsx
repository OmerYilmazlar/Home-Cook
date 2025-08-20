import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/store/theme-store';
import { useMealsStore } from '@/store/meals-store';
import { Filter, Star, List as ListIcon, Map as MapIcon, Search } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { cuisines } from '@/mocks/cuisines';
import CustomMapView from '@/components/MapView';
import { Image } from 'expo-image';
import CookCard from '@/components/CookCard';
import type { Cook } from '@/types';
import { userService } from '@/lib/database';

export default function ExploreScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    filteredMeals,
    fetchMeals,
    setCuisineFilter,
    setRatingFilter,
    setSearchQuery,
    cuisineFilter,
    ratingFilter,
  } = useMealsStore();

  const [mode, setMode] = useState<'meals' | 'cooks'>('meals');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [query, setQuery] = useState<string>('');
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [loadingCooks, setLoadingCooks] = useState<boolean>(false);
  const [cooksError, setCooksError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchMeals().catch((e) => console.log('Explore: fetchMeals error', e));
  }, [fetchMeals]);

  React.useEffect(() => {
    if ((mode === 'cooks' || viewMode === 'map') && cooks.length === 0 && !loadingCooks) {
      setLoadingCooks(true);
      userService.getAllCooks()
        .then((list) => {
          setCooks(list);
          setCooksError(null);
        })
        .catch((e: any) => {
          console.log('Explore: getAllCooks error', e);
          setCooksError('Failed to load cooks');
        })
        .finally(() => setLoadingCooks(false));
    }
  }, [mode, viewMode, cooks.length, loadingCooks]);

  React.useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  const data = useMemo(() => filteredMeals, [filteredMeals]);

  const onCuisinePress = useCallback((name: string | null) => {
    setCuisineFilter(name);
  }, [setCuisineFilter]);

  const onRatingPress = useCallback((rating: number | null) => {
    setRatingFilter(rating);
  }, [setRatingFilter]);

  const renderMealItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/meal/${item.id}`)}
      testID={`meal-card-${item.id}`}
    >
      {item.images?.[0] ? (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={150}
          testID={`meal-image-${item.id}`}
        />
      ) : (
        <View style={[styles.image, styles.placeholder, { backgroundColor: colors.border }]} />
      )}
      <View style={styles.meta}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={2}>
          {item.cuisineType} • ${item.price}
        </Text>
      </View>
    </TouchableOpacity>
  ), [colors, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="explore-screen">
      <Stack.Screen options={{ title: 'Explore' }} />

      <View style={styles.topArea}>
        <View style={[styles.searchBox, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}>
          <Search size={18} color={colors.subtext} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search delicious meals..."
            placeholderTextColor={colors.subtext}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            testID="explore-search"
          />
        </View>

        <View style={styles.segmented}>
          <TouchableOpacity
            onPress={() => setMode('meals')}
            style={[styles.segmentBtn, mode === 'meals' && { backgroundColor: Colors.primary }]}
            testID="seg-meals"
          >
            <Text style={[styles.segmentText, { color: mode === 'meals' ? 'white' : colors.text }]}>Meals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('cooks')}
            style={[styles.segmentBtn, mode === 'cooks' && { backgroundColor: Colors.primary }]}
            testID="seg-cooks"
          >
            <Text style={[styles.segmentText, { color: mode === 'cooks' ? 'white' : colors.text }]}>Cooks</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={[{ name: 'All', icon: '⭐' }, ...cuisines]}
          keyExtractor={(item: any, idx) => (item.id ?? 'all') + String(idx)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }: { item: any }) => {
            const isAll = item.name === 'All';
            const selected = isAll ? !cuisineFilter : cuisineFilter === item.name;
            return (
              <TouchableOpacity
                onPress={() => onCuisinePress(isAll ? null : item.name)}
                style={[styles.chip, selected && { backgroundColor: Colors.primary }]}
                testID={`chip-${item.name}`}
              >
                <Text style={[styles.chipText, { color: selected ? 'white' : colors.text }]}>
                  {item.icon ? `${item.icon} ` : ''}{item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.ratingRow}>
          <Text style={[styles.ratingLabel, { color: colors.subtext }]}>Rating:</Text>
          {[5,4,3,2,1].map((r) => {
            const selected = ratingFilter === r;
            return (
              <TouchableOpacity key={r}
                onPress={() => onRatingPress(selected ? null : r)}
                style={[styles.ratingChip, selected && { backgroundColor: Colors.primary }]}
                testID={`rating-${r}`}
              >
                <Star size={14} color={selected ? 'white' : Colors.rating} fill={selected ? 'white' : 'none'} />
                <Text style={[styles.ratingText, { color: selected ? 'white' : colors.text }]}>{r}+</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.viewSwitchRow}>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.viewSwitchBtn, viewMode === 'list' && styles.viewSwitchActive]}
            testID="view-list"
          >
            <ListIcon size={16} color={viewMode === 'list' ? 'white' : colors.text} />
            <Text style={[styles.viewSwitchText, { color: viewMode === 'list' ? 'white' : colors.text }]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('map')}
            style={[styles.viewSwitchBtn, viewMode === 'map' && styles.viewSwitchActive]}
            testID="view-map"
          >
            <MapIcon size={16} color={viewMode === 'map' ? 'white' : colors.text} />
            <Text style={[styles.viewSwitchText, { color: viewMode === 'map' ? 'white' : colors.text }]}>Map</Text>
          </TouchableOpacity>
          <View style={styles.resultsRight}>
            <Text style={[styles.resultsText, { color: colors.subtext }]}>{data.length} results</Text>
          </View>
        </View>
      </View>

      {viewMode === 'map' ? (
        <View style={{ flex: 1 }}>
          <CustomMapView contentType={mode === 'meals' ? 'meals' : 'cooks'} cooks={cooks} />
        </View>
      ) : mode === 'cooks' ? (
        <FlatList
          data={cooks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, cooks.length === 0 && { flex: 1 }]}
          renderItem={({ item }) => <CookCard cook={item} />}
          ListEmptyComponent={() => (
            <View style={styles.empty} testID="explore-empty-cooks">
              <Text style={{ color: colors.inactive }}>
                {loadingCooks ? 'Loading cooks...' : cooksError ?? 'No cooks found.'}
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderMealItem}
          ListEmptyComponent={() => (
            <View style={styles.empty} testID="explore-empty-state">
              <Text style={{ color: colors.inactive }}>No meals yet.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topArea: { paddingHorizontal: 16, paddingTop: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, height: 44, borderWidth: 1 },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 15 },
  segmented: { flexDirection: 'row', gap: 12, marginTop: 16, alignSelf: 'flex-start' },
  segmentBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.white },
  segmentText: { fontSize: 14, fontWeight: '600' as const },
  chipsRow: { gap: 8, paddingVertical: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F4F7', borderWidth: 1, borderColor: '#EEF0F3' },
  chipText: { fontSize: 14, fontWeight: '600' as const },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingLabel: { fontSize: 14 },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#EEF0F3' },
  ratingText: { fontSize: 13, fontWeight: '600' as const },
  viewSwitchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  viewSwitchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', marginRight: 8 },
  viewSwitchActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  viewSwitchText: { fontSize: 13, fontWeight: '600' as const },
  resultsRight: { flex: 1, alignItems: 'flex-end' },
  resultsText: { fontSize: 13 },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  image: { width: '100%', height: 160, backgroundColor: '#EFEFEF' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  meta: { padding: 12 },
  title: { fontSize: 16, fontWeight: '600' as const },
  subtitle: { marginTop: 4, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 48 },
});
