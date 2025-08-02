import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { MapPin, User, ChefHat, UtensilsCrossed } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { mockCooks } from '@/mocks/users';
import { useMealsStore } from '@/store/meals-store';

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
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const { filteredMeals } = useMealsStore();

  // Set initial region when component mounts
  useEffect(() => {
    if (!mapRegion) {
      // Set default region initially
      const defaultRegion = {
        latitude: 51.6194,
        longitude: -0.1270,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(defaultRegion);
    }
  }, [mapRegion]);

  useEffect(() => {
    const requestPermission = async () => {
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

    requestPermission();
  }, []);



  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location);
      
      // Center the map on user's location
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(region);
      
      // Also animate to the user's location for better UX
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
        }
      }, 500);
      
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Error getting current location:', error);
      // Set default region if location fails
      const defaultRegion = {
        latitude: 51.6194,
        longitude: -0.1270,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setMapRegion(defaultRegion);
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



  const handleCookMarkerPress = (cook: any) => {
    router.push(`/cook/${cook.id}`);
  };

  const handleMealMarkerPress = (meal: any) => {
    router.push(`/meal/${meal.id}`);
  };

  if (!mapRegion) {
    return (
      <View style={styles.mapPlaceholder}>
        <MapPin size={32} color={Colors.primary} />
        <Text style={styles.mapPlaceholderText}>
          Loading map...
        </Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      region={mapRegion}
      showsUserLocation={locationPermission}
      showsMyLocationButton={locationPermission}
      onRegionChangeComplete={setMapRegion}
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
            <View style={styles.customerMarkerInner}>
              <User size={12} color="white" />
            </View>
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
              onPress={() => handleCookMarkerPress(cook)}
            >
              <View style={styles.cookMarker}>
                <ChefHat size={16} color="white" />
              </View>
            </Marker>
          );
        }
        return null;
      })}

      {/* Meal markers */}
      {contentType === 'meals' && filteredMeals.map((meal) => {
        const cook = mockCooks.find(c => c.id === meal.cookId);
        if (cook?.location?.latitude && cook?.location?.longitude) {
          return (
            <Marker
              key={meal.id}
              coordinate={{
                latitude: cook.location.latitude,
                longitude: cook.location.longitude,
              }}
              title={meal.name}
              description={`${meal.cuisineType} • £${meal.price} • by ${cook.name}`}
              onPress={() => handleMealMarkerPress(meal)}
            >
              <View style={styles.mealMarker}>
                <UtensilsCrossed size={16} color="white" />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  customerMarkerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E5BBA',
    alignItems: 'center',
    justifyContent: 'center',
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
  mealMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
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