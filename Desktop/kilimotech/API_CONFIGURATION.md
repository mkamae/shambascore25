# API Configuration Guide

This document explains how to configure the API keys for KilimoTech.

## Environment Variables

All API keys are stored in the `.env.local` file (which is not committed to version control). The project uses Vite, so all environment variables must be prefixed with `VITE_`.

### Required Environment Variables

#### 1. Supabase Configuration

```env
VITE_SUPABASE_URL=https://jvqyfxlozoehozunfzkv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Purpose**: Connects your application to Supabase for database operations.

**Where to find**:
- Project URL: Your Supabase project dashboard → Settings → API
- Anon Key: Your Supabase project dashboard → Settings → API → Project API keys

**Current Configuration**:
- ✅ Project URL: `https://jvqyfxlozoehozunfzkv.supabase.co`
- ✅ Anon Key: Configured in `.env.local`

#### 2. Gemini AI Configuration

```env
VITE_GEMINI_API_KEY=AIzaSyA8t9sz9LZdiflCux5ZbxWGB2YLWS7_79o
```

**Purpose**: Enables AI-powered features including:
- Farm yield advice and recommendations
- Risk analysis
- Loan eligibility suggestions
- M-Pesa statement credit scoring

**Where to find**:
- Google AI Studio: https://aistudio.google.com/app/apikey
- Create a new API key or use an existing one

**Current Configuration**:
- ✅ API Key: Configured in `.env.local`

## File Structure

```
kilimotech/
├── .env.local              # Your actual API keys (DO NOT COMMIT)
├── .env.example            # Template for environment variables
├── .cursorignore           # Allows Cursor to edit .env.local
└── services/
    ├── supabaseClient.ts   # Supabase client configuration
    └── geminiService.ts    # Gemini AI service configuration
```

## Security Best Practices

### ✅ DO:
- Keep `.env.local` in your `.gitignore` (already configured)
- Use `.env.example` as a template for new developers
- Rotate API keys regularly
- Use environment-specific keys (dev, staging, production)

### ❌ DON'T:
- Commit `.env.local` to version control
- Share API keys in plain text (Slack, email, etc.)
- Use production keys in development
- Hardcode API keys in source code

## How Environment Variables Work in Vite

Vite exposes environment variables through `import.meta.env`:

```typescript
// ✅ Correct way to access env vars in Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// ❌ This won't work in Vite (Node.js style)
const apiKey = process.env.VITE_GEMINI_API_KEY;
```

**Important**: 
- Only variables prefixed with `VITE_` are exposed to your client-side code
- Variables are replaced at build time, not runtime
- Changes to `.env.local` require restarting the dev server

## Usage Examples

### Supabase Client
```typescript
// services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Gemini AI Service
```typescript
// services/geminiService.ts
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });
```

## Gemini AI Features

The Gemini API is used for two main functions:

### 1. Farm Insights Generation (`getFarmInsights`)
Analyzes farmer data to provide:
- **Yield Advice**: Actionable tips to improve crop productivity
- **Risk Advice**: Financial and environmental risk mitigation strategies
- **Loan Advice**: Steps to improve creditworthiness

**Model**: `gemini-2.5-flash`
**Temperature**: 0.5 (balanced creativity and consistency)

### 2. M-Pesa Statement Scoring (`scoreMpesaStatement`)
Analyzes M-Pesa transaction history to:
- Identify income patterns
- Track expense behaviors
- Detect loan repayment history
- Flag high-risk activities (e.g., betting)
- Calculate credit profile

**Model**: `gemini-2.5-flash`
**Temperature**: 0.2 (more deterministic for financial analysis)

**Output**:
- Loan Eligibility (KES)
- Repayment Ability Score (0-100)
- Risk Score (0-100, lower is better)
- Summary of financial health

## Troubleshooting

### Gemini API Issues

**Error**: "Missing Gemini API key"
- **Solution**: Check that `VITE_GEMINI_API_KEY` is set in `.env.local`
- Restart the dev server after adding the key

**Error**: API key invalid or quota exceeded
- **Solution**: Verify your API key at https://aistudio.google.com/app/apikey
- Check your quota limits in Google AI Studio

**Error**: "AI response was not in the expected format"
- **Solution**: This is likely a temporary API issue. Try again.
- Check the console for the actual response received

### Supabase Issues

**Error**: "Missing Supabase environment variables"
- **Solution**: Check that both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Verify the values match your Supabase project settings

**Error**: Connection refused or CORS errors
- **Solution**: Check your Supabase project is active
- Verify the URL is correct (should start with https://)
- Check Supabase dashboard for project status

## Testing Your Configuration

To test if your API keys are working:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test Supabase**:
   - Log in to the app
   - Check if farmers are loaded from the database
   - Try updating farm data

3. **Test Gemini AI**:
   - Navigate to the AI Insights tab
   - Click "Generate AI Insights"
   - Upload an M-Pesa statement for credit scoring

## Environment-Specific Setup

### Development
Use the current `.env.local` configuration.

### Production
Create a `.env.production` file with production keys:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_GEMINI_API_KEY=your_production_gemini_key
```

### Deployment
When deploying to platforms like Vercel, Netlify, or similar:
1. Add environment variables in the platform's dashboard
2. Use the same variable names (with `VITE_` prefix)
3. Ensure build command runs `npm run build`

## Rate Limits and Quotas

### Gemini AI
- **Free tier**: 60 requests per minute
- **Quota**: Check at https://aistudio.google.com
- **Best practice**: Implement caching for repeated requests

### Supabase
- **Free tier**: 50,000 monthly active users
- **Database**: 500 MB storage
- **API**: Unlimited requests
- **Bandwidth**: 2 GB

## Support

- **Supabase**: https://supabase.com/docs
- **Gemini AI**: https://ai.google.dev/docs
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html

