import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { Bell, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface LocalNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: 'reserved' | 'confirmed' | 'ready';
  reservationId: string;
}

interface NotificationBannerProps {
  notification?: LocalNotification;
  onDismiss?: () => void;
}

export default function NotificationBanner({ notification, onDismiss }: NotificationBannerProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  const handleDismiss = React.useCallback(() => {
    // Slide up animation
    Animated.spring(slideAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  }, [slideAnim, onDismiss]);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      // Slide down animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, slideAnim, handleDismiss]);



  if (!visible || !notification) {
    return null;
  }

  const { title, body } = notification;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Bell size={20} color={Colors.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={Colors.subtext} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    color: Colors.subtext,
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
  },
});