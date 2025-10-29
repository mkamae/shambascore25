# 👤 Farmer Profile & Risk Insight Feature

## Overview

The Farmer Profile and Risk Insight feature helps farmers build comprehensive profiles that determine their access to fair credit terms and tailored advisory services. Farmers with better profiles get lower interest rates and better loan terms.

---

## 🎯 Key Features

### 1. **Comprehensive Profile Management**
- **Production Profile:** Crop types, acreage, yield history, input costs, seasonality
- **Financial Background:** Income sources, loan history, savings behavior, repayment records
- **Behavioral Background:** Data update frequency, training participation, engagement metrics

### 2. **Automated Risk Assessment**
- Risk score calculated using weighted factors:
  - Production stability (30%)
  - Financial health (40%)
  - Behavioral consistency (30%)
- Risk categories: Low, Medium, High
- Real-time updates as farmers enter data

### 3. **Credit Access Determination**
- **Low Risk:** 8-12% interest rates, KES 100,000-500,000 loans
- **Medium Risk:** 12-18% interest rates, KES 50,000-200,000 loans
- **High Risk:** 18-24% interest rates, KES 20,000-100,000 loans

### 4. **Personalized Insights & Recommendations**
- Credit eligibility messages
- Actionable recommendations to improve profile
- Benefits showcase (what they qualify for)
- Connection to future SMS notifications

---

## 📊 Database Setup

### Run SQL Schema

Execute `supabase-farmer-profiles-schema.sql` in your Supabase SQL Editor:

```sql
-- Creates farmer_profiles table with:
-- - JSONB columns for flexible data storage
-- - Risk score and category fields
-- - Automatic timestamp updates
-- - Row Level Security (RLS) policies
```

### Table Structure

```sql
farmer_profiles
├── id (UUID)
├── farmer_id (UUID, references farmers)
├── production_profile (JSONB)
├── financial_background (JSONB)
├── behavioral_background (JSONB)
├── risk_score (NUMERIC 0-1)
├── risk_category (Low/Medium/High)
├── phone_number (TEXT, for SMS)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

---

## 🔧 Risk Calculation Model

### Formula

```typescript
Risk Score = 1 - (
  Production Score × 0.3 +
  Financial Score × 0.4 +
  Behavioral Score × 0.3
)
```

**Lower risk score = Better credit terms**

### Production Score Factors (30% weight)
- Yield stability (variation in historical yields)
- Crop diversification
- Input cost efficiency

### Financial Score Factors (40% weight)
- Repayment record (Poor/Fair/Good/Excellent)
- Past loan history (repayment rate, on-time rate)
- Savings behavior
- Financial infrastructure (bank account, M-Pesa usage)

### Behavioral Score Factors (30% weight)
- Data update frequency
- Timeliness score
- Training participation
- Advisory engagement level

### Risk Categories

| Score Range | Category | Interest Rate | Loan Range |
|-------------|----------|---------------|------------|
| 0.0 - 0.3   | Low      | 8-12%         | KES 100k-500k |
| 0.3 - 0.7   | Medium   | 12-18%        | KES 50k-200k |
| 0.7 - 1.0   | High     | 18-24%        | KES 20k-100k |

---

## 🎨 UI Components

### Main Component: `FarmerProfile.tsx`

**Sections:**
1. **Overview Tab**
   - Risk score display
   - Credit terms showcase
   - Benefits list
   - Recommendations
   - SMS notification placeholder

2. **Production Tab**
   - Crop type selection
   - Acreage input
   - Yield history management
   - Input costs breakdown
   - Seasonality settings

3. **Financial Tab**
   - Income sources selection
   - Monthly income
   - Past loan records
   - Savings behavior
   - Repayment record
   - Financial infrastructure

4. **Behavioral Tab**
   - Data update frequency
   - Timeliness score (slider)
   - Training participation checklist
   - Advisory engagement level
   - App usage frequency
   - Profile completeness

---

## 🔌 Integration Points

### 1. **Credit Simulator**
The risk score can be integrated with `CreditSimulator` component to show personalized loan terms.

**Future Integration:**
```typescript
// In CreditSimulator.tsx
import { fetchFarmerProfile } from '../services/farmerProfileService';

const profile = await fetchFarmerProfile(farmer.id);
const interestRate = profile.riskCategory === 'Low' ? 10 : 
                     profile.riskCategory === 'Medium' ? 15 : 20;
```

### 2. **SMS Notifications (Placeholder)**

The profile stores `phone_number` for future SMS integration:

**Twilio Integration (Future):**
```typescript
// services/smsService.ts (to be created)
import { Twilio } from 'twilio';

export async function sendRiskAlert(farmerId: string, message: string) {
  const profile = await fetchFarmerProfile(farmerId);
  // Send SMS via Twilio or Africa's Talking
}
```

**Africa's Talking Integration (Future):**
```typescript
// Alternative SMS provider for East Africa
import { AfricasTalking } from '@africastalking/africastalking';

