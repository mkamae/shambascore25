/**
 * Wallet Service
 * 
 * Handles M-Pesa wallet operations (simulated)
 * - Create/update wallet
 * - Process deposits and withdrawals
 * - Track transaction history
 */

import { supabase } from './supabaseClient';

export interface Wallet {
    id: string;
    farmerId: string;
    balance: number;
    currency: string;
    phoneNumber: string;
    status: 'Active' | 'Suspended' | 'Closed';
    createdAt: string;
    updatedAt: string;
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    type: 'deposit' | 'withdrawal' | 'payment_in' | 'payment_out';
    amount: number;
    balanceAfter: number;
    description?: string;
    reference?: string;
    phoneNumber?: string;
    status: 'pending' | 'completed' | 'failed';
    metadata?: any;
    createdAt: string;
}

/**
 * Get or create wallet for farmer
 */
export async function getOrCreateWallet(farmerId: string, phoneNumber: string): Promise<Wallet | null> {
    try {
        // Try to fetch existing wallet
        const { data: existing, error: fetchError } = await supabase
            .from('wallets')
            .select('*')
            .eq('farmer_id', farmerId)
            .single();

        if (existing && !fetchError) {
            return {
                id: existing.id,
                farmerId: existing.farmer_id,
                balance: parseFloat(existing.balance) || 0,
                currency: existing.currency || 'KES',
                phoneNumber: existing.phone_number,
                status: existing.status,
                createdAt: existing.created_at,
                updatedAt: existing.updated_at
            };
        }

        // Create new wallet if doesn't exist
        const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({
                farmer_id: farmerId,
                phone_number: phoneNumber,
                balance: 0,
                currency: 'KES',
                status: 'Active'
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating wallet:', createError);
            return null;
        }

        return {
            id: newWallet.id,
            farmerId: newWallet.farmer_id,
            balance: parseFloat(newWallet.balance) || 0,
            currency: newWallet.currency || 'KES',
            phoneNumber: newWallet.phone_number,
            status: newWallet.status,
            createdAt: newWallet.created_at,
            updatedAt: newWallet.updated_at
        };
    } catch (error) {
        console.error('Error in getOrCreateWallet:', error);
        return null;
    }
}

/**
 * Process a transaction (deposit or withdrawal)
 */
export async function processTransaction(
    walletId: string,
    type: 'deposit' | 'withdrawal' | 'payment_in' | 'payment_out',
    amount: number,
    description?: string,
    phoneNumber?: string
): Promise<WalletTransaction | null> {
    try {
        // Get current wallet
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('id', walletId)
            .single();

        if (walletError || !wallet) {
            throw new Error('Wallet not found');
        }

        const currentBalance = parseFloat(wallet.balance) || 0;
        let newBalance: number;

        // Calculate new balance
        if (type === 'deposit' || type === 'payment_in') {
            newBalance = currentBalance + amount;
        } else if (type === 'withdrawal' || type === 'payment_out') {
            if (currentBalance < amount) {
                throw new Error('Insufficient balance');
            }
            newBalance = currentBalance - amount;
        } else {
            throw new Error('Invalid transaction type');
        }

        // Update wallet balance
        const { error: updateError } = await supabase
            .from('wallets')
            .update({
                balance: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', walletId);

        if (updateError) {
            throw new Error('Failed to update wallet balance');
        }

        // Generate M-Pesa reference (simulated)
        const reference = generateMpesaReference();

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert({
                wallet_id: walletId,
                type,
                amount,
                balance_after: newBalance,
                description: description || getDefaultDescription(type),
                reference,
                phone_number: phoneNumber || wallet.phone_number,
                status: 'completed',
                metadata: {}
            })
            .select()
            .single();

        if (transactionError) {
            console.error('Error creating transaction:', transactionError);
            // Rollback balance update if transaction record fails
            await supabase
                .from('wallets')
                .update({ balance: currentBalance })
                .eq('id', walletId);
            throw new Error('Failed to record transaction');
        }

        return {
            id: transaction.id,
            walletId: transaction.wallet_id,
            type: transaction.type,
            amount: parseFloat(transaction.amount),
            balanceAfter: parseFloat(transaction.balance_after),
            description: transaction.description,
            reference: transaction.reference,
            phoneNumber: transaction.phone_number,
            status: transaction.status,
            metadata: transaction.metadata,
            createdAt: transaction.created_at
        };
    } catch (error: any) {
        console.error('Error in processTransaction:', error);
        throw error;
    }
}

/**
 * Get transaction history for a wallet
 */
export async function getTransactionHistory(
    walletId: string,
    limit: number = 50
): Promise<WalletTransaction[]> {
    try {
        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('wallet_id', walletId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return (data || []).map(t => ({
            id: t.id,
            walletId: t.wallet_id,
            type: t.type,
            amount: parseFloat(t.amount),
            balanceAfter: parseFloat(t.balance_after),
            description: t.description,
            reference: t.reference,
            phoneNumber: t.phone_number,
            status: t.status,
            metadata: t.metadata,
            createdAt: t.created_at
        }));
    } catch (error) {
        console.error('Error in getTransactionHistory:', error);
        return [];
    }
}

/**
 * Generate simulated M-Pesa reference
 */
function generateMpesaReference(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MP${timestamp}${random}`;
}

/**
 * Get default description for transaction type
 */
function getDefaultDescription(type: string): string {
    const descriptions: Record<string, string> = {
        deposit: 'Wallet Deposit',
        withdrawal: 'Wallet Withdrawal',
        payment_in: 'Payment Received',
        payment_out: 'Payment Sent'
    };
    return descriptions[type] || 'Transaction';
}

