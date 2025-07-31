import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Star, MapPin, Edit, LogOut, Settings, ShoppingBag, MessageCircle, Heart, ChefHat, Award, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth-store';
import { Cook } from '@/types';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import WalletCard from '@/components/WalletCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const isCook = user?.userType === 'cook';
  const cookUser = isCook ? (user as Cook) : null;
  
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };
  
  const handleSettings = () => {
    router.push('/settings');
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            // The auth guard in the tabs layout will automatically redirect
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
                style={styles.avatar}
                contentFit="cover"
              />
              {isCook && (
                <View style={styles.cookBadge}>
                  <ChefHat size={16} color={Colors.white} />
                </View>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user?.name}</Text>
              
              <View style={styles.userTypeContainer}>
                <Text style={styles.userType}>
                  {isCook ? 'Home Cook' : 'Food Lover'}
                </Text>
              </View>
              
              {user?.rating && (
                <View style={styles.ratingContainer}>
                  <Star size={16} color={Colors.rating} fill={Colors.rating} />
                  <Text style={styles.rating}>
                    {user.rating.toFixed(1)} ({user.reviewCount} reviews)
                  </Text>
                </View>
              )}
              
              {user?.location && (
                <View style={styles.locationContainer}>
                  <MapPin size={16} color={Colors.white} />
                  <Text style={styles.location} numberOfLines={1}>
                    {user.location.address}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Button
            title="Edit"
            onPress={handleEditProfile}
            variant="outline"
            size="small"
            style={styles.editButton}
            textStyle={{ color: Colors.white }}
            leftIcon={<Edit size={14} color={Colors.white} />}
          />
        </View>
      </LinearGradient>
      
      {isCook && cookUser?.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{cookUser.bio}</Text>
        </View>
      )}
      
      {/* Wallet Card */}
      <View style={styles.walletContainer}>
        <WalletCard 
          showEarnings={isCook} 
          onPress={() => router.push('/transaction-history')}
        />
      </View>
      
      {isCook && cookUser?.cuisineTypes && cookUser.cuisineTypes.length > 0 && (
        <View style={styles.cuisineContainer}>
          <Text style={styles.sectionTitle}>Cuisine Types</Text>
          <View style={styles.cuisineTagsContainer}>
            {(cookUser.cuisineTypes || []).map((cuisine: string, index: number) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{cuisine}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.menuContainer}>
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Activity</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
            <View style={styles.menuIconContainer}>
              <ShoppingBag size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>
                {isCook ? 'Order Management' : 'My Orders'}
              </Text>
              <Text style={styles.menuItemSubtext}>
                {isCook ? 'Manage incoming orders' : 'View order history'}
              </Text>
            </View>
          </TouchableOpacity>
          
          {isCook && (
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/my-meals')}>
              <View style={styles.menuIconContainer}>
                <ChefHat size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>My Meals</Text>
                <Text style={styles.menuItemSubtext}>Manage your meal listings</Text>
              </View>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/messages')}>
            <View style={styles.menuIconContainer}>
              <MessageCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Messages</Text>
              <Text style={styles.menuItemSubtext}>Chat with customers</Text>
            </View>
          </TouchableOpacity>
          
          {!isCook && (
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Coming Soon', 'Favorites feature is coming soon!')}>
              <View style={styles.menuIconContainer}>
                <Heart size={20} color={Colors.primary} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Favorites</Text>
                <Text style={styles.menuItemSubtext}>Your saved meals</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <View style={styles.menuIconContainer}>
              <Settings size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Settings</Text>
              <Text style={styles.menuItemSubtext}>App preferences</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
              <Text style={styles.menuItemSubtext}>Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  cookBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  userInfo: {
    marginLeft: 20,
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  userTypeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userType: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rating: {
    fontSize: 14,
    color: Colors.white,
    marginLeft: 6,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: Colors.white,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
    opacity: 0.9,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bioContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bioText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  walletContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cuisineContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  cuisineTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineTag: {
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cuisineText: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '600',
  },
  menuContainer: {
    marginHorizontal: 20,
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    letterSpacing: -0.2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 13,
    color: Colors.subtext,
    fontWeight: '500',
  },
  logoutText: {
    color: Colors.error,
  },
});