import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { lightColors, darkColors } from '@/constants/colors';
import { Platform } from 'react-native';

interface ThemeState {
  colors: typeof lightColors | typeof darkColors;
  isDark: boolean;
  soundEnabled: boolean;
  isLoaded: boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
  playSound: (soundType: 'tap' | 'success' | 'error' | 'notification') => void;
}

const THEME_STORAGE_KEY = '@theme_mode';
const SOUND_STORAGE_KEY = '@sound_enabled';

export const [ThemeProvider, useTheme] = createContextHook((): ThemeState => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    console.log('Theme store: Loading settings...');
    try {
      const [savedTheme, savedSound] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(SOUND_STORAGE_KEY),
      ]);
      
      console.log('Theme store: Loaded theme:', savedTheme);
      console.log('Theme store: Loaded sound:', savedSound);
      
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      }
      
      if (savedSound !== null) {
        setSoundEnabled(JSON.parse(savedSound));
      }
      
      console.log('Theme store: Settings loaded successfully');
    } catch (error) {
      console.log('Error loading theme settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newIsDark));
    } catch (error) {
      console.log('Error saving theme setting:', error);
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
    isDark,
    soundEnabled,
    isLoaded,
    toggleTheme,
    toggleSound,
    playSound,
  };
});