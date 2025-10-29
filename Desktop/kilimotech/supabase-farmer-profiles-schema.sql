-- Farmer Profiles and Risk Analysis Schema
-- Run this in your Supabase SQL Editor to create the FarmerProfiles table

-- Create farmer_profiles table
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Production Profile (JSON)
    production_profile JSONB NOT NULL DEFAULT '{}',
    
    -- Financial Background (JSON)
    financial_background JSONB NOT NULL DEFAULT '{}',
    
    -- Behavioral Background (JSON)
    behavioral_background JSONB NOT NULL DEFAULT '{}',
    
    -- Risk Analysis
    risk_score NUMERIC(5, 2) DEFAULT 0.0 CHECK (risk_score >= 0 AND risk_score <= 1),
    risk_category TEXT CHECK (risk_category IN ('Low', 'Medium', 'High')),
    
    -- SMS Contact (for future SMS notifications)
    phone_number TEXT,
    
    -- Unique constraint: one profile per farmer
    UNIQUE(farmer_id)
);

-- Create index on farmer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_farmer_id ON farmer_profiles(farmer_id);

-- Create index on risk_category for filtering
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_risk_category ON farmer_profiles(risk_category);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_farmer_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_farmer_profiles_updated_at ON farmer_profiles;
CREATE TRIGGER trigger_update_farmer_profiles_updated_at
    BEFORE UPDATE ON farmer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_farmer_profiles_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Farmers can view and update their own profile
CREATE POLICY "Farmers can view their own profile"
    ON farmer_profiles
    FOR SELECT
    USING (auth.uid()::text = farmer_id::text OR true); -- For now, allow all reads (adjust based on your auth setup)

CREATE POLICY "Farmers can insert their own profile"
    ON farmer_profiles
    FOR INSERT
    WITH CHECK (true); -- Adjust based on your auth setup

CREATE POLICY "Farmers can update their own profile"
    ON farmer_profiles
    FOR UPDATE
    USING (true) -- Adjust based on your auth setup
    WITH CHECK (true);

-- Sample JSON structure documentation (stored as comments)
-- production_profile: {
--   "cropTypes": ["Maize", "Beans"],
--   "acreage": 5.0,
--   "yieldHistory": [
--     {"year": 2023, "yield": 3.5, "crop": "Maize"},
--     {"year": 2022, "yield": 3.2, "crop": "Maize"}
--   ],
--   "inputCosts": {
--     "seeds": 15000,
--     "fertilizer": 25000,
--     "pesticides": 8000,
--     "labor": 30000
--   },
--   "seasonality": {
--     "primarySeason": "Long Rains",
--     "secondarySeason": "Short Rains"
--   }
-- }

-- financial_background: {
--   "incomeSources": ["Crop Sales", "Livestock", "Off-farm"],
--   "monthlyIncome": 50000,
--   "pastLoans": [
--     {"year": 2022, "amount": 50000, "repaid": true, "onTime": true}
--   ],
--   "savingsBehavior": "Regular",
--   "repaymentRecord": "Excellent",
--   "bankAccount": true,
--   "mpesaUsage": "High"
-- }

-- behavioral_background: {
--   "dataUpdateFrequency": "Weekly",
--   "lastUpdateDate": "2024-01-15",
--   "timelinessScore": 0.9,
--   "trainingParticipation": ["Climate Smart", "Financial Literacy"],
--   "advisoryEngagement": "High",
--   "appUsageFrequency": "Daily",
--   "profileCompleteness": 0.85
-- }

COMMENT ON TABLE farmer_profiles IS 'Stores comprehensive farmer profiles for risk assessment and credit access';
COMMENT ON COLUMN farmer_profiles.production_profile IS 'JSON containing crop types, acreage, yield history, input costs, seasonality';
COMMENT ON COLUMN farmer_profiles.financial_background IS 'JSON containing income sources, loan history, savings, repayment records';
COMMENT ON COLUMN farmer_profiles.behavioral_background IS 'JSON containing data update frequency, training participation, engagement metrics';
COMMENT ON COLUMN farmer_profiles.risk_score IS 'Calculated risk score (0-1), where lower is better';
COMMENT ON COLUMN farmer_profiles.risk_category IS 'Risk category: Low (<=0.3), Medium (0.3-0.7), High (>=0.7)';
COMMENT ON COLUMN farmer_profiles.phone_number IS 'Phone number for SMS notifications (future integration with Twilio/Africa''s Talking)';

