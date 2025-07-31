import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Calendar, Clock, MapPin, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Reservation } from '@/types';
import Colors from '@/constants/colors';
import Button from './Button';

interface ReservationCardProps {
  reservation: Reservation;
  meal?: any;
  mealName?: string;
  cookName?: string;
  customerName?: string;
  showActions?: boolean;
  onStatusChange?: (id: string, status: Reservation['status']) => void;
  userType?: 'customer' | 'cook';
}

export default function ReservationCard({
  reservation,
  meal,
  mealName,
  cookName,
  customerName,
  showActions = false,
  onStatusChange,
  userType,
}: ReservationCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/reservation/${reservation.id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return Colors.primary;
      case 'confirmed':
        return Colors.secondary;
      case 'ready_for_pickup':
        return Colors.success;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.subtext;
    }
  };
  
  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'ready_for_pickup':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return String(status).charAt(0).toUpperCase() + String(status).slice(1);
    }
  };
  
  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.mealName}>{mealName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(reservation.status)}
          </Text>
        </View>
      </View>
      
      {meal && meal.images && meal.images.length > 0 && (
        <Image
          source={{ uri: meal.images[0] }}
          style={styles.mealImage}
          contentFit="cover"
        />
      )}
      
      {cookName && (
        <Text style={styles.personName}>Cook: {cookName}</Text>
      )}
      
      {customerName && (
        <Text style={styles.personName}>Customer: {customerName}</Text>
      )}
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={Colors.subtext} />
          <Text style={styles.detailText}>
            {formatDate(reservation.pickupTime)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={Colors.subtext} />
          <Text style={styles.detailText}>
            {formatTime(reservation.pickupTime)}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          <Text style={styles.quantity}>Quantity: {reservation.quantity}</Text>
        </View>
        <Text style={styles.price}>${reservation.totalPrice.toFixed(2)}</Text>
      </View>
      
      {showActions && onStatusChange && (
        <View style={styles.actions}>
          {reservation.status === 'pending' && (
            <>
              <Button
                title="Confirm Order"
                variant="primary"
                size="small"
                onPress={() => onStatusChange(reservation.id, 'confirmed')}
                style={styles.actionButton}
              />
              <Button
                title="Cancel"
                variant="outline"
                size="small"
                onPress={() => onStatusChange(reservation.id, 'cancelled')}
                style={styles.actionButton}
              />
            </>
          )}
          
          {reservation.status === 'confirmed' && (
            <Button
              title="Mark Ready for Pickup"
              variant="secondary"
              size="small"
              onPress={() => onStatusChange(reservation.id, 'ready_for_pickup')}
              style={styles.actionButton}
            />
          )}
          
          {reservation.status === 'ready_for_pickup' && (
            <View style={styles.pickupInfo}>
              <Text style={styles.pickupText}>
                ✅ Ready for customer pickup (Payment processed)
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Rating button for completed orders (customer view only) */}
      {reservation.status === 'completed' && userType === 'customer' && !reservation.rating && (
        <View style={styles.ratingSection}>
          <Button
            title="Rate Order"
            variant="outline"
            size="small"
            onPress={() => router.push(`/rate-order/${reservation.id}` as any)}
            style={styles.rateButton}
            textStyle={styles.rateButtonText}
          />
        </View>
      )}
      
      {/* Show rating if already rated */}
      {reservation.rating && (
        <View style={styles.existingRating}>
          <View style={styles.ratingHeader}>
            <Star size={16} color={Colors.warning || '#f59e0b'} fill={Colors.warning || '#f59e0b'} />
            <Text style={styles.ratingText}>
              Meal: {reservation.rating.mealRating}/5 • Cook: {reservation.rating.cookRating}/5
            </Text>
          </View>
          {reservation.rating.reviewText && (
            <Text style={styles.reviewText}>"{reservation.rating.reviewText}"</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  personName: {
    fontSize: 15,
    color: Colors.subtext,
    marginBottom: 12,
    fontWeight: '600',
  },
  mealImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  detailsContainer: {
    marginVertical: 12,
    backgroundColor: Colors.cardSecondary,
    padding: 12,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  leftFooter: {
    flex: 1,
  },
  quantity: {
    fontSize: 15,
    color: Colors.subtext,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    minWidth: 100,
    borderRadius: 12,
  },
  pickupInfo: {
    backgroundColor: Colors.cardSecondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  pickupText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    textAlign: 'center',
  },
  ratingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rateButton: {
    borderColor: Colors.primary,
  },
  rateButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  existingRating: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewText: {
    fontSize: 13,
    color: Colors.subtext,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});