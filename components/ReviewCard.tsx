import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { Review } from '@/types';
import Colors from '@/constants/colors';

interface ReviewCardProps {
  review: Review;
  customerName: string;
  customerAvatar?: string;
}

export default function ReviewCard({ review, customerName, customerAvatar }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        size={16}
        color={Colors.rating}
        fill={index < rating ? Colors.rating : Colors.transparent}
      />
    ));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {customerAvatar ? (
            <Image
              source={{ uri: customerAvatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <View>
            <Text style={styles.name}>{customerName}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.rating}>
          {renderStars(review.rating)}
        </View>
      </View>
      
      {review.comment && (
        <Text style={styles.comment}>{review.comment}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});