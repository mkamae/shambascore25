CREATE TABLE IF NOT EXISTS plant_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    
    -- Image and crop info
    image_url TEXT NOT NULL,
    image_storage_path TEXT,
    crop_type TEXT,
    plant_part TEXT CHECK (plant_part IN ('leaf', 'fruit', 'stem', 'root', 'whole_plant', 'unknown')),
    
    -- Diagnosis results
    disease_name TEXT,
    disease_scientific_name TEXT,
    confidence_score NUMERIC(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
    severity TEXT CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    affected_stage TEXT,
    
    -- Analysis
    possible_causes TEXT[],
    symptoms_description TEXT,
    
    -- Treatment recommendations
    chemical_treatment TEXT,
    organic_treatment TEXT,
    preventive_measures TEXT,
    seek_agronomist BOOLEAN DEFAULT false,
    urgency_level TEXT CHECK (urgency_level IN ('Low', 'Medium', 'High', 'Urgent')),
    
    -- AI metadata
    ai_model_used TEXT DEFAULT 'gemini-2.5-flash',
    ai_analysis JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plant_diagnoses_farmer_id ON plant_diagnoses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_plant_diagnoses_crop_type ON plant_diagnoses(crop_type);
CREATE INDEX IF NOT EXISTS idx_plant_diagnoses_created_at ON plant_diagnoses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plant_diagnoses_disease_name ON plant_diagnoses(disease_name);

ALTER TABLE plant_diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own diagnoses" ON plant_diagnoses;
CREATE POLICY "Farmers can view their own diagnoses"
    ON plant_diagnoses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert their own diagnoses" ON plant_diagnoses;
CREATE POLICY "Farmers can insert their own diagnoses"
    ON plant_diagnoses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Farmers can update their own diagnoses" ON plant_diagnoses;
CREATE POLICY "Farmers can update their own diagnoses"
    ON plant_diagnoses FOR UPDATE USING (true) WITH CHECK (true);

COMMENT ON TABLE plant_diagnoses IS 'AI-powered plant disease diagnosis from uploaded images';

