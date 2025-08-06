import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface VerificationBadgeProps {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hasPhone?: boolean; // Whether user has provided a phone number
  style?: any;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isEmailVerified,
  isPhoneVerified,
  hasPhone = true,
  style,
  size = 'medium',
  showText = true
}) => {
  // Email is required, phone is optional
  const isFullyVerified = isEmailVerified && (hasPhone ? isPhoneVerified : true);
  const isPartiallyVerified = isEmailVerified && (!hasPhone || !isPhoneVerified);

  const getBadgeStyle = () => {
    if (isFullyVerified) {
      return styles.badgeVerified;
    } else if (isPartiallyVerified && isEmailVerified) {
      return styles.badgePartial;
    } else {
      return styles.badgeUnverified;
    }
  };

  const getBadgeText = () => {
    if (isEmailVerified && (!hasPhone || isPhoneVerified)) {
      return '✓ Verified Cook';
    } else if (isEmailVerified && hasPhone && !isPhoneVerified) {
      return '⚠ Email Verified';
    } else {
      return '○ Unverified';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextStyle = () => {
    if (isEmailVerified && (!hasPhone || isPhoneVerified)) {
      return styles.textVerified;
    } else if (isEmailVerified) {
      return styles.textPartial;
    } else {
      return styles.textUnverified;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), getSizeStyle(), style]}>
      {showText ? (
        <Text style={[styles.badgeText, getTextStyle(), getSizeStyle()]}>
          {getBadgeText()}
        </Text>
      ) : (
        <View style={styles.iconContainer}>
          {isEmailVerified && <Text style={styles.icon}>📧</Text>}
          {hasPhone && isPhoneVerified && <Text style={styles.icon}>📱</Text>}
          {!isEmailVerified && <Text style={styles.icon}>○</Text>}
        </View>
      )}
    </View>
  );
};

// Verification summary component for profile pages
export const VerificationSummary: React.FC<{
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hasPhone?: boolean;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
}> = ({ isEmailVerified, isPhoneVerified, hasPhone = true, emailVerifiedAt, phoneVerifiedAt }) => {
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Verification Status</Text>
      
      <View style={styles.summaryItem}>
        <Text style={styles.summaryIcon}>📧</Text>
        <Text style={styles.summaryText}>
          Email: {isEmailVerified ? '✓ Verified' : '○ Not verified'} (Required)
        </Text>
        {isEmailVerified && emailVerifiedAt && (
          <Text style={styles.summaryDate}>
            {emailVerifiedAt.toLocaleDateString()}
          </Text>
        )}
      </View>

      {hasPhone ? (
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>📱</Text>
          <Text style={styles.summaryText}>
            Phone: {isPhoneVerified ? '✓ Verified' : '○ Not verified'} (Optional)
          </Text>
          {isPhoneVerified && phoneVerifiedAt && (
            <Text style={styles.summaryDate}>
              {phoneVerifiedAt.toLocaleDateString()}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>📱</Text>
          <Text style={styles.summaryText}>
            Phone: Not provided (Optional)
          </Text>
        </View>
      )}

      {isEmailVerified && (
        <View style={styles.trustedBadge}>
          <Text style={styles.trustedText}>
            {hasPhone && isPhoneVerified ? '🏆 Fully Verified Cook' : '✅ Verified Cook'}
          </Text>
          <Text style={styles.trustedSubtext}>
            {hasPhone && isPhoneVerified 
              ? 'Both email and phone verified'
              : 'Email verified - add phone for additional trust'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeVerified: {
    backgroundColor: Colors.success,
  },
  badgePartial: {
    backgroundColor: Colors.warning,
  },
  badgeUnverified: {
    backgroundColor: Colors.inactive,
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textVerified: {
    color: Colors.white,
  },
  textPartial: {
    color: Colors.white,
  },
  textUnverified: {
    color: Colors.text,
  },
  small: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  medium: {
    fontSize: 12,
  },
  large: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  summaryContainer: {
    backgroundColor: Colors.cardSecondary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  summaryDate: {
    fontSize: 12,
    color: Colors.subtext,
  },
  trustedBadge: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  trustedText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trustedSubtext: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.9,
  },
});
