# Database Setup Guide

This guide will help you set up the Supabase database for the Shop254 Creator Platform.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. Node.js and npm installed
3. Access to your Supabase project dashboard

## Step 1: Supabase Project Setup

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to your project: `https://jknkfuxyusowfmgdfgif.supabase.co`
3. Go to the SQL Editor in your dashboard

## Step 2: Create Database Tables

1. Copy the contents of `database/schema.sql`
2. Paste it into the SQL Editor in your Supabase dashboard
3. Run the SQL script to create all the necessary tables

## Step 3: Get Your API Keys

1. In your Supabase dashboard, go to Settings > API
2. Copy the `anon` public key (not the service_role key)
3. Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=https://jknkfuxyusowfmgdfgif.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## Step 4: Database Tables Overview

### Creators Table
- Stores creator information and application status
- Fields: id, name, id_number, telephone_number, handle, avatar_url, bio, mpesa_number, status, business_category, rejection_reason, instagram_handle

### Products Table
- Stores products, services, and events created by creators
- Fields: id, creator_id, name, price, description, image_urls, type, stock, event_date

### Sales Table
- Stores sales transactions
- Fields: id, creator_id, customer_phone, total, payment_method, items (JSONB)

### Analytics Table
- Stores analytics data for creators
- Fields: id, creator_id, views, clicks, sales, revenue, platform_fee, net_revenue, date

## Step 5: Testing the Connection

1. Start your development server: `npm run dev`
2. Check the browser console for any connection errors
3. Test the database connection by creating a test creator

## Step 6: Row Level Security (RLS)

The database is configured with Row Level Security enabled. This means:
- Creators can only access their own data
- Products are viewable by everyone but only editable by the creator
- Sales and analytics are private to each creator

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure your API key is correct and the project URL is right
2. **Table Not Found**: Run the schema.sql script in your Supabase dashboard
3. **Permission Denied**: Check that RLS policies are properly configured

### Getting Help

1. Check the Supabase documentation: https://supabase.com/docs
2. Review the error messages in your browser console
3. Verify your environment variables are set correctly

## API Usage Examples

```typescript
// Using the database hooks
import { useCreators, useProducts, useSales, useAnalytics } from './hooks/useDatabase'

// In your component
function MyComponent() {
  const { creators, loading, error, createCreator } = useCreators()
  const { products, createProduct } = useProducts(creatorId)
  const { sales, createSale } = useSales(creatorId)
  const { analytics, updateAnalytics } = useAnalytics(creatorId)
  
  // Use the data and functions as needed
}
```

## Security Notes

- Never commit your actual API keys to version control
- Use environment variables for sensitive configuration
- The anon key is safe to use in client-side code
- For server-side operations, use the service_role key (but never expose it to the client)
