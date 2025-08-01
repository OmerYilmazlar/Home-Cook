import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { MapPin, User } from 'lucide-react-native';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { mockCooks } from '@/mocks/users';

interface MapViewProps {
  contentType: 'meals' | 'cooks';
}

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
}

export default function CustomMapView({ contentType }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'web') {
        setIsLoadingLocation(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Permission to access location was denied. You can still view cooks on the map, but your location won\'t be shown.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      setLocationPermission(true);
      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsLoadingLocation(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location);
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      setIsLoadingLocation(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.mapPlaceholder}>
        <MapPin size={32} color={Colors.primary} />
        <Text style={styles.mapPlaceholderText}>
          Map view is not available on web
        </Text>
      </View>
    );
  }

  if (!MapView) {
    return (
      <View style={styles.mapPlaceholder}>
        <MapPin size={32} color={Colors.primary} />
        <Text style={styles.mapPlaceholderText}>
          Map view is not available on this platform
        </Text>
      </View>
    );
  }

  const getInitialRegion = () => {
    if (userLocation) {
      return {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    // Default to London area
    return {
      latitude: 51.6194,
      longitude: -0.1270,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={getInitialRegion()}
      showsUserLocation={locationPermission}
      showsMyLocationButton={locationPermission}
    >
      {/* Customer location marker */}
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          }}
          title="Your Location"
          description="You are here"
          pinColor={Colors.secondary}
        >
          <View style={styles.customerMarker}>
            <User size={16} color="white" />
          </View>
        </Marker>
      )}

      {/* Cook markers */}
      {contentType === 'cooks' && mockCooks.map((cook) => {
        if (cook.location?.latitude && cook.location?.longitude) {
          return (
            <Marker
              key={cook.id}
              coordinate={{
                latitude: cook.location.latitude,
                longitude: cook.location.longitude,
              }}
              title={cook.name}
              description={cook.cuisineTypes?.join(', ') || 'Cook'}
            >
              <View style={styles.cookMarker}>
                <MapPin size={16} color="white" />
              </View>
            </Marker>
          );
        }
        return null;
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  mapPlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
    fontWeight: '500',
  },
  customerMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cookMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});