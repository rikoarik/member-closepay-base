/**
 * Core Balance - Mutation Service
 * Service untuk operasi mutasi (internal use, biasanya dipanggil dari payment service)
 */

import { BalanceMutation } from '../models/BalanceMutation';
import { TransactionType } from '../models/TransactionType';

export interface MutationService {
  createMutation(
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<BalanceMutation>;
}

class MutationServiceImpl implements MutationService {
  async createMutation(
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<BalanceMutation> {
    // MOCK: Return dummy mutation
    return {
      id: `mut_${Date.now()}`,
      accountId,
      type,
      amount,
      balance: 1000000 - amount, // Simplified balance tracking
      description,
      referenceId,
      createdAt: new Date(),
    };
  }
}

export const mutationService: MutationService = new MutationServiceImpl();

