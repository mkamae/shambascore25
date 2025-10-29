-- KilimoTech Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create the tables

-- Create farmers table
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    farm_type TEXT NOT NULL
);

-- Create farm_data table
CREATE TABLE IF NOT EXISTS farm_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    crop_type TEXT NOT NULL,
    acreage NUMERIC NOT NULL,
    yield_estimate NUMERIC NOT NULL,
    annual_expenses NUMERIC NOT NULL,
    rainfall TEXT NOT NULL CHECK (rainfall IN ('Low', 'Average', 'High')),
    soil_health TEXT NOT NULL CHECK (soil_health IN ('Poor', 'Average', 'Good'))
);

-- Create credit_profiles table
CREATE TABLE IF NOT EXISTS credit_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    loan_eligibility NUMERIC NOT NULL,
    repayment_ability_score NUMERIC NOT NULL,
    risk_score NUMERIC NOT NULL,
    summary TEXT
);

-- Create insurance table
CREATE TABLE IF NOT EXISTS insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive'))
);

-- Create mpesa_statements table
CREATE TABLE IF NOT EXISTS mpesa_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    file_name TEXT NOT NULL,
    upload_date TEXT NOT NULL
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    yield_advice TEXT NOT NULL,
    risk_advice TEXT NOT NULL,
    loan_advice TEXT NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_farm_data_farmer_id ON farm_data(farmer_id);
CREATE INDEX IF NOT EXISTS idx_credit_profiles_farmer_id ON credit_profiles(farmer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_farmer_id ON insurance(farmer_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_statements_farmer_id ON mpesa_statements(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_farmer_id ON ai_insights(farmer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpesa_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust these based on your security needs)
-- For now, allowing all operations for development

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on farmers" ON farmers;
DROP POLICY IF EXISTS "Allow all operations on farm_data" ON farm_data;
DROP POLICY IF EXISTS "Allow all operations on credit_profiles" ON credit_profiles;
DROP POLICY IF EXISTS "Allow all operations on insurance" ON insurance;
DROP POLICY IF EXISTS "Allow all operations on mpesa_statements" ON mpesa_statements;
DROP POLICY IF EXISTS "Allow all operations on ai_insights" ON ai_insights;

-- Create new policies
CREATE POLICY "Allow all operations on farmers" ON farmers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on farm_data" ON farm_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on credit_profiles" ON credit_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on insurance" ON insurance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on mpesa_statements" ON mpesa_statements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_insights" ON ai_insights FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data (IDs will be auto-generated as UUIDs)
-- First, insert farmers and get their IDs
DO $$
DECLARE
    farmer1_id UUID;
    farmer2_id UUID;
    farmer3_id UUID;
BEGIN
    -- Insert farmer 1
    INSERT INTO farmers (name, phone, location, farm_type) 
    VALUES ('John Kamau', '+254712345678', 'Nairobi', 'Mixed Farming')
    RETURNING id INTO farmer1_id;
    
    -- Insert farmer 2
    INSERT INTO farmers (name, phone, location, farm_type) 
    VALUES ('Mary Wanjiku', '+254723456789', 'Kiambu', 'Dairy Farming')
    RETURNING id INTO farmer2_id;
    
    -- Insert farmer 3
    INSERT INTO farmers (name, phone, location, farm_type) 
    VALUES ('Peter Omondi', '+254734567890', 'Kisumu', 'Maize Farming')
    RETURNING id INTO farmer3_id;
    
    -- Insert farm data for farmer 1
    INSERT INTO farm_data (farmer_id, crop_type, acreage, yield_estimate, annual_expenses, rainfall, soil_health) 
    VALUES (farmer1_id, 'Maize', 5, 2.5, 150000, 'Average', 'Good');
    
    -- Insert farm data for farmer 2
    INSERT INTO farm_data (farmer_id, crop_type, acreage, yield_estimate, annual_expenses, rainfall, soil_health) 
    VALUES (farmer2_id, 'Coffee', 3, 1.8, 120000, 'High', 'Good');
    
    -- Insert farm data for farmer 3
    INSERT INTO farm_data (farmer_id, crop_type, acreage, yield_estimate, annual_expenses, rainfall, soil_health) 
    VALUES (farmer3_id, 'Maize', 8, 2.0, 200000, 'Average', 'Average');
    
    -- Insert credit profiles
    INSERT INTO credit_profiles (farmer_id, loan_eligibility, repayment_ability_score, risk_score, summary) 
    VALUES (farmer1_id, 200000, 75, 25, 'Good credit standing with consistent repayment history');
    
    INSERT INTO credit_profiles (farmer_id, loan_eligibility, repayment_ability_score, risk_score, summary) 
    VALUES (farmer2_id, 150000, 68, 32, 'Moderate credit profile, room for improvement');
    
    INSERT INTO credit_profiles (farmer_id, loan_eligibility, repayment_ability_score, risk_score, summary) 
    VALUES (farmer3_id, 250000, 82, 18, 'Excellent credit standing');
    
    -- Insert insurance records
    INSERT INTO insurance (farmer_id, status) VALUES (farmer1_id, 'Active');
    INSERT INTO insurance (farmer_id, status) VALUES (farmer2_id, 'Inactive');
    INSERT INTO insurance (farmer_id, status) VALUES (farmer3_id, 'Active');
    
    RAISE NOTICE 'Sample data inserted successfully!';
END $$;

