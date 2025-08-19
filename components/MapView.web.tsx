import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface MapViewProps {
  contentType: 'meals' | 'cooks';
}

export default function CustomMapView({ contentType }: MapViewProps) {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <View style={styles.mapPlaceholder} testID="web-map-placeholder">
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Map view isn’t supported on web</Text>
      <Text style={styles.subtitle}>
        Open the app on iOS or Android to see the interactive map for {contentType}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center' as const,
  },
});