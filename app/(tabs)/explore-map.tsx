import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import CustomMapView from '@/components/MapView';

export default function ExploreMapScreen() {
  const params = useLocalSearchParams();
  return (
    <View style={styles.container} testID="explore-map-screen">
      <Stack.Screen options={{ title: 'Map' }} />
      <CustomMapView contentType="meals" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
