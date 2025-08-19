import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/store/theme-store';
import { useMealsStore } from '@/store/meals-store';
import { Filter } from 'lucide-react-native';

export default function ExploreScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { meals, fetchMeals } = useMealsStore();

  React.useEffect(() => {
    fetchMeals().catch((e) => console.log('Explore: fetchMeals error', e));
  }, [fetchMeals]);

  const data = useMemo(() => meals, [meals]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="explore-screen">
      <Stack.Screen
        options={{
          title: 'Explore',
          headerRight: () => (
            <TouchableOpacity onPress={() => {}} testID="explore-filter-button" style={styles.headerBtn}>
              <Filter color={colors.text} size={20} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/meal/${item.id}`)}
            testID={`meal-card-${item.id}`}
          >
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholder, { backgroundColor: colors.border }]} />
            )}
            <View style={styles.meta}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.subtitle, { color: colors.inactive }]} numberOfLines={2}>
                {item.cuisineType} • ${item.price}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty} testID="explore-empty-state">
            <Text style={{ color: colors.inactive }}>No meals yet.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBtn: { padding: 8 },
  list: { padding: 16, gap: 12 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160 },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  meta: { padding: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { marginTop: 4, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 48 },
});
