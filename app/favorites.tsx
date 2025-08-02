import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useFavoritesStore } from '@/store/favorites-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import CookCard from '@/components/CookCard';
import EmptyState from '@/components/EmptyState';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { favoriteCooks } = useFavoritesStore();

  // Redirect if not a customer
  if (!user || user.userType !== 'customer') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Favorites' }} />
        <EmptyState
          title="Access Denied"
          message="Only customers can view favorites"
          buttonText="Go Back"
          onButtonPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Favorite Cooks',
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.text,
      }} />
      
      {favoriteCooks.length === 0 ? (
        <EmptyState
          title="No Favorite Cooks"
          message="Start exploring and add cooks to your favorites to see them here"
          buttonText="Explore Cooks"
          onButtonPress={() => router.push('/(tabs)/explore')}
        />
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Your Favorite Cooks</Text>
            <Text style={styles.subtitle}>
              {favoriteCooks.length} {favoriteCooks.length === 1 ? 'cook' : 'cooks'} saved
            </Text>
          </View>
          
          <View style={styles.cooksContainer}>
            {favoriteCooks.map((cook) => (
              <CookCard 
                key={cook.id} 
                cook={cook} 
                showFavoriteButton={true}
              />
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subtext,
    fontWeight: '500',
  },
  cooksContainer: {
    paddingHorizontal: 20,
  },
});