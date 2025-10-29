import React, { useState, useEffect } from 'react';
import { Farmer } from '../types';
import { Wallet, WalletTransaction } from '../types';
import Card from './shared/Card';
import { getOrCreateWallet, processTransaction, getTransactionHistory } from '../services/walletService';
import Spinner from './shared/Spinner';

interface MpesaWalletProps {
    farmer: Farmer;
}

const MpesaWallet: React.FC<MpesaWalletProps> = ({ farmer }) => {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw' | null>(null);
    
    // Form states
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>(farmer.phone);

    // Load wallet on mount
    useEffect(() => {
        loadWallet();
    }, [farmer.id, farmer.phone]);

    const loadWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            const walletData = await getOrCreateWallet(farmer.id, farmer.phone);
            if (walletData) {
                setWallet(walletData);
                await loadTransactions(walletData.id);
            } else {
                setError('Failed to load wallet');
            }
        } catch (err: any) {
            console.error('Error loading wallet:', err);
            setError(err.message || 'Failed to load wallet');
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async (walletId: string) => {
        try {
            const transactionData = await getTransactionHistory(walletId, 20);
            setTransactions(transactionData);
        } catch (err) {
            console.error('Error loading transactions:', err);
        }
    };

    const handleTransaction = async (type: 'deposit' | 'withdrawal') => {
        if (!wallet) return;

        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (type === 'withdrawal' && wallet.balance < amountNum) {
            setError('Insufficient balance');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const transaction = await processTransaction(
                wallet.id,
                type,
                amountNum,
                description || undefined,
                phoneNumber || undefined
            );

            if (transaction) {
                // Reload wallet and transactions
                await loadWallet();
                setAmount('');
                setDescription('');
                setActiveAction(null);
                setError(null);
            } else {
                setError('Transaction failed');
            }
        } catch (err: any) {
            console.error('Transaction error:', err);
            setError(err.message || 'Transaction failed');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type: string): string => {
        switch (type) {
            case 'deposit':
            case 'payment_in':
                return '💰';
            case 'withdrawal':
            case 'payment_out':
                return '💸';
            default:
                return '💳';
        }
    };

    const getTransactionColor = (type: string): string => {
        switch (type) {
            case 'deposit':
            case 'payment_in':
                return 'text-green-600 bg-green-50';
            case 'withdrawal':
            case 'payment_out':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <Card title="M-Pesa Wallet">
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            </Card>
        );
    }

    if (!wallet && error) {
        const isSetupError = error.includes('table does not exist') || error.includes('run supabase-wallet-schema');
        const isUUIDError = error.includes('UUID') || error.includes('mock data');
        const isFarmerError = error.includes('Farmer not found');
        
        return (
            <Card title="M-Pesa Wallet">
                <div className="text-center py-8 space-y-4">
                    <div className="text-red-600 font-semibold">
                        {isSetupError ? '⚠️ Setup Required' : '❌ Wallet Error'}
                    </div>
                    
                    <div className="max-w-md mx-auto">
                        <p className="text-gray-700 mb-4">{error}</p>
                        
                        {isSetupError && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left text-sm text-gray-700 mb-4">
                                <p className="font-semibold mb-2">📋 To fix this:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Open your Supabase Dashboard</li>
                                    <li>Go to SQL Editor</li>
                                    <li>Run the <code className="bg-gray-100 px-1 rounded">supabase-wallet-schema.sql</code> file</li>
                                    <li>Refresh this page</li>
                                </ol>
                            </div>
                        )}
                        
                        {isUUIDError && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm text-gray-700 mb-4">
                                <p className="font-semibold mb-2">ℹ️ Note:</p>
                                <p>The wallet feature requires farmers from the Supabase database with UUID IDs. Mock farmers (like "farmer-1") cannot use the wallet.</p>
                            </div>
                        )}
                        
                        {isFarmerError && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm text-gray-700 mb-4">
                                <p className="font-semibold mb-2">ℹ️ Note:</p>
                                <p>Please ensure you have created farmers in your Supabase database. The wallet feature works with real database records.</p>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={loadWallet}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Retry
                    </button>
                </div>
            </Card>
        );
    }
    
    if (!wallet && !error) {
        return (
            <Card title="M-Pesa Wallet">
                <div className="text-center py-8">
                    <Spinner />
                    <p className="mt-4 text-gray-600">Loading wallet...</p>
                </div>
            </Card>
        );
    }
    
    if (!wallet) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Wallet Balance Card */}
            <Card title="M-Pesa Wallet" className="bg-gradient-to-br from-green-50 to-blue-50">
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Available Balance</p>
                        <p className="text-4xl font-bold text-green-700">
                            KES {wallet.balance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Phone: {wallet.phoneNumber}</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                            onClick={() => setActiveAction(activeAction === 'deposit' ? null : 'deposit')}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                            disabled={processing}
                        >
                            💰 Deposit
                        </button>
                        <button
                            onClick={() => setActiveAction(activeAction === 'withdraw' ? null : 'withdraw')}
                            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                            disabled={processing || wallet.balance === 0}
                        >
                            💸 Withdraw
                        </button>
                    </div>
                </div>
            </Card>

            {/* Transaction Form */}
            {activeAction && (
                <Card title={activeAction === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleTransaction(activeAction);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount (KES)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                                required
                                disabled={processing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={`${activeAction === 'deposit' ? 'Deposit from' : 'Withdrawal to'}...`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={processing}
                            />
                        </div>

                        {activeAction === 'withdrawal' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipient Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+254..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={processing}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={processing || !amount || parseFloat(amount) <= 0}
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold transition-colors"
                            >
                                {processing ? 'Processing...' : activeAction === 'deposit' ? 'Deposit' : 'Withdraw'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveAction(null);
                                    setAmount('');
                                    setDescription('');
                                    setError(null);
                                }}
                                disabled={processing}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Transaction History */}
            <Card title="Recent Transactions">
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg mb-2">💳</p>
                        <p>No transactions yet</p>
                        <p className="text-sm mt-2">Start by making a deposit</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className={`p-4 rounded-lg border-2 ${getTransactionColor(transaction.type)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-semibold capitalize">
                                                    {transaction.type.replace('_', ' ')}
                                                </p>
                                                <p className={`font-bold ${
                                                    transaction.type === 'deposit' || transaction.type === 'payment_in'
                                                        ? 'text-green-700'
                                                        : 'text-red-700'
                                                }`}>
                                                    {transaction.type === 'deposit' || transaction.type === 'payment_in' ? '+' : '-'}
                                                    KES {transaction.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            {transaction.description && (
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {transaction.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                <span>{formatDate(transaction.createdAt)}</span>
                                                {transaction.reference && (
                                                    <span>Ref: {transaction.reference}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                                    Balance after: KES {transaction.balanceAfter.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Info Card */}
            <Card title="About M-Pesa Wallet" className="bg-blue-50">
                <div className="space-y-2 text-sm text-gray-700">
                    <p>📱 <strong>Simulated Wallet:</strong> This is a demonstration wallet for testing purposes.</p>
                    <p>💡 <strong>Features:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Deposit money to your wallet</li>
                        <li>Withdraw money from your wallet</li>
                        <li>View complete transaction history</li>
                        <li>Track balance in real-time</li>
                    </ul>
                    <p className="mt-3 text-xs text-gray-600">
                        ⚠️ Note: This is a simulation. For production, integrate with actual M-Pesa API (Lipa na M-Pesa, STK Push).
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default MpesaWallet;

