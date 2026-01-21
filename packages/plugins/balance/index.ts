/**
 * Core Balance Module
 * Export semua types, models, services, hooks, dan components
 */

import { balanceOperationsRegistry, BalanceOperations, BalanceMutation } from '@core/config/plugins/contracts/balance';
import { balanceService } from './services/balanceService';
import { mutationService } from './services/mutationService';
import { BalanceAccount } from './models/BalanceAccount';
import { TransactionType } from './models/TransactionType';

// Register balance operations with core registry
const balanceOps: BalanceOperations = {
  async getBalance(): Promise<BalanceAccount> {
    return await balanceService.getBalance();
  },
  async createMutation(mutation: Omit<BalanceMutation, 'id' | 'createdAt'>): Promise<BalanceMutation> {
    // Map to mutation service format
    const result = await mutationService.createMutation(
      mutation.accountId,
      mutation.type === 'credit' ? TransactionType.CREDIT : TransactionType.DEBIT,
      mutation.amount,
      mutation.description || '',
      mutation.metadata?.referenceId
    );
    
    // Map plugin's BalanceMutation to contract's BalanceMutation format
    return {
      id: result.id,
      accountId: result.accountId,
      type: result.type === TransactionType.CREDIT ? 'credit' : 'debit',
      amount: result.amount,
      description: result.description,
      metadata: result.metadata,
      createdAt: result.createdAt,
    };
  },
};

// Register on module load
balanceOperationsRegistry.register(balanceOps);

export * from './models/TransactionType';
export * from './models/BalanceAccount';
export * from './models/BalanceMutation';
export * from './services/balanceService';
export * from './services/mutationService';
export * from './hooks/useBalance';
export * from './components/screens/BalanceDetailScreen';
export * from './components/screens/TransactionHistoryScreen';
export * from './components/ui/WithdrawIcon';
export * from './components/ui/TopUpIcon';
export * from './components/ui/BalanceCard';
export * from './components/ui/TransactionItem';
export * from './components/ui/TransactionList';
export * from './components/ui/TransactionItemSkeleton';

