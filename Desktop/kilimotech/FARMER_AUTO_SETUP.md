# Automatic Farmer Setup Fix

## Problem

The wallet feature requires farmers with UUID IDs from Supabase, but the app was using mock farmers (like "farmer-1") which have string IDs.

## Solution

Added automatic farmer record creation/linking for authenticated users. When a user signs in, the system now:

1. ✅ Checks if they already have a farmer record
2. ✅ Creates a new farmer record with UUID if they don't
3. ✅ Links the farmer record to the authenticated user
4. ✅ Automatically selects that farmer for the session

---

## How It Works

### 1. **Automatic Setup on Login**

When a user signs in:
- `farmerAuthService.getOrCreateFarmerForUser()` is called
- System checks user metadata for existing `farmer_id`
- If not found, creates a new farmer record with:
  - Name from user metadata or email
  - Phone from user metadata or default
  - Location: "Kenya" (default, can be updated)
  - Farm type: "Smallholder" (default, can be updated)
- Returns the UUID farmer ID

### 2. **Integration Points**

- **AppContext**: Automatically calls farmer setup when user logs in
- **Login Flow**: Ensures farmer record exists before selecting farmer
- **Wallet Service**: Now works because farmer always has UUID

---

## Setup

### Option 1: Use Existing Schema (No Changes Needed)

The current setup works automatically. Just:
1. Make sure users sign up/sign in through the landing page
2. The system will create farmer records automatically
3. Wallet feature will work immediately

### Option 2: Add Email Column (Optional)

If you want to link farmers to users by email:

1. Run in Supabase SQL Editor:
```sql
-- From supabase-farmers-email-migration.sql
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_farmers_email ON farmers(email) WHERE email IS NOT NULL;
```

Benefits:
- Faster lookups when farmers already exist
- Better data linking between auth and farmers

---

## Verification

After a user signs in, check:

1. **Supabase Farmers Table**:
   - New farmer record with UUID ID
   - Name and phone from signup
   - Default location and farm type

2. **User Metadata**:
   - Contains `farmer_id` linking user to farmer
   - Check in Supabase Auth → Users → User metadata

3. **App Context**:
   - `selectedFarmer` should have UUID (not "farmer-1")
   - Wallet should work without errors

---

## Testing

1. **Sign Up**:
   - Create a new account on landing page
   - Check Supabase: New farmer record should be created

2. **Sign In**:
   - Log in with existing account
   - Check console: Should see "✅ Created farmer record for user: [UUID]"
   - Wallet should load without errors

3. **Multiple Logins**:
   - Sign in again with same account
   - Should reuse existing farmer record (not create duplicate)

---

## Troubleshooting

### "Farmer ID must be a valid UUID" Error

**Still seeing this?**

1. **Check farmer record exists**:
   - Go to Supabase → Table Editor → farmers
   - Verify farmer with UUID exists for your user

2. **Check user metadata**:
   - Supabase → Authentication → Users
   - Check user's metadata has `farmer_id`

3. **Clear cache and retry**:
   - Sign out and sign back in
   - Refresh page
   - Check browser console for errors

### Farmer Not Created

**Check:**
1. Supabase connection is working
2. `farmers` table exists and is accessible
3. RLS policies allow inserts (should be set in schema)

**Fix:**
- Run `supabase-schema-fixed.sql` to ensure table exists
- Check RLS policies in Supabase dashboard

### Duplicate Farmers Created

**Cause:** Multiple calls to `getOrCreateFarmerForUser`

**Fix:** Already handled - system checks existing records first

---

## Files Changed

1. **`services/farmerAuthService.ts`** (NEW)
   - Handles automatic farmer creation/linking
   - `getOrCreateFarmerForUser()` function

2. **`context/AppContext.tsx`** (UPDATED)
   - Integrated farmer auto-setup on login
   - Improved login flow to prefer UUID farmers

3. **`supabase-farmers-email-migration.sql`** (NEW, OPTIONAL)
   - Adds email column to farmers table
   - Optional enhancement for better linking

---

## Benefits

✅ **No more UUID errors**: Every authenticated user gets a UUID farmer
✅ **Automatic setup**: No manual farmer creation needed
✅ **Wallet works**: All features that require UUID farmers now work
✅ **Better UX**: Users don't need to manually create profiles
✅ **Data consistency**: All farmers have proper UUID IDs

---

## Next Steps

1. Test signup/signin flow
2. Verify farmer record creation in Supabase
3. Try wallet feature - should work now!
4. (Optional) Run email migration if you want email linking

---

## Summary

The system now **automatically creates farmer records** when users sign up or sign in. This ensures:
- Every user has a farmer with UUID
- Wallet and other UUID-requiring features work
- No more mock farmer errors

Just sign in and the system handles the rest! 🚀

