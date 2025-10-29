CREATE TABLE IF NOT EXISTS farmer_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    topic TEXT,
    sentiment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmer_chats_farmer_id ON farmer_chats(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_chats_created_at ON farmer_chats(created_at DESC);

ALTER TABLE farmer_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own chats" ON farmer_chats;
CREATE POLICY "Farmers can view their own chats"
    ON farmer_chats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Farmers can insert their own chats" ON farmer_chats;
CREATE POLICY "Farmers can insert their own chats"
    ON farmer_chats FOR INSERT WITH CHECK (true);

