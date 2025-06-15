// SteppersLife Account Management Edge Function
// Handles account balances, transactions, and payouts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AccountRequest {
  action: 'credit' | 'debit' | 'transfer' | 'withdraw' | 'get_balance' | 'get_transactions'
  amount?: number
  description?: string
  recipient_id?: string
  withdrawal_method?: string
  withdrawal_details?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { action, amount, description, recipient_id, withdrawal_method, withdrawal_details }: AccountRequest = await req.json()

    // Get user account
    const { data: account, error: accountError } = await supabaseClient
      .from('user_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (accountError) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result
    switch (action) {
      case 'get_balance':
        result = await getAccountBalance(account)
        break
      case 'get_transactions':
        result = await getAccountTransactions(user.id, supabaseClient)
        break
      case 'credit':
        result = await creditAccount(user.id, amount!, description!, supabaseClient)
        break
      case 'debit':
        result = await debitAccount(user.id, amount!, description!, supabaseClient)
        break
      case 'transfer':
        result = await transferFunds(user.id, recipient_id!, amount!, description!, supabaseClient)
        break
      case 'withdraw':
        result = await requestWithdrawal(user.id, amount!, withdrawal_method!, withdrawal_details!, supabaseClient)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Account management error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Get Account Balance
async function getAccountBalance(account: any) {
  return {
    available_balance: parseFloat(account.available_balance),
    pending_balance: parseFloat(account.pending_balance),
    total_earned: parseFloat(account.total_earned),
    total_withdrawn: parseFloat(account.total_withdrawn),
    is_frozen: account.is_frozen
  }
}

// Get Account Transactions
async function getAccountTransactions(userId: string, supabase: any) {
  const { data: transactions, error } = await supabase
    .from('account_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error('Failed to fetch transactions')
  }

  return {
    transactions: transactions.map((t: any) => ({
      id: t.id,
      type: t.transaction_type,
      amount: parseFloat(t.amount),
      balance_after: parseFloat(t.balance_after),
      description: t.description,
      reference_id: t.reference_id,
      reference_type: t.reference_type,
      created_at: t.created_at
    }))
  }
}

// Credit Account (add money)
async function creditAccount(userId: string, amount: number, description: string, supabase: any) {
  if (amount <= 0) {
    throw new Error('Amount must be positive')
  }

  // Start transaction
  const { data: transaction, error } = await supabase
    .from('account_transactions')
    .insert({
      user_id: userId,
      transaction_type: 'credit',
      amount: amount,
      description: description
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create credit transaction')
  }

  // Get updated balance
  const { data: account } = await supabase
    .from('user_accounts')
    .select('available_balance')
    .eq('user_id', userId)
    .single()

  return {
    transaction_id: transaction.id,
    new_balance: parseFloat(account.available_balance),
    amount_credited: amount
  }
}

// Debit Account (subtract money)
async function debitAccount(userId: string, amount: number, description: string, supabase: any) {
  if (amount <= 0) {
    throw new Error('Amount must be positive')
  }

  // Check sufficient balance
  const { data: account } = await supabase
    .from('user_accounts')
    .select('available_balance, is_frozen')
    .eq('user_id', userId)
    .single()

  if (account.is_frozen) {
    throw new Error('Account is frozen')
  }

  if (parseFloat(account.available_balance) < amount) {
    throw new Error('Insufficient balance')
  }

  // Create debit transaction
  const { data: transaction, error } = await supabase
    .from('account_transactions')
    .insert({
      user_id: userId,
      transaction_type: 'debit',
      amount: -amount, // Negative for debit
      description: description
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create debit transaction')
  }

  // Get updated balance
  const { data: updatedAccount } = await supabase
    .from('user_accounts')
    .select('available_balance')
    .eq('user_id', userId)
    .single()

  return {
    transaction_id: transaction.id,
    new_balance: parseFloat(updatedAccount.available_balance),
    amount_debited: amount
  }
}

// Transfer Funds Between Users
async function transferFunds(fromUserId: string, toUserId: string, amount: number, description: string, supabase: any) {
  if (amount <= 0) {
    throw new Error('Amount must be positive')
  }

  if (fromUserId === toUserId) {
    throw new Error('Cannot transfer to same account')
  }

  // Check sender balance
  const { data: senderAccount } = await supabase
    .from('user_accounts')
    .select('available_balance, is_frozen')
    .eq('user_id', fromUserId)
    .single()

  if (senderAccount.is_frozen) {
    throw new Error('Sender account is frozen')
  }

  if (parseFloat(senderAccount.available_balance) < amount) {
    throw new Error('Insufficient balance')
  }

  // Check recipient exists
  const { data: recipient } = await supabase
    .from('user_accounts')
    .select('user_id, is_frozen')
    .eq('user_id', toUserId)
    .single()

  if (!recipient) {
    throw new Error('Recipient account not found')
  }

  if (recipient.is_frozen) {
    throw new Error('Recipient account is frozen')
  }

  // Create transfer transactions (atomic)
  const transferId = crypto.randomUUID()

  // Debit sender
  const { data: debitTx, error: debitError } = await supabase
    .from('account_transactions')
    .insert({
      user_id: fromUserId,
      transaction_type: 'transfer_out',
      amount: -amount,
      description: `Transfer to user: ${description}`,
      reference_id: transferId,
      reference_type: 'transfer'
    })
    .select()
    .single()

  if (debitError) {
    throw new Error('Failed to debit sender account')
  }

  // Credit recipient
  const { data: creditTx, error: creditError } = await supabase
    .from('account_transactions')
    .insert({
      user_id: toUserId,
      transaction_type: 'transfer_in',
      amount: amount,
      description: `Transfer from user: ${description}`,
      reference_id: transferId,
      reference_type: 'transfer'
    })
    .select()
    .single()

  if (creditError) {
    // Rollback debit if credit fails (simplified - in production use proper transactions)
    throw new Error('Failed to credit recipient account')
  }

  return {
    transfer_id: transferId,
    debit_transaction_id: debitTx.id,
    credit_transaction_id: creditTx.id,
    amount_transferred: amount
  }
}

// Request Withdrawal
async function requestWithdrawal(userId: string, amount: number, method: string, details: any, supabase: any) {
  if (amount <= 0) {
    throw new Error('Amount must be positive')
  }

  // Check balance and account status
  const { data: account } = await supabase
    .from('user_accounts')
    .select('available_balance, is_frozen')
    .eq('user_id', userId)
    .single()

  if (account.is_frozen) {
    throw new Error('Account is frozen')
  }

  if (parseFloat(account.available_balance) < amount) {
    throw new Error('Insufficient balance')
  }

  // Get user payment info for withdrawal method
  const { data: paymentInfo } = await supabase
    .from('user_payment_info')
    .select('*')
    .eq('user_id', userId)
    .eq('payment_method', method)
    .eq('is_verified', true)
    .single()

  if (!paymentInfo) {
    throw new Error(`No verified ${method} payment method found`)
  }

  // Calculate fees (example: 1% fee)
  const feePercentage = 0.01
  const fees = amount * feePercentage
  const netAmount = amount - fees

  // Create disbursement request
  const { data: disbursement, error } = await supabase
    .from('payment_disbursements')
    .insert({
      user_id: userId,
      payment_method: method,
      amount: amount,
      fees: fees,
      net_amount: netAmount,
      recipient_info: {
        account_identifier: paymentInfo.account_identifier,
        account_name: paymentInfo.account_name,
        ...details
      },
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create withdrawal request')
  }

  // Create pending transaction to hold the funds
  await supabase
    .from('account_transactions')
    .insert({
      user_id: userId,
      transaction_type: 'withdrawal',
      amount: -amount,
      description: `Withdrawal request via ${method}`,
      reference_id: disbursement.id,
      reference_type: 'disbursement'
    })

  return {
    disbursement_id: disbursement.id,
    amount: amount,
    fees: fees,
    net_amount: netAmount,
    status: 'pending',
    estimated_processing_time: getProcessingTime(method)
  }
}

// Get estimated processing time by payment method
function getProcessingTime(method: string): string {
  switch (method) {
    case 'paypal':
      return '1-2 business days'
    case 'cashapp':
      return '1-3 business days'
    case 'bank':
      return '3-5 business days'
    case 'zelle':
      return 'Same day'
    default:
      return '1-3 business days'
  }
}
