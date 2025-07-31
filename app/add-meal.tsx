import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X, Camera } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useMealsStore } from '@/store/meals-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { cuisines } from '@/mocks/cuisines';

export default function AddMealScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createMeal, isLoading } = useMealsStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeFrom, setPickupTimeFrom] = useState('');
  const [pickupTimeTo, setPickupTimeTo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Helper functions for date and time formatting
  const formatDate = (input: string) => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    // Format as dd-mm-yyyy
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.slice(0, 2) + '-' + numbers.slice(2);
    } else {
      return numbers.slice(0, 2) + '-' + numbers.slice(2, 4) + '-' + numbers.slice(4, 8);
    }
  };
  
  const formatTime = (input: string) => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    // Format as HH:MM
    if (numbers.length <= 2) {
      return numbers;
    } else {
      return numbers.slice(0, 2) + ':' + numbers.slice(2, 4);
    }
  };
  
  const validateDate = (dateStr: string) => {
    if (!dateStr) return false;
    
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < new Date().getFullYear()) return false;
    
    // Check if it's a valid date
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };
  
  const validateTime = (timeStr: string) => {
    if (!timeStr) return false;
    
    const parts = timeStr.split(':');
    if (parts.length !== 2) return false;
    
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };
  
  const convertDateToISO = (dateStr: string) => {
    const parts = dateStr.split('-');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Meal name is required';
    if (!description) newErrors.description = 'Description is required';
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!cuisineType) newErrors.cuisineType = 'Cuisine type is required';
    if (!availableQuantity) {
      newErrors.availableQuantity = 'Available quantity is required';
    } else if (isNaN(Number(availableQuantity)) || Number(availableQuantity) <= 0) {
      newErrors.availableQuantity = 'Quantity must be a positive number';
    }
    
    // Date validation
    if (!pickupDate) {
      newErrors.pickupDate = 'Pickup date is required';
    } else if (!validateDate(pickupDate)) {
      newErrors.pickupDate = 'Please enter a valid date (DD-MM-YYYY)';
    } else {
      // Check if date is not in the past
      const parts = pickupDate.split('-');
      const selectedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past';
      }
    }
    
    // Time validation
    if (!pickupTimeFrom) {
      newErrors.pickupTimeFrom = 'Pickup start time is required';
    } else if (!validateTime(pickupTimeFrom)) {
      newErrors.pickupTimeFrom = 'Please enter a valid time (HH:MM)';
    }
    
    if (!pickupTimeTo) {
      newErrors.pickupTimeTo = 'Pickup end time is required';
    } else if (!validateTime(pickupTimeTo)) {
      newErrors.pickupTimeTo = 'Please enter a valid time (HH:MM)';
    }
    
    // Check if end time is after start time
    if (pickupTimeFrom && pickupTimeTo && validateTime(pickupTimeFrom) && validateTime(pickupTimeTo)) {
      const fromParts = pickupTimeFrom.split(':');
      const toParts = pickupTimeTo.split(':');
      const fromMinutes = parseInt(fromParts[0]) * 60 + parseInt(fromParts[1]);
      const toMinutes = parseInt(toParts[0]) * 60 + parseInt(toParts[1]);
      
      if (toMinutes <= fromMinutes) {
        newErrors.pickupTimeTo = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 images');
      return;
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = async () => {
    console.log('Form submission started');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add a meal');
      return;
    }
    
    console.log('User authenticated, proceeding with meal creation');
    console.log('User ID:', user.id);
    console.log('Selected images:', images);
    
    // Use the actual uploaded images, or fallback to a default placeholder if none
    const defaultPlaceholder = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
    const finalImages = images.length > 0 ? images : [defaultPlaceholder];
    
    console.log('Final images to be used:', finalImages);
    
    try {
      // Convert date format from dd-mm-yyyy to yyyy-mm-dd for ISO string
      const isoDate = convertDateToISO(pickupDate);
      
      // Create a pickup time object from the inputs
      const pickupTimes = [
        {
          from: new Date(`${isoDate}T${pickupTimeFrom}:00`).toISOString(),
          to: new Date(`${isoDate}T${pickupTimeTo}:00`).toISOString(),
        },
      ];
      
      const mealData = {
        cookId: user.id,
        name,
        description,
        price: Number(price),
        cuisineType,
        images: finalImages,
        ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: allergens.split(',').map(a => a.trim()).filter(a => a),
        availableQuantity: Number(availableQuantity),
        pickupTimes,
        rating: 0,
        reviewCount: 0,
      };
      

      
      await createMeal(mealData);
      
      Alert.alert(
        'Success',
        'Your meal has been added successfully',
        [
          {
            text: 'View My Meals',
            onPress: () => {
              // Reset form
              setName('');
              setDescription('');
              setPrice('');
              setCuisineType('');
              setIngredients('');
              setAllergens('');
              setAvailableQuantity('');
              setPickupDate('');
              setPickupTimeFrom('');
              setPickupTimeTo('');
              setImages([]);
              setErrors({});
              
              // Navigate to my meals
              router.push('/my-meals');
            },
          },
          {
            text: 'Add Another',
            onPress: () => {
              // Reset form but stay on this screen
              setName('');
              setDescription('');
              setPrice('');
              setCuisineType('');
              setIngredients('');
              setAllergens('');
              setAvailableQuantity('');
              setPickupDate('');
              setPickupTimeFrom('');
              setPickupTimeTo('');
              setImages([]);
              setErrors({});
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating meal:', error);
      Alert.alert('Error', 'Failed to add meal. Please try again.');
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.title}>Add New Meal</Text>
      
      <View style={styles.imagesContainer}>
        <Text style={styles.sectionTitle}>Meal Images</Text>
        <Text style={styles.sectionSubtitle}>Add up to 3 images of your meal</Text>
        
        <View style={styles.imageGrid}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              >
                <X size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < 3 && (
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
              <Camera size={24} color={Colors.primary} />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.formContainer}>
        <Input
          label="Meal Name"
          placeholder="Enter the name of your meal"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        
        <Input
          label="Description"
          placeholder="Describe your meal"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          error={errors.description}
        />
        
        <Input
          label="Price ($)"
          placeholder="Enter price"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          error={errors.price}
        />
        
        <Text style={styles.label}>Cuisine Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineContainer}
        >
          {cuisines.map((cuisine) => (
            <TouchableOpacity
              key={cuisine.id}
              style={[
                styles.cuisineButton,
                cuisineType === cuisine.name && styles.selectedCuisine
              ]}
              onPress={() => setCuisineType(cuisine.name)}
            >
              <Text style={styles.cuisineIcon}>{cuisine.icon}</Text>
              <Text style={[
                styles.cuisineText,
                cuisineType === cuisine.name && styles.selectedCuisineText
              ]}>
                {cuisine.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.cuisineType && (
          <Text style={styles.errorText}>{errors.cuisineType}</Text>
        )}
        
        <Input
          label="Ingredients (comma separated)"
          placeholder="e.g. Chicken, Rice, Vegetables"
          value={ingredients}
          onChangeText={setIngredients}
        />
        
        <Input
          label="Allergens (comma separated)"
          placeholder="e.g. Dairy, Nuts, Gluten"
          value={allergens}
          onChangeText={setAllergens}
        />
        
        <Input
          label="Available Quantity"
          placeholder="How many portions are available"
          value={availableQuantity}
          onChangeText={setAvailableQuantity}
          keyboardType="number-pad"
          error={errors.availableQuantity}
        />
        
        <Input
          label="Pickup Date"
          placeholder="DD-MM-YYYY (e.g. 15-07-2025)"
          value={pickupDate}
          onChangeText={(text) => {
            const formatted = formatDate(text);
            if (formatted.length <= 10) { // DD-MM-YYYY = 10 characters
              setPickupDate(formatted);
            }
          }}
          keyboardType="number-pad"
          maxLength={10}
          error={errors.pickupDate}
        />
        
        <View style={styles.timeContainer}>
          <Input
            label="Pickup Time From"
            placeholder="17:00"
            value={pickupTimeFrom}
            onChangeText={(text) => {
              const formatted = formatTime(text);
              if (formatted.length <= 5) { // HH:MM = 5 characters
                setPickupTimeFrom(formatted);
              }
            }}
            keyboardType="number-pad"
            maxLength={5}
            containerStyle={styles.timeInput}
            error={errors.pickupTimeFrom}
          />
          
          <Input
            label="Pickup Time To"
            placeholder="19:00"
            value={pickupTimeTo}
            onChangeText={(text) => {
              const formatted = formatTime(text);
              if (formatted.length <= 5) { // HH:MM = 5 characters
                setPickupTimeTo(formatted);
              }
            }}
            keyboardType="number-pad"
            maxLength={5}
            containerStyle={styles.timeInputLast}
            error={errors.pickupTimeTo}
          />
        </View>
        
        <Button
          title="Add Meal"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          fullWidth
        />
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  imagesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  addImageText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
  },
  cuisineContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  cuisineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
  },
  selectedCuisine: {
    backgroundColor: Colors.primary,
  },
  cuisineIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  cuisineText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedCuisineText: {
    color: Colors.white,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeInputLast: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
    height: 50,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginBottom: 8,
  },
});