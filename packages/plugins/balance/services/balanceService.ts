/**
 * Core Balance - Balance Service
 * Service untuk mengelola saldo dan mutasi
 */

import { BalanceAccount } from '../models/BalanceAccount';
import { BalanceMutation, MutationFilters, BalanceHistory } from '../models/BalanceMutation';

export interface BalanceService {
  getBalance(): Promise<BalanceAccount>;
  getMutations(filters?: MutationFilters): Promise<BalanceMutation[]>;
  getBalanceHistory(startDate: Date, endDate: Date): Promise<BalanceHistory>;
}

class BalanceServiceImpl implements BalanceService {
  async getBalance(): Promise<BalanceAccount> {
    // MOCK: Return dummy balance
    return {
      id: 'acc_123',
      companyId: 'comp_1',
      balance: 1000000,
      currency: 'IDR',
      updatedAt: new Date(),
    };
  }

  async getMutations(filters?: MutationFilters): Promise<BalanceMutation[]> {
    // MOCK: Return empty list
    return [];
  }

  async getBalanceHistory(startDate: Date, endDate: Date): Promise<BalanceHistory> {
    // MOCK: Return dummy history
    return {
      startDate,
      endDate,
      startingBalance: 1000000,
      endingBalance: 1000000,
      mutations: [],
      totalIn: 0,
      totalOut: 0,
    };
  }
}

export const balanceService: BalanceService = new BalanceServiceImpl();

