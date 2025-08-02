import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import { MapPin, User, ChefHat, UtensilsCrossed, X, Navigation } from 'lucide-react-native';
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
let Polyline: any = null;

if (Platform.OS !== 'web') {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
  Polyline = MapModule.Polyline;
}

export default function CustomMapView({ contentType }: MapViewProps) {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [travelTime, setTravelTime] = useState<string>('');
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
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



  const calculateRoute = async (destination: { latitude: number; longitude: number }, markerData: any, type: 'cook' | 'meal') => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Your location is needed to show the route.');
      return;
    }

    setIsLoadingRoute(true);
    setSelectedMarker({ ...markerData, type });

    try {
      const origin = `${userLocation.coords.latitude},${userLocation.coords.longitude}`;
      const dest = `${destination.latitude},${destination.longitude}`;
      
      // Using Google Maps Directions API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=driving&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      
      // For demo purposes, we'll create a simple straight line route
      // In production, you'd use the actual Google Maps API response
      const routeCoords = [
        {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        },
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      ];
      
      setRouteCoordinates(routeCoords);
      
      // Calculate approximate travel time based on distance
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        destination.latitude,
        destination.longitude
      );
      
      // Assume average speed of 30 km/h in city
      const timeInMinutes = Math.round((distance * 60) / 30);
      setTravelTime(`${timeInMinutes} min`);
      
      // Fit the route in view
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(routeCoords, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert('Route Error', 'Unable to calculate route. Please try again.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCookMarkerPress = (cook: any) => {
    if (cook.location?.latitude && cook.location?.longitude) {
      calculateRoute(cook.location, cook, 'cook');
    }
  };

  const handleMealMarkerPress = (meal: any) => {
    const cook = mockCooks.find(c => c.id === meal.cookId);
    if (cook?.location?.latitude && cook?.location?.longitude) {
      calculateRoute(cook.location, meal, 'meal');
    }
  };

  const clearRoute = () => {
    setSelectedMarker(null);
    setRouteCoordinates([]);
    setTravelTime('');
  };

  const navigateToDetails = () => {
    if (selectedMarker) {
      if (selectedMarker.type === 'cook') {
        router.push(`/cook/${selectedMarker.id}`);
      } else {
        router.push(`/meal/${selectedMarker.id}`);
      }
    }
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
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={locationPermission}
        showsMyLocationButton={locationPermission}
        onRegionChangeComplete={setMapRegion}
        onPress={clearRoute}
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
          const isSelected = selectedMarker?.id === cook.id && selectedMarker?.type === 'cook';
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
              <View style={[styles.cookMarker, isSelected && styles.selectedMarker]}>
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
          const isSelected = selectedMarker?.id === meal.id && selectedMarker?.type === 'meal';
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
              <View style={[styles.mealMarker, isSelected && styles.selectedMarker]}>
                <UtensilsCrossed size={16} color="white" />
              </View>
            </Marker>
          );
        }
        return null;
      })}

      {/* Route polyline */}
      {routeCoordinates.length > 0 && Polyline && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={Colors.primary}
          strokeWidth={4}
          lineDashPattern={[5, 5]}
        />
      )}
      </MapView>

      {/* Route info overlay */}
      {selectedMarker && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeInfo}>
            <View style={styles.routeHeader}>
              <View style={styles.routeDetails}>
                <Navigation size={16} color={Colors.primary} />
                <Text style={styles.travelTime}>{travelTime}</Text>
                <Text style={styles.routeText}>to {selectedMarker.name}</Text>
              </View>
              <TouchableOpacity onPress={clearRoute} style={styles.closeButton}>
                <X size={20} color={Colors.subtext} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={navigateToDetails} style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  selectedMarker: {
    transform: [{ scale: 1.2 }],
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  routeInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  routeInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  travelTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
    marginRight: 8,
  },
  routeText: {
    fontSize: 14,
    color: Colors.subtext,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  viewDetailsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});