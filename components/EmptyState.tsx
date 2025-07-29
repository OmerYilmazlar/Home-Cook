import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  subtitle?: string;
  image?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({
  title,
  message,
  subtitle,
  image,
  buttonText,
  onButtonPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="contain"
        />
      )}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      
      {buttonText && onButtonPress && (
        <Button
          title={buttonText}
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  image: {
    width: 240,
    height: 240,
    marginBottom: 32,
    borderRadius: 20,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 17,
    color: Colors.subtext,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: 300,
  },
  button: {
    minWidth: 200,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.subtext,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    maxWidth: 280,
    lineHeight: 22,
  },
});