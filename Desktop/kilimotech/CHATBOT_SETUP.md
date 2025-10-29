# AI Advisory Chatbot Setup Guide

## Overview

The AI Advisory Chatbot is a floating chat widget that provides personalized farming and financial advice to farmers. It uses Google Gemini AI and integrates with the farmer's profile data to offer context-aware recommendations.

---

## ✅ Features

### 1. **Floating Chat Widget**
- Appears on all pages when logged in as a farmer
- Green circular button in bottom-right corner
- Click to open full chat interface

### 2. **Personalized Advice**
- Context-aware responses based on:
  - Production data (crop, yield, acreage)
  - Financial background (income, loans, savings)
  - Risk score and category
  - Weather patterns and soil health

### 3. **Chat Features**
- Welcome message on first open
- Message history stored in Supabase
- Typing indicators
- Auto-scroll to latest message
- Responsive design

### 4. **AI Capabilities**
The chatbot can answer questions about:
- ✅ Crop yield improvement
- ✅ Risk score explanation
- ✅ Financial advice and loan tips
- ✅ Weather and planting guidance
- ✅ Market insights
- ✅ Best farming practices

---

## 📋 Setup Instructions

### Step 1: Run Database Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `supabase-chatbot-schema.sql`
3. Click **Run**

This creates:
- `farmer_chats` table
- Indexes for performance
- RLS policies for security

### Step 2: Verify Environment Variables

Ensure `.env.local` contains:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Step 3: Test the Chatbot

1. Start dev server: `npm run dev`
2. Log in as a farmer
3. Look for green chat button in bottom-right corner
4. Click to open chat
5. Try asking: "How can I improve my crop yield?"

---

## 🗄️ Database Schema

### `farmer_chats` Table

```sql
CREATE TABLE farmer_chats (
    id UUID PRIMARY KEY,
    farmer_id UUID REFERENCES farmers(id),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    topic TEXT,
    sentiment TEXT,
    created_at TIMESTAMPTZ
);
```

**Columns:**
- `id` - Unique message ID
- `farmer_id` - Links to farmer
- `message` - Farmer's question
- `response` - AI-generated response
- `topic` - Optional topic category
- `sentiment` - Optional sentiment analysis
- `created_at` - Timestamp

---

## 🧠 How It Works

### 1. **Message Flow**

```
User types message
    ↓
ChatbotService.sendMessage()
    ↓
Fetches farmer profile data
    ↓
Builds context prompt with:
  - Farm data
  - Financial status
  - Risk score
  - Production history
    ↓
Calls Gemini AI with context
    ↓
Returns personalized response
    ↓
Saves to database
    ↓
Displays in chat UI
```

### 2. **Context-Aware Prompts**

The AI receives a comprehensive prompt including:

**Basic Info:**
- Farmer name, location, farm type

**Production Data:**
- Crop type, acreage, yield estimates
- Rainfall patterns, soil health
- Annual expenses

**Financial Status:**
- Loan eligibility
- Repayment ability score
- Risk score

**Detailed Profile (if available):**
- Production profile history
- Financial background
- Savings behavior
- Repayment records

### 3. **AI Response Strategy**

The chatbot adapts advice based on risk level:

**Low Risk:**
- Encourages growth and investments
- Suggests expansion opportunities
- Promotes sustainable practices

**High Risk:**
- Focuses on saving tips
- Suggests input optimization
- Recommends insurance
- Provides debt management advice

**Weather Considerations:**
- Low rainfall → drought-resistant crops
- High rainfall → flood management
- Seasonal planting advice

---

## 💻 Code Structure

### Files Created

1. **`components/Chatbot.tsx`**
   - Main chat UI component
   - Floating widget interface
   - Message display and input
   - Integration with AppContext

2. **`services/chatbotService.ts`**
   - `sendMessage()` - Send message to AI
   - `getChatHistory()` - Fetch past conversations
   - `saveChatMessage()` - Save to database
   - `generateAIResponse()` - Call Gemini AI

3. **`supabase-chatbot-schema.sql`**
   - Database schema for chat storage

### Integration Points

- **App.tsx**: Chatbot rendered for all farmer users
- **AppContext**: Accesses `selectedFarmer` for context
- **farmerProfileService**: Fetches detailed profile data
- **geminiService**: Uses same Gemini client pattern

---

## 🎨 UI Features

### Chat Window
- **Header**: Green gradient with bot icon and name
- **Messages**: Alternating user (green) and AI (white) bubbles
- **Typing Indicator**: Animated dots while AI responds
- **Input**: Text field with send button
- **Welcome Message**: Helpful intro on first open

### Responsive Design
- Fixed position: Bottom-right corner
- Size: 384px width × 600px height
- Mobile-friendly: Scales appropriately
- Z-index: 50 (above most content)

---

## 🧪 Example Questions

Farmers can ask:
- "How can I improve my maize yield?"
- "Why did my risk score increase?"
- "What's the best time to plant this season?"
- "How can I reduce my expenses?"
- "What crops work best in my area?"
- "How do I qualify for a larger loan?"
- "Should I get crop insurance?"

---

## 🔧 Troubleshooting

### Chatbot Not Appearing

**Check:**
1. You're logged in as a farmer (not on landing page)
2. `selectedFarmer` is set in AppContext
3. No console errors

**Fix:**
- Check browser console for errors
- Verify farmer is loaded correctly
- Ensure userType is 'farmer'

### AI Not Responding

**Check:**
1. `VITE_GEMINI_API_KEY` is set in `.env.local`
2. API key is valid
3. Network tab shows API calls

**Fix:**
- Verify API key in environment variables
- Check Gemini API quota/limits
- Review error messages in console

### Messages Not Saving

**Check:**
1. `farmer_chats` table exists in Supabase
2. RLS policies are set correctly
3. Database connection is working

**Fix:**
- Run `supabase-chatbot-schema.sql` again
- Check Supabase connection
- Verify RLS policies allow inserts

### Chat History Not Loading

**Check:**
1. Messages exist in `farmer_chats` table
2. `farmer_id` matches selected farmer
3. No database errors

**Fix:**
- Check Supabase table directly
- Verify farmer ID is correct UUID
- Review RLS policy permissions

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Sentiment analysis for responses
- [ ] Topic categorization
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Chat export/download
- [ ] Suggested questions/pre-defined prompts
- [ ] Integration with weather API for real-time advice
- [ ] Link to relevant resources/documents
- [ ] Chat analytics dashboard

---

## 📝 Notes

- The chatbot uses the same Gemini API key as other AI features
- Chat history is stored per farmer
- Responses are generated in real-time (not cached)
- Each conversation is saved for future reference
- The AI provides advice but farmers should consult experts for major decisions

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Database schema created successfully
- [ ] Chatbot button appears in bottom-right
- [ ] Chat opens when clicked
- [ ] Welcome message displays
- [ ] Sending a message works
- [ ] AI response appears
- [ ] Message saves to database
- [ ] Chat history loads on reopen
- [ ] No console errors

---

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure database schema is run
4. Test with different questions
5. Review network requests in DevTools

For API-related issues, check Gemini API status and quota limits.

