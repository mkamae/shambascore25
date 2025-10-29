# KilimoTech - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration ✅

Your API keys are already configured in `.env.local`:
- ✅ **Supabase URL**: `https://jvqyfxlozoehozunfzkv.supabase.co`
- ✅ **Supabase Anon Key**: Configured
- ✅ **Gemini API Key**: `AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o`

### 3. Set Up Supabase Database

1. Visit your Supabase project: https://supabase.com/dashboard/project/jvqyfxlozoehozunfzkv
2. Go to **SQL Editor** in the left sidebar
3. Open `supabase-schema.sql` from this project
4. Copy all the SQL code
5. Paste into the SQL Editor and click **Run**

This creates all necessary tables and sample data.

### 4. Start Development Server
```bash
npm run dev
```

Your app will be available at `http://localhost:5173` (or the next available port).

## 🎯 What's Configured

### Supabase Integration
- **Database**: 6 tables for farmers, farm data, credit profiles, insurance, M-Pesa statements, and AI insights
- **Auto-sync**: All data changes are automatically saved to Supabase
- **Fallback**: Uses local mock data if database is unavailable

### Gemini AI Integration
- **Farm Insights**: AI-generated advice on yield, risks, and loans
- **Credit Scoring**: Automatic M-Pesa statement analysis
- **Model**: Using `gemini-2.5-flash` for fast, accurate responses

## 📁 Key Files

### Configuration
- `.env.local` - Your API keys (never commit this!)
- `.cursorignore` - Allows editing of .env files
- `supabase-schema.sql` - Database schema

### Services
- `services/supabaseClient.ts` - Supabase connection
- `services/geminiService.ts` - Gemini AI functions
- `services/farmerService.ts` - Database operations
- `services/database.types.ts` - TypeScript types

### Context
- `context/AppContext.tsx` - State management with Supabase integration

## 🧪 Testing the Setup

### Test Supabase
1. Start the dev server
2. Log in as a farmer or partner
3. Check if farmers load from the database
4. Try updating farm data - should save to Supabase

### Test Gemini AI
1. Navigate to the AI Insights section
2. Click "Generate AI Insights"
3. Should receive personalized advice
4. Upload M-Pesa statement to test credit scoring

## 📚 Documentation

- **Detailed Setup**: See `SUPABASE_SETUP.md`
- **API Configuration**: See `API_CONFIGURATION.md`
- **Main README**: See `README.md`

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ⚠️ Important Notes

1. **Security**: `.env.local` is excluded from Git (via `*.local` in `.gitignore`)
2. **Vite**: All environment variables must have `VITE_` prefix
3. **Restart**: After changing `.env.local`, restart the dev server
4. **Database**: Run the SQL schema before first use

## 🆘 Troubleshooting

### "Missing environment variables"
- Check `.env.local` exists in project root
- Verify all variables have `VITE_` prefix
- Restart dev server

### "Supabase connection failed"
- Verify database tables are created (run schema)
- Check project URL and API key
- Ensure project is active in Supabase dashboard

### "Gemini API error"
- Verify API key at https://aistudio.google.com/app/apikey
- Check quota limits
- Ensure you have network connection

## 🎉 You're All Set!

Your KilimoTech application is now fully configured with:
- ✅ Supabase database integration
- ✅ Gemini AI for insights and credit scoring
- ✅ Proper environment variable configuration
- ✅ TypeScript support

Happy coding! 🌾

