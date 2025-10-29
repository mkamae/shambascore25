-- M-Pesa Wallet Schema
-- Run this in your Supabase SQL Editor to create wallet and transaction tables

-- Create wallet table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Wallet Details
    balance NUMERIC(12, 2) DEFAULT 0.0 CHECK (balance >= 0),
    currency TEXT DEFAULT 'KES',
    phone_number TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Closed')),
    
    -- Unique constraint: one wallet per farmer
    UNIQUE(farmer_id)
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Transaction Details
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment_in', 'payment_out')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(12, 2) NOT NULL,
    
    -- Transaction Metadata
    description TEXT,
    reference TEXT, -- M-Pesa transaction reference
    phone_number TEXT, -- Sender/recipient phone number
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallets_farmer_id ON wallets(farmer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_wallets_updated_at ON wallets;
CREATE TRIGGER trigger_update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_wallets_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Farmers can view their own wallet
CREATE POLICY "Farmers can view their own wallet"
    ON wallets
    FOR SELECT
    USING (true); -- Adjust based on your auth setup

CREATE POLICY "Farmers can insert their own wallet"
    ON wallets
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Farmers can update their own wallet"
    ON wallets
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy: Farmers can view their own transactions
CREATE POLICY "Farmers can view their own transactions"
    ON wallet_transactions
    FOR SELECT
    USING (true);

CREATE POLICY "Farmers can insert their own transactions"
    ON wallet_transactions
    FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE wallets IS 'M-Pesa wallet simulation for farmers';
COMMENT ON TABLE wallet_transactions IS 'Transaction history for wallet operations';
COMMENT ON COLUMN wallet_transactions.type IS 'deposit: Add money, withdrawal: Remove money, payment_in: Receive payment, payment_out: Send payment';
COMMENT ON COLUMN wallet_transactions.reference IS 'M-Pesa transaction reference (simulated)';

