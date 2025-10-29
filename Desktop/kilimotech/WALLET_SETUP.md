# M-Pesa Wallet Setup Guide

## Issue You're Seeing

If you see errors like:
```
Failed to load resource: the server responded with a status of 400
Error creating wallet: Object
```

This is happening because:
1. **The `wallets` table doesn't exist yet** - You need to run the SQL schema first
2. **Farmer IDs are strings (like "farmer-1")** - The wallet feature requires UUIDs from Supabase

---

## Quick Fix

### Step 1: Run the Wallet Schema in Supabase

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase-wallet-schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `wallets` table - stores wallet balances
- `wallet_transactions` table - transaction history
- Indexes for performance
- RLS policies for security

### Step 2: Ensure You Have Real Farmers in Supabase

The wallet feature **only works with farmers from your Supabase database**, not mock data.

#### Check Your Farmers:
1. Go to **Supabase Dashboard** → **Table Editor** → `farmers`
2. Verify you have farmers with **UUID IDs** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### If You Don't Have Farmers:
1. Run `supabase-schema-fixed.sql` first (this creates sample farmers with UUIDs)
2. Then run `supabase-wallet-schema.sql`

### Step 3: Refresh the App

After running the SQL schema:
1. Refresh your browser
2. Make sure you're logged in as a farmer from Supabase (not mock data)
3. Navigate to "M-Pesa Wallet" in the sidebar

---

## Understanding the Error Messages

### Error: "Farmer ID must be a valid UUID"

**Cause:** You're using a mock farmer (like "farmer-1") instead of a real farmer from Supabase.

**Solution:**
- Log in with a farmer that exists in your Supabase `farmers` table
- Mock farmers have string IDs like "farmer-1" which won't work
- Real farmers have UUID IDs from the database

### Error: "Wallets table does not exist"

**Cause:** The wallet schema hasn't been run yet.

**Solution:**
- Run `supabase-wallet-schema.sql` in your Supabase SQL Editor

### Error: "Farmer not found in database"

**Cause:** The farmer ID you're using doesn't exist in Supabase.

**Solution:**
- Ensure your farmer exists in the `farmers` table
- Run `supabase-schema-fixed.sql` to create sample farmers if needed

---

## Testing the Wallet

Once setup is complete:

1. **Navigate to Wallet:**
   - Click "M-Pesa Wallet" in the sidebar

2. **Deposit Money:**
   - Click "Deposit" button
   - Enter amount (e.g., 5000)
   - Add description (optional)
   - Submit
   - Balance should update immediately

3. **Withdraw Money:**
   - Click "Withdraw" button
   - Enter amount (must be ≤ balance)
   - Enter recipient phone
   - Submit
   - Balance should decrease

4. **View Transactions:**
   - Scroll down to see transaction history
   - Each transaction shows:
     - Type (deposit/withdrawal)
     - Amount
     - Date & time
     - M-Pesa reference
     - Balance after transaction

---

## Database Schema Summary

The wallet schema creates:

### `wallets` Table
- `id` (UUID, Primary Key)
- `farmer_id` (UUID, Foreign Key → farmers.id)
- `balance` (NUMERIC, default 0)
- `currency` (TEXT, default 'KES')
- `phone_number` (TEXT)
- `status` (TEXT: 'Active' | 'Suspended' | 'Closed')
- `created_at`, `updated_at` (timestamps)

### `wallet_transactions` Table
- `id` (UUID, Primary Key)
- `wallet_id` (UUID, Foreign Key → wallets.id)
- `type` (TEXT: 'deposit' | 'withdrawal' | 'payment_in' | 'payment_out')
- `amount` (NUMERIC)
- `balance_after` (NUMERIC)
- `description` (TEXT, optional)
- `reference` (TEXT, M-Pesa transaction reference)
- `phone_number` (TEXT)
- `status` (TEXT: 'pending' | 'completed' | 'failed')
- `metadata` (JSONB, for additional data)
- `created_at` (timestamp)

---

## Troubleshooting

### Still Getting 400 Errors?

1. **Check Supabase Connection:**
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
   - Make sure they're correct

2. **Verify Table Exists:**
   - Go to Supabase Dashboard → Table Editor
   - Check if `wallets` and `wallet_transactions` tables exist
   - If not, run the schema again

3. **Check RLS Policies:**
   - The schema sets RLS policies to `true` (allow all) for now
   - If you see permission errors, check RLS settings

4. **Check Farmer ID:**
   - In browser console, check what farmer ID is being used
   - It should be a UUID format
   - If it's "farmer-1", you're using mock data

### Wallet Not Loading?

1. **Clear Browser Cache:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check Browser Console:** Look for detailed error messages
3. **Check Network Tab:** See what API calls are failing

---

## Next Steps

Once the wallet is working:
- ✅ Deposit and withdraw functionality
- ✅ Transaction history
- ✅ Balance tracking

Future enhancements:
- Real M-Pesa API integration (STK Push)
- Payment requests
- Transfer between farmers
- Payment scheduling

---

## Support

If you continue to have issues:
1. Check the browser console for detailed errors
2. Verify all SQL schemas have been run
3. Ensure farmers exist in Supabase with UUID IDs
4. Check that environment variables are set correctly

