import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Bell, Shield, HelpCircle, Info, ChevronRight, Moon, Volume2 } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/store/theme-store';
import { useNotificationsStore } from '@/store/notifications-store';

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const { colors, isDark, soundEnabled, toggleTheme, toggleSound, playSound } = useTheme();
  const { settings: notificationSettings, updateNotificationSettings } = useNotificationsStore();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  const handleNotificationChange = async (type: string, value: boolean) => {
    playSound('tap');
    
    switch (type) {
      case 'push':
        await updateNotificationSettings({ pushNotifications: value });
        break;
      case 'email':
        setEmailNotifications(value);
        break;
      case 'orders':
        await updateNotificationSettings({ orderUpdates: value });
        break;
      case 'messages':
        await updateNotificationSettings({ messageNotifications: value });
        break;
      case 'dark':
        toggleTheme();
        break;
      case 'sound':
        toggleSound();
        break;
    }
  };
  
  const handlePrivacySettings = () => {
    playSound('tap');
    Alert.alert(
      'Privacy Settings',
      'Manage your privacy preferences:\n\n• Profile visibility\n• Location sharing\n• Data collection\n• Third-party integrations',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    playSound('tap');
    Alert.alert(
      'Help & Support',
      'Get help with:\n\n• How to use the app\n• Account issues\n• Payment problems\n• Report a bug\n• Contact support',
      [{ text: 'OK' }]
    );
  };
  
  const handleAbout = () => {
    playSound('tap');
    Alert.alert(
      'About HomeCook',
      'HomeCook v1.0.0\n\nConnecting home cooks with local food lovers.\n\nBuilt with ❤️ for the community.\n\n© 2025 HomeCook. All rights reserved.',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Notifications</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Bell size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationSettings.pushNotifications}
            onValueChange={(value) => handleNotificationChange('push', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingText, { color: colors.text }]}>Email Notifications</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={(value) => handleNotificationChange('email', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingText, { color: colors.text }]}>Order Updates</Text>
          </View>
          <Switch
            value={notificationSettings.orderUpdates}
            onValueChange={(value) => handleNotificationChange('orders', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingText, { color: colors.text }]}>Message Notifications</Text>
          </View>
          <Switch
            value={notificationSettings.messageNotifications}
            onValueChange={(value) => handleNotificationChange('messages', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Appearance</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Moon size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(value) => handleNotificationChange('dark', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Volume2 size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Sound Effects</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={(value) => handleNotificationChange('sound', value)}
            trackColor={{ false: colors.inactive, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Account</Text>
        
        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handlePrivacySettings}>
          <View style={styles.settingInfo}>
            <Shield size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Privacy Settings</Text>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Support</Text>
        
        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handleHelp}>
          <View style={styles.settingInfo}>
            <HelpCircle size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={handleAbout}>
          <View style={styles.settingInfo}>
            <Info size={20} color={colors.primary} />
            <Text style={[styles.settingText, { color: colors.text }]}>About</Text>
          </View>
          <ChevronRight size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.subtext }]}>
          Logged in as {user?.name}
        </Text>
        <Text style={[styles.footerText, { color: colors.subtext }]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    marginRight: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
});