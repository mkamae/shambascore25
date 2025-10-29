# Supabase Setup Guide for KilimoTech

This guide will help you set up Supabase for your KilimoTech application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Install Dependencies

Run the following command to install the required packages:

```bash
npm install
```

## Step 2: Configure Environment Variables

The `.env.local` file has already been created with your Supabase credentials:

- **Project URL**: `https://jvqyfxlozoehozunfzkv.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Important**: Never commit `.env.local` to version control. It's already configured in `.cursorignore` for editing purposes.

## Step 3: Create Database Tables

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/jvqyfxlozoehozunfzkv
2. Navigate to the **SQL Editor** in the left sidebar
3. Open the `supabase-schema.sql` file in this project
4. Copy the entire SQL script
5. Paste it into the SQL Editor in Supabase
6. Click **Run** to execute the script

This will create the following tables:
- `farmers` - Stores farmer profile information
- `farm_data` - Stores farm details (crops, acreage, etc.)
- `credit_profiles` - Stores credit and loan information
- `insurance` - Stores insurance status
- `mpesa_statements` - Stores M-Pesa transaction history
- `ai_insights` - Stores AI-generated advice and insights

## Step 4: Database Schema Overview

### Tables Structure

#### farmers
- `id` (UUID, Primary Key)
- `name` (Text)
- `phone` (Text)
- `location` (Text)
- `farm_type` (Text)
- `created_at` (Timestamp)

#### farm_data
- `id` (UUID, Primary Key)
- `farmer_id` (UUID, Foreign Key → farmers.id)
- `crop_type` (Text)
- `acreage` (Numeric)
- `yield_estimate` (Numeric)
- `annual_expenses` (Numeric)
- `rainfall` (Text: 'Low', 'Average', 'High')
- `soil_health` (Text: 'Poor', 'Average', 'Good')
- `created_at` (Timestamp)

#### credit_profiles
- `id` (UUID, Primary Key)
- `farmer_id` (UUID, Foreign Key → farmers.id)
- `loan_eligibility` (Numeric)
- `repayment_ability_score` (Numeric)
- `risk_score` (Numeric)
- `summary` (Text, nullable)
- `created_at` (Timestamp)

#### insurance
- `id` (UUID, Primary Key)
- `farmer_id` (UUID, Foreign Key → farmers.id)
- `status` (Text: 'Active', 'Inactive')
- `created_at` (Timestamp)

#### mpesa_statements
- `id` (UUID, Primary Key)
- `farmer_id` (UUID, Foreign Key → farmers.id)
- `file_name` (Text)
- `upload_date` (Text)
- `created_at` (Timestamp)

#### ai_insights
- `id` (UUID, Primary Key)
- `farmer_id` (UUID, Foreign Key → farmers.id)
- `yield_advice` (Text)
- `risk_advice` (Text)
- `loan_advice` (Text)
- `created_at` (Timestamp)

## Step 5: Row Level Security (RLS)

The schema includes Row Level Security policies that allow all operations for development. For production, you should:

1. Update the RLS policies to restrict access based on user authentication
2. Implement user authentication using Supabase Auth
3. Create policies that allow users to only access their own data

Example production policy:
```sql
CREATE POLICY "Users can only see their own farmer data"
ON farmers FOR SELECT
USING (auth.uid() = user_id);
```

## Step 6: Start Development

Run the development server:

```bash
npm run dev
```

## How It Works

### Data Flow

1. **On App Load**: The app fetches all farmers from Supabase
2. **Fallback**: If Supabase is unavailable, it uses local mock data
3. **Updates**: All data changes are saved to both Supabase and local state
4. **Real-time**: Data is always fresh when switching between farmers

### Key Features

- **Automatic sync**: Changes are automatically saved to Supabase
- **Offline support**: Falls back to mock data if database is unavailable
- **Type safety**: Full TypeScript support with generated types
- **Optimistic updates**: UI updates immediately while saving in background

## API Services

The following services are available in `services/farmerService.ts`:

- `fetchAllFarmers()` - Get all farmers with their data
- `fetchFarmerById(id)` - Get a specific farmer
- `createFarmer(farmer)` - Create a new farmer
- `updateFarmData(id, data)` - Update farm information
- `updateCreditProfile(id, profile)` - Update credit profile
- `updateMpesaStatement(id, statement)` - Update M-Pesa records
- `updateAIInsights(id, insights)` - Update AI-generated insights

## Troubleshooting

### Connection Issues
- Verify your `.env.local` file contains the correct credentials
- Check your Supabase project is active
- Ensure the database tables were created successfully

### CORS Errors
- Supabase should handle CORS automatically
- If issues persist, check your project's API settings in Supabase dashboard

### Missing Data
- Check the browser console for error messages
- Verify the SQL schema was executed successfully
- Run the sample data inserts from `supabase-schema.sql`

## Next Steps

1. **Authentication**: Implement user authentication using Supabase Auth
2. **File Storage**: Use Supabase Storage for M-Pesa statement uploads
3. **Real-time**: Enable real-time subscriptions for live data updates
4. **Security**: Update RLS policies for production use
5. **Backup**: Set up automated database backups

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

