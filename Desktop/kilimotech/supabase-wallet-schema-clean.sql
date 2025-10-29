CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) DEFAULT 0.0 CHECK (balance >= 0),
    currency TEXT DEFAULT 'KES',
    phone_number TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farmer_id)
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment_in', 'payment_out')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(12, 2) NOT NULL,
    description TEXT,
    reference TEXT,
    phone_number TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_farmer_id ON wallets(farmer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

CREATE OR REPLACE FUNCTION update_wallets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_wallets_updated_at ON wallets;
CREATE TRIGGER trigger_update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_wallets_updated_at();

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own wallet" ON wallets;
CREATE POLICY "Farmers can view their own wallet"
    ON wallets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert their own wallet" ON wallets;
CREATE POLICY "Farmers can insert their own wallet"
    ON wallets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Farmers can update their own wallet" ON wallets;
CREATE POLICY "Farmers can update their own wallet"
    ON wallets FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Farmers can view their own transactions" ON wallet_transactions;
CREATE POLICY "Farmers can view their own transactions"
    ON wallet_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert their own transactions" ON wallet_transactions;
CREATE POLICY "Farmers can insert their own transactions"
    ON wallet_transactions FOR INSERT WITH CHECK (true);