export async function sendFarmingTip(farmerId: string) {
  // Send localized SMS in Swahili/English
}
```

### 3. **AI Insights Integration**

Risk profile data can enhance AI insights:

```typescript
// In geminiService.ts (future enhancement)
const riskInsights = await getRiskInsights(farmer.id);
// Include risk category in AI prompt for tailored advice
```

---

## 📱 SMS Integration Roadmap

### Supported Services

1. **Twilio** (International)
   - Easy integration
   - Good documentation
   - Pay-as-you-go pricing

2. **Africa's Talking** (East Africa focused)
   - Local support
   - Competitive rates in Kenya
   - Good for Swahili/English messaging

### SMS Use Cases

- **Weather Alerts:** Extreme weather warnings
- **Payment Reminders:** Loan payment due dates
- **Market Prices:** Crop price updates
- **Training Sessions:** Upcoming training notifications
- **Farming Tips:** Seasonal advice based on risk profile

### Implementation Steps (Future)

1. Add SMS service keys to `.env.local`:
```env
VITE_TWILIO_ACCOUNT_SID=your_sid
VITE_TWILIO_AUTH_TOKEN=your_token
# OR
VITE_AFRICASTALKING_API_KEY=your_key
```

2. Create `services/smsService.ts`
3. Add SMS functions to `farmerProfileService.ts`
4. Create notification triggers based on risk category

---

## 🔐 Security & RLS Policies

### Row Level Security

The schema includes RLS policies allowing:
- ✅ Farmers can view their own profile
- ✅ Farmers can insert their own profile
- ✅ Farmers can update their own profile

**Adjust based on your auth setup:**
- Replace `auth.uid()` checks with your authentication system
- Modify policies to match your access control needs

---

## 📊 Usage Example

### For Farmers:

1. **Navigate to Profile Tab**
   - Click "Profile" in the main navigation

2. **Complete Production Profile**
   - Select crop types
   - Enter acreage
   - Add yield history
   - Input costs

3. **Complete Financial Background**
   - Select income sources
   - Enter monthly income
   - Add past loan records
   - Select savings behavior

4. **Complete Behavioral Background**
   - Set update frequency
   - Participate in trainings
   - Set engagement level

5. **View Risk Score & Benefits**
   - See calculated risk score
   - View credit terms you qualify for
   - Read recommendations to improve

6. **Save Profile**
   - All data saved to Supabase
   - Risk score recalculated automatically
   - Insights generated instantly

---

## 🚀 Future Enhancements

### Phase 1 (Current)
- ✅ Profile data collection
- ✅ Risk score calculation
- ✅ UI components
- ✅ Database schema

### Phase 2 (Future)
- [ ] Real-time SMS notifications
- [ ] Integration with credit products
- [ ] Profile improvement tracking
- [ ] Comparative analytics (farmer vs. region averages)

### Phase 3 (Advanced)
- [ ] Machine learning model for risk prediction
- [ ] Dynamic interest rate calculation
- [ ] Automated financial product recommendations
- [ ] Multi-factor risk assessment

---

## 📋 API Reference

### Services

#### `farmerProfileService.ts`

```typescript
// Fetch profile
const profile = await fetchFarmerProfile(farmerId);

// Save/update profile
const saved = await saveFarmerProfile(
  farmerId,
  productionProfile,
  financialBackground,
  behavioralBackground,
  phoneNumber
);

// Get risk insights
const insights = await getRiskInsights(farmerId);
```

#### `riskCalculator.ts`

```typescript
// Calculate risk score
const score = calculateRiskScore(production, financial, behavioral);

// Get category
const category = getRiskCategory(score);

// Generate insights
const insights = generateRiskInsights(score, category, production, financial, behavioral);
```

---

## ✅ Testing Checklist

### Database
- [ ] Run `supabase-farmer-profiles-schema.sql`
- [ ] Verify table created
- [ ] Test RLS policies

### Frontend
- [ ] Navigate to Profile tab
- [ ] Fill production profile form
- [ ] Fill financial background form
- [ ] Fill behavioral background form
- [ ] Verify risk score updates
- [ ] Verify insights display correctly
- [ ] Test save functionality

### Integration
- [ ] Risk score updates in real-time
- [ ] Data persists after refresh
- [ ] Profile loads existing data
- [ ] Phone number stored correctly

---

## 🎯 Key Benefits

### For Farmers:
- ✅ **Fair Credit Access:** Transparent risk assessment
- ✅ **Better Terms:** Lower risk = better rates
- ✅ **Actionable Insights:** Clear path to improvement
- ✅ **Financial Inclusion:** Access to credit products

### For Platform:
- ✅ **Risk Management:** Identify creditworthy farmers
- ✅ **Product Matching:** Match farmers to suitable loans
- ✅ **Data Insights:** Understand farmer behavior
- ✅ **Scalable Model:** Easy to extend with ML

---

## 📞 Support & Documentation

### Related Files:
- `supabase-farmer-profiles-schema.sql` - Database schema
- `services/farmerProfileService.ts` - Profile CRUD operations
- `services/riskCalculator.ts` - Risk calculation logic
- `components/FarmerProfile.tsx` - Main UI component
- `types.ts` - TypeScript type definitions

### Next Steps:
1. Run database schema in Supabase
2. Test profile creation
3. Verify risk calculations
4. Plan SMS integration
5. Connect to credit products

---

**Your Farmer Profile feature is ready to help farmers access fair credit!** 🌾💰

