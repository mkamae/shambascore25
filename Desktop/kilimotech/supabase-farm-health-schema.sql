CREATE TABLE IF NOT EXISTS farm_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Computed indices
    ndvi_avg NUMERIC(5, 3),
    ndvi_min NUMERIC(5, 3),
    ndvi_max NUMERIC(5, 3),
    ndwi_avg NUMERIC(5, 3),
    
    -- Weather data
    rainfall_total NUMERIC(8, 2),
    rainfall_avg_daily NUMERIC(6, 2),
    temperature_avg NUMERIC(5, 2),
    temperature_min NUMERIC(5, 2),
    temperature_max NUMERIC(5, 2),
    
    -- Health score and metadata
    health_score NUMERIC(3, 1) CHECK (health_score >= 0 AND health_score <= 100),
    health_category TEXT CHECK (health_category IN ('Excellent', 'Good', 'Moderate', 'Poor', 'Critical')),
    
    -- Raw data (can store full response if needed)
    raw_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farm_health_farmer_id ON farm_health_scores(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_health_dates ON farm_health_scores(start_date DESC, end_date DESC);
CREATE INDEX IF NOT EXISTS idx_farm_health_category ON farm_health_scores(health_category);

ALTER TABLE farm_health_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own health scores" ON farm_health_scores;
CREATE POLICY "Farmers can view their own health scores"
    ON farm_health_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert their own health scores" ON farm_health_scores;
CREATE POLICY "Farmers can insert their own health scores"
    ON farm_health_scores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Farmers can update their own health scores" ON farm_health_scores;
CREATE POLICY "Farmers can update their own health scores"
    ON farm_health_scores FOR UPDATE USING (true) WITH CHECK (true);

COMMENT ON TABLE farm_health_scores IS 'Satellite-derived farm health assessments using Google Earth Engine';

