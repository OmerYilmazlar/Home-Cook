import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { lightColors } from '@/constants/colors';
import { Platform } from 'react-native';

interface ThemeState {
  colors: typeof lightColors;
  soundEnabled: boolean;
  isLoaded: boolean;
  toggleSound: () => void;
  playSound: (soundType: 'tap' | 'success' | 'error' | 'notification') => void;
}

const SOUND_STORAGE_KEY = '@sound_enabled';

export const [ThemeProvider, useTheme] = createContextHook((): ThemeState => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);

  const colors = lightColors;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    console.log('Theme store: Loading settings...');
    try {
      const savedSound = await AsyncStorage.getItem(SOUND_STORAGE_KEY);
      
      console.log('Theme store: Loaded sound:', savedSound);
      
      if (savedSound !== null) {
        setSoundEnabled(JSON.parse(savedSound));
      }
      
      console.log('Theme store: Settings loaded successfully');
    } catch (error) {
      console.log('Error loading theme settings:', error);
    }
  };

  const toggleSound = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    
    try {
      await AsyncStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(newSoundEnabled));
    } catch (error) {
      console.log('Error saving sound setting:', error);
    }
  };

  const playSound = (soundType: 'tap' | 'success' | 'error' | 'notification') => {
    if (!soundEnabled || Platform.OS === 'web') {
      return;
    }

    console.log(`Playing ${soundType} sound`);
  };

  return {
    colors,
    soundEnabled,
    isLoaded,
    toggleSound,
    playSound,
  };
});