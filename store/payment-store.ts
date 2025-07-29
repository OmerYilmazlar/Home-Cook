import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Utility function to fix floating point precision issues
const roundCurrency = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'payment' | 'refund' | 'payout';
  status: 'pending' | 'completed' | 'failed';
  reservationId: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

export interface UserWallet {
  userId: string;
  balance: number;
  pendingAmount: number; // Money held during pending transactions
  totalEarned: number;
  totalSpent: number;
}

interface PaymentState {
  wallets: UserWallet[];
  transactions: Transaction[];
  isLoading: boolean;
  
  // Actions
  initializeWallet: (userId: string, initialBalance?: number) => void;
  getWallet: (userId: string) => UserWallet | null;
  processPayment: (fromUserId: string, toUserId: string, amount: number, reservationId: string, description: string) => Promise<Transaction>;
  completePayment: (transactionId: string) => Promise<boolean>;
  refundPayment: (transactionId: string, reason: string) => Promise<boolean>;
  getTransactionHistory: (userId: string) => Transaction[];
  getEarningsSummary: (cookId: string) => { totalEarned: number; pendingEarnings: number; availableBalance: number };
  roundCurrency: (amount: number) => number;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      wallets: [
        // Initialize with some default wallets
        {
          userId: '2', // Alex (customer)
          balance: 100.00,
          pendingAmount: 0,
          totalEarned: 0,
          totalSpent: 0,
        },
        {
          userId: '1', // Maria (cook)
          balance: 25.50,
          pendingAmount: 0,
          totalEarned: 125.50,
          totalSpent: 0,
        },
      ],
      transactions: [],
      isLoading: false,

      initializeWallet: (userId: string, initialBalance = 0) => {
        set((state) => {
          const existingWallet = state.wallets.find(w => w.userId === userId);
          if (existingWallet) return state;

          return {
            wallets: [
              ...state.wallets,
              {
                userId,
                balance: initialBalance,
                pendingAmount: 0,
                totalEarned: 0,
                totalSpent: 0,
              }
            ]
          };
        });
      },

      getWallet: (userId: string) => {
        const { wallets } = get();
        return wallets.find(w => w.userId === userId) || null;
      },

      processPayment: async (fromUserId: string, toUserId: string, amount: number, reservationId: string, description: string) => {
        set({ isLoading: true });
        
        try {
          const { wallets } = get();
          const fromWallet = wallets.find(w => w.userId === fromUserId);
          const toWallet = wallets.find(w => w.userId === toUserId);

          if (!fromWallet || fromWallet.balance < amount) {
            throw new Error('Insufficient funds');
          }

          if (!toWallet) {
            throw new Error('Recipient wallet not found');
          }

          const transaction: Transaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fromUserId,
            toUserId,
            amount,
            type: 'payment',
            status: 'pending',
            reservationId,
            description,
            createdAt: new Date().toISOString(),
          };

          // Deduct from sender's balance and add to pending
          set((state) => ({
            wallets: state.wallets.map(wallet => {
              if (wallet.userId === fromUserId) {
                return {
                  ...wallet,
                  balance: roundCurrency(wallet.balance - amount),
                  totalSpent: roundCurrency(wallet.totalSpent + amount),
                };
              }
              if (wallet.userId === toUserId) {
                return {
                  ...wallet,
                  pendingAmount: roundCurrency(wallet.pendingAmount + amount),
                };
              }
              return wallet;
            }),
            transactions: [...state.transactions, transaction],
            isLoading: false,
          }));

          console.log('Payment processed:', {
            transaction,
            fromBalance: roundCurrency(fromWallet.balance - amount),
            toPending: roundCurrency((toWallet.pendingAmount || 0) + amount),
          });

          return transaction;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      completePayment: async (transactionId: string) => {
        set({ isLoading: true });

        try {
          const { transactions } = get();
          const transaction = transactions.find(t => t.id === transactionId);

          if (!transaction || transaction.status !== 'pending') {
            throw new Error('Invalid transaction');
          }

          // Move money from pending to balance for recipient
          set((state) => ({
            wallets: state.wallets.map(wallet => {
              if (wallet.userId === transaction.toUserId) {
                return {
                  ...wallet,
                  balance: roundCurrency(wallet.balance + transaction.amount),
                  pendingAmount: roundCurrency(wallet.pendingAmount - transaction.amount),
                  totalEarned: roundCurrency(wallet.totalEarned + transaction.amount),
                };
              }
              return wallet;
            }),
            transactions: state.transactions.map(t => 
              t.id === transactionId 
                ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
                : t
            ),
            isLoading: false,
          }));

          console.log('Payment completed:', transactionId);
          return true;
        } catch (error) {
          set({ isLoading: false });
          console.error('Failed to complete payment:', error);
          return false;
        }
      },

      refundPayment: async (transactionId: string, reason: string) => {
        set({ isLoading: true });

        try {
          const { transactions } = get();
          const originalTransaction = transactions.find(t => t.id === transactionId);

          if (!originalTransaction) {
            throw new Error('Transaction not found');
          }

          const refundTransaction: Transaction = {
            id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fromUserId: originalTransaction.toUserId,
            toUserId: originalTransaction.fromUserId,
            amount: originalTransaction.amount,
            type: 'refund',
            status: 'completed',
            reservationId: originalTransaction.reservationId,
            description: `Refund: ${reason}`,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          };

          set((state) => ({
            wallets: state.wallets.map(wallet => {
              if (wallet.userId === originalTransaction.fromUserId) {
                // Refund to original payer
                return {
                  ...wallet,
                  balance: roundCurrency(wallet.balance + originalTransaction.amount),
                  totalSpent: roundCurrency(Math.max(0, wallet.totalSpent - originalTransaction.amount)),
                };
              }
              if (wallet.userId === originalTransaction.toUserId) {
                // Deduct from recipient
                if (originalTransaction.status === 'pending') {
                  return {
                    ...wallet,
                    pendingAmount: roundCurrency(wallet.pendingAmount - originalTransaction.amount),
                  };
                } else {
                  return {
                    ...wallet,
                    balance: roundCurrency(wallet.balance - originalTransaction.amount),
                    totalEarned: roundCurrency(Math.max(0, wallet.totalEarned - originalTransaction.amount)),
                  };
                }
              }
              return wallet;
            }),
            transactions: [
              ...state.transactions.map(t => 
                t.id === transactionId ? { ...t, status: 'failed' as const } : t
              ),
              refundTransaction
            ],
            isLoading: false,
          }));

          console.log('Payment refunded:', refundTransaction);
          return true;
        } catch (error) {
          set({ isLoading: false });
          console.error('Failed to refund payment:', error);
          return false;
        }
      },

      getTransactionHistory: (userId: string) => {
        const { transactions } = get();
        return transactions
          .filter(t => t.fromUserId === userId || t.toUserId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getEarningsSummary: (cookId: string) => {
        const { wallets, transactions } = get();
        const wallet = wallets.find(w => w.userId === cookId);
        
        if (!wallet) {
          return { totalEarned: 0, pendingEarnings: 0, availableBalance: 0 };
        }

        return {
          totalEarned: wallet.totalEarned,
          pendingEarnings: wallet.pendingAmount,
          availableBalance: wallet.balance,
        };
      },

      roundCurrency: (amount: number) => roundCurrency(amount),
    }),
    {
      name: 'payment-storage',
      partialize: (state) => ({ 
        wallets: state.wallets, 
        transactions: state.transactions 
      }),
    }
  )
);
