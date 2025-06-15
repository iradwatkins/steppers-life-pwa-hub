import { supabase } from '@/integrations/supabase/client';

export interface AccountBalance {
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  is_frozen: boolean;
}

export interface AccountTransaction {
  id: string;
  type: 'credit' | 'debit' | 'transfer_in' | 'transfer_out' | 'withdrawal';
  amount: number;
  balance_after: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

export interface WithdrawalRequest {
  disbursement_id: string;
  amount: number;
  fees: number;
  net_amount: number;
  status: string;
  estimated_processing_time: string;
}

class AccountService {
  // Get account balance
  async getBalance(): Promise<AccountBalance> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
    
    const response = await fetch(`${functionsUrl}/manage-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'get_balance'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get account balance');
    }

    return await response.json();
  }

  // Get account transactions
  async getTransactions(): Promise<{ transactions: AccountTransaction[] }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
    
    const response = await fetch(`${functionsUrl}/manage-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'get_transactions'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get transactions');
    }

    return await response.json();
  }

  // Credit account (add money)
  async creditAccount(amount: number, description: string): Promise<{
    transaction_id: string;
    new_balance: number;
    amount_credited: number;
  }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
    
    const response = await fetch(`${functionsUrl}/manage-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'credit',
        amount,
        description
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to credit account');
    }

    return await response.json();
  }

  // Debit account (subtract money)
  async debitAccount(amount: number, description: string): Promise<{
    transaction_id: string;
    new_balance: number;
    amount_debited: number;
  }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
    
    const response = await fetch(`${functionsUrl}/manage-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'debit',
        amount,
        description
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to debit account');
    }

    return await response.json();
  }

  // Transfer funds to another user
  async transferFunds(recipientId: string, amount: number, description: string): Promise<{
    transfer_id: string;
    debit_transaction_id: string;
    credit_transaction_id: string;
    amount_transferred: number;
  }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
    
    const response = await fetch(`${functionsUrl}/manage-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'transfer',
        recipient_id: recipientId,
        amount,
        description
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transfer funds');
    }

    return await response.json();
  }

  // Request withdrawal
  async requestWithdrawal(
    amount: number, 
    method: 'paypal' | 'cashapp' | 'bank' | 'zelle', 
    details: any
  ): Promise<WithdrawalRequest> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || 'https://intcywjfnyjvvsypsetr.supabase.co/functions/v1';
    
    const response = await fetch(`${functionsUrl}/manage-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'withdraw',
        amount,
        withdrawal_method: method,
        withdrawal_details: details
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to request withdrawal');
    }

    return await response.json();
  }

  // Get user payment methods for withdrawals
  async getPaymentMethods(): Promise<Array<{
    id: string;
    payment_method: string;
    account_identifier: string;
    account_name: string;
    is_verified: boolean;
  }>> {
    const { data, error } = await supabase
      .from('user_payment_info')
      .select('*')
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to get payment methods');
    }

    return data || [];
  }

  // Add new payment method
  async addPaymentMethod(
    method: string,
    accountIdentifier: string,
    accountName: string,
    additionalData?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('user_payment_info')
      .insert({
        payment_method: method,
        account_identifier: accountIdentifier,
        account_name: accountName,
        account_details: additionalData,
        is_verified: false // Will need manual verification
      });

    if (error) {
      throw new Error('Failed to add payment method');
    }
  }

  // Format currency for display
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Calculate withdrawal fees (1% fee as implemented in Edge Function)
  calculateWithdrawalFees(amount: number): { fees: number; netAmount: number } {
    const feePercentage = 0.01; // 1%
    const fees = amount * feePercentage;
    const netAmount = amount - fees;
    
    return { fees, netAmount };
  }
}

export const accountService = new AccountService();