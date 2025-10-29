# Supabase SQL Setup Guide

## Fix: "Connection string is missing" Error

If you see "Unable to run query: Connection string is missing" in Supabase SQL Editor, follow these steps:

---

## ✅ Step-by-Step Solution

### Option 1: Refresh Supabase Dashboard (Most Common Fix)

1. **Close and reopen Supabase Dashboard**
   - Log out and log back in
   - This refreshes your session

2. **Clear Browser Cache**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cached files and cookies
   - Reload Supabase Dashboard

3. **Try a different browser**
   - Sometimes browser-specific issues can cause this
   - Try Chrome, Firefox, or Edge

---

### Option 2: Run SQL in Smaller Chunks

Instead of running the entire file, run it section by section:

#### Part 1: Create Tables
```sql
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
```

Click **Run** and wait for success message.

#### Part 2: Create Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_wallets_farmer_id ON wallets(farmer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
```

Click **Run**.

#### Part 3: Create Function and Trigger
```sql
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
```

Click **Run**.

#### Part 4: Enable RLS and Policies
```sql
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
```

Click **Run**.

---

### Option 3: Use Table Editor (Alternative Method)

If SQL Editor keeps failing, you can create tables manually:

1. Go to **Table Editor** → **New Table**
2. Create `wallets` table with these columns:
   - `id` (uuid, primary key, default: `gen_random_uuid()`)
   - `farmer_id` (uuid, foreign key → `farmers.id`)
   - `balance` (numeric, default: 0)
   - `currency` (text, default: 'KES')
   - `phone_number` (text)
   - `status` (text, default: 'Active')
   - `created_at` (timestamptz, default: `now()`)
   - `updated_at` (timestamptz, default: `now()`)

3. Repeat for `wallet_transactions` table

4. Then run only the function, trigger, and RLS policies from the SQL file

---

## 🔍 Troubleshooting

### Error: "relation 'farmers' does not exist"

**Fix:** Run `supabase-schema-fixed.sql` FIRST to create the `farmers` table, then run the wallet schema.

### Error: "permission denied"

**Fix:** 
1. Make sure you're the project owner or have database admin rights
2. Check you're logged into the correct Supabase project

### SQL Editor Not Loading

**Fix:**
1. Check your internet connection
2. Try incognito/private browsing mode
3. Disable browser extensions temporarily
4. Contact Supabase support if issue persists

---

## ✅ Verification

After running the SQL, verify the tables exist:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see:
   - ✅ `wallets` table
   - ✅ `wallet_transactions` table

3. Check the tables have the correct columns (listed above)

---

## 📝 Notes

- The schema uses `IF NOT EXISTS` so it's safe to run multiple times
- All policies are set to `true` (allow all) for now - adjust based on your auth needs later
- The `farmers` table must exist first (run `supabase-schema-fixed.sql` if needed)

---

## Need More Help?

If you continue to see "Connection string is missing":
1. Check Supabase Status: https://status.supabase.com
2. Try again after a few minutes (could be temporary)
3. Contact Supabase support with your project URL

