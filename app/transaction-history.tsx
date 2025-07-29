import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, RotateCcw } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { usePaymentStore, Transaction } from '@/store/payment-store';
import Colors from '@/constants/colors';
import { mockCooks, mockCustomers } from '@/mocks/users';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getTransactionHistory, initializeWallet } = usePaymentStore();
  
  useEffect(() => {
    if (user) {
      initializeWallet(user.id);
    }
  }, [user]);
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to view transactions</Text>
      </View>
    );
  }
  
  const transactions = getTransactionHistory(user.id);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };
  
  const getUserName = (userId: string) => {
    const cook = mockCooks.find(c => c.id === userId);
    const customer = mockCustomers.find(c => c.id === userId);
    return cook?.name || customer?.name || `User ${userId}`;
  };
  
  const getTransactionIcon = (transaction: Transaction, isOutgoing: boolean) => {
    if (transaction.type === 'refund') {
      return <RotateCcw size={20} color={Colors.warning || '#f59e0b'} />;
    }
    return isOutgoing 
      ? <ArrowUpCircle size={20} color={Colors.error} />
      : <ArrowDownCircle size={20} color={Colors.success || '#10b981'} />;
  };
  
  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isOutgoing = item.fromUserId === user.id;
    const otherUserId = isOutgoing ? item.toUserId : item.fromUserId;
    const otherUserName = getUserName(otherUserId);
    
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            {getTransactionIcon(item, isOutgoing)}
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>
                {item.type === 'refund' ? 'Refund' : isOutgoing ? 'Payment to' : 'Payment from'} {otherUserName}
              </Text>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text style={styles.transactionDate}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[
              styles.amount,
              { color: isOutgoing && item.type !== 'refund' ? Colors.error : Colors.success || '#10b981' }
            ]}>
              {isOutgoing && item.type !== 'refund' ? '-' : '+'}{formatCurrency(item.amount)}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'completed' ? Colors.success || '#10b981' : Colors.warning || '#f59e0b' }
            ]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
      </View>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptyMessage}>
            Your payment history will appear here when you make or receive payments.
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
  listContainer: {
    padding: 20,
  },
  transactionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.subtext,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 24,
  },
});
