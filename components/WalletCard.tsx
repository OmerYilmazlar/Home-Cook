import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { usePaymentStore } from '@/store/payment-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';

interface WalletCardProps {
  userId?: string;
  showEarnings?: boolean;
  onPress?: () => void;
}

export default function WalletCard({ userId, showEarnings = false, onPress }: WalletCardProps) {
  const { user } = useAuthStore();
  const { getWallet, getEarningsSummary } = usePaymentStore();
  
  const targetUserId = userId || user?.id;
  if (!targetUserId) return null;
  
  const wallet = getWallet(targetUserId);
  const isCook = user?.userType === 'cook' && targetUserId === user.id;
  
  if (!wallet) return null;
  
  const earnings = isCook ? getEarningsSummary(targetUserId) : null;
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };
  
  const CardContent = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isCook ? '💰 Earnings Wallet' : '💳 Payment Wallet'}
        </Text>
        <Text style={styles.balance}>
          {formatCurrency(wallet.balance)}
        </Text>
      </View>
      
      {earnings && showEarnings && (
        <View style={styles.earningsContainer}>
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Total Earned:</Text>
            <Text style={styles.earningValue}>
              {formatCurrency(earnings.totalEarned)}
            </Text>
          </View>
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Pending:</Text>
            <Text style={[styles.earningValue, styles.pendingValue]}>
              {formatCurrency(earnings.pendingEarnings)}
            </Text>
          </View>
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Available:</Text>
            <Text style={[styles.earningValue, styles.availableValue]}>
              {formatCurrency(earnings.availableBalance)}
            </Text>
          </View>
        </View>
      )}
      
      {!isCook && (
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            Total Spent: {formatCurrency(wallet.totalSpent)}
          </Text>
        </View>
      )}
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity style={styles.touchable} onPress={onPress}>
        {CardContent}
      </TouchableOpacity>
    );
  }
  
  return CardContent;
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  earningsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningLabel: {
    fontSize: 14,
    color: Colors.subtext,
    fontWeight: '500',
  },
  earningValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  pendingValue: {
    color: Colors.warning || '#f59e0b',
  },
  availableValue: {
    color: Colors.success || '#10b981',
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  statText: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
  },
});
