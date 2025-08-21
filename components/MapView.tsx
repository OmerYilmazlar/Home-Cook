import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import { MapPin, User, ChefHat, UtensilsCrossed, X, Navigation } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { useMealsStore } from '@/store/meals-store';
import { useLocationStore } from '@/store/location-store';
import type { Cook, Meal } from '@/types';

interface MapViewProps {
  contentType: 'meals' | 'cooks';
  meals?: Meal[];
  cooks?: Cook[];
}

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let Callout: any = null;

if (Platform.OS !== 'web') {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
  Polyline = MapModule.Polyline;
  Callout = MapModule.Callout;
}

export default function CustomMapView({ contentType, meals, cooks }: MapViewProps) {
  const router = useRouter();
  const { selectedMeal } = useLocalSearchParams();
  const mapRef = useRef<any>(null);
  const { userLocation, hasPermission, checkLocationPermission } = useLocationStore();
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [travelTime, setTravelTime] = useState<string>('');
  const [availabilityTime, setAvailabilityTime] = useState<string>('');
  const { filteredMeals, fetchMealById } = useMealsStore();
  const mealsData = meals ?? filteredMeals;
  const cooksData: Cook[] = cooks ?? [];
  console.log('MapView: data snapshot', { contentType, mealsCount: mealsData?.length ?? 0, cooksCount: cooksData?.length ?? 0 });

  // Ensure permission and set initial region
  useEffect(() => {
    (async () => {
      try {
        await checkLocationPermission();
        if (userLocation) {
          const region = {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setMapRegion((prev: any) => prev ?? region);
        }
      } catch (e) {
        console.log('MapView: permission/initial region error', e);
      }
      if (!mapRegion) {
        const defaultRegion = {
          latitude: 51.5072,
          longitude: -0.1276,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        };
        setMapRegion(defaultRegion);
      }
    })();
  }, [checkLocationPermission, userLocation, mapRegion]);

  // Handle selectedMeal from URL params and when cooks load
  useEffect(() => {
    if (selectedMeal && typeof selectedMeal === 'string') {
      fetchMealById(selectedMeal);
      const meal = mealsData.find(m => m.id === selectedMeal);
      if (meal) {
        handleMealMarkerPress(meal);
      }
    }
  }, [selectedMeal, mealsData, cooksData.length, fetchMealById]);



  // Fit map to include user + markers
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      const points: { latitude: number; longitude: number }[] = [];
      if (userLocation) {
        points.push({ latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude });
      }
      const cooksPts = (cooksData || []).flatMap((c) =>
        c.location?.latitude && c.location?.longitude
          ? [{ latitude: c.location.latitude, longitude: c.location.longitude }]
          : []
      );
      const mealsPts = (mealsData || []).flatMap((m) => {
        const c = cooksData.find((cc) => cc.id === m.cookId);
        return c?.location?.latitude && c?.location?.longitude
          ? [{ latitude: c.location.latitude, longitude: c.location.longitude }]
          : [];
      });
      const all = [...points, ...(contentType === 'cooks' ? cooksPts : mealsPts)];
      console.log('MapView: fit candidates', all);
      if (all.length >= 1) {
        if (all.length === 1) {
          const single = all[0];
          setMapRegion((prev: any) => ({
            latitude: single.latitude,
            longitude: single.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
            ...prev,
          }));
        } else if (MapView && mapRef.current.fitToCoordinates) {
          mapRef.current.fitToCoordinates(all, {
            edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
            animated: true,
          });
        }
      }
    } catch (e) {
      console.log('MapView: fitToCoordinates failed', e);
    }
  }, [contentType, cooksData, mealsData, userLocation]);

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
    // Check location permission in real-time
    await checkLocationPermission();
    
    if (!hasPermission || !userLocation) {
      Alert.alert('Location Required', 'Please enable location access to show the route.');
      return;
    }

    setSelectedMarker({ ...markerData, type });
    setDestinationCoords(destination);

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
      
      // Set availability time based on marker type
      if (type === 'meal') {
        const meal = markerData;
        if (meal.pickupTimes && meal.pickupTimes.length > 0) {
          const firstPickupTime = meal.pickupTimes[0];
          const fromTime = new Date(firstPickupTime.from).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          const toTime = new Date(firstPickupTime.to).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          setAvailabilityTime(`${fromTime}-${toTime}`);
        } else {
          setAvailabilityTime('');
        }
      } else {
        // For cooks, we can show a general availability or leave empty
        setAvailabilityTime('Available now');
      }
      
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

  const handleMealMarkerPress = async (meal: any) => {
    try {
      let cook = cooksData.find(c => c.id === meal.cookId);
      if (!cook) {
        try {
          const { userService } = await import('@/lib/database');
          const fetched = await userService.getUserById(meal.cookId);
          cook = fetched as Cook | null as any;
        } catch (e) {
          console.log('MapView: failed to fetch cook by id', e);
        }
      }
      if (cook?.location?.latitude && cook?.location?.longitude) {
        calculateRoute(cook.location, meal, 'meal');
      } else {
        console.log('MapView: cook has no coordinates, cannot place marker');
      }
    } catch (e) {
      console.log('MapView: handleMealMarkerPress error', e);
    }
  };

  const clearRoute = () => {
    setSelectedMarker(null);
    setRouteCoordinates([]);
    setDestinationCoords(null);
    setTravelTime('');
    setAvailabilityTime('');
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
        showsUserLocation={!!userLocation}
        showsMyLocationButton={!!userLocation}
        onRegionChangeComplete={setMapRegion}
        onPress={clearRoute}
        testID="rn-map"
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
      {contentType === 'cooks' && cooksData.map((cook) => {
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
      {contentType === 'meals' && mealsData.map((meal) => {
        const cook = cooksData.find(c => c.id === meal.cookId);
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
              testID={`marker-meal-${meal.id}`}
>
              <View style={[styles.mealMarker, isSelected && styles.selectedMarker]}>
                <UtensilsCrossed size={16} color="white" />
              </View>
              {Callout && (
                <Callout onPress={() => router.push(`/meal/${meal.id}`)} tooltip={false}>
                  <View style={styles.calloutBox}>
                    <Text style={styles.calloutTitle}>{meal.name}</Text>
                    <Text style={styles.calloutSubtitle}>£{meal.price}</Text>
                  </View>
                </Callout>
              )}
            </Marker>
          );
        }
        return null;
      })}

      {/* Destination fallback marker */}
      {destinationCoords && (
        <Marker
          coordinate={destinationCoords}
          title={selectedMarker?.name ?? 'Location'}
          description={selectedMarker?.type === 'meal' ? `£${selectedMarker?.price ?? ''}` : 'Cook location'}
        >
          <View style={[styles.mealMarker, styles.selectedMarker]}>
            <UtensilsCrossed size={16} color="white" />
          </View>
        </Marker>
      )}

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
                {availabilityTime && (
                  <View style={styles.availabilityContainer}>
                    <Text style={styles.availabilityText}>{availabilityTime}</Text>
                  </View>
                )}
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
    flexWrap: 'wrap',
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
  availabilityContainer: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    alignSelf: 'center',
  },
  availabilityText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  calloutBox: {
    minWidth: 160,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  calloutSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.subtext,
    fontWeight: '600',
  },
});