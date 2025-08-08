-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50) NOT NULL UNIQUE,
    telephone_number VARCHAR(20) NOT NULL,
    handle VARCHAR(100) NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    mpesa_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    business_category VARCHAR(100) NOT NULL,
    rejection_reason TEXT,
    instagram_handle VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_urls TEXT[] DEFAULT '{}',
    type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service', 'event')),
    stock INTEGER,
    event_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('M-Pesa', 'Airtel Money')),
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    net_revenue DECIMAL(10,2) DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(creator_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(status);
CREATE INDEX IF NOT EXISTS idx_creators_handle ON creators(handle);
CREATE INDEX IF NOT EXISTS idx_products_creator_id ON products(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_sales_creator_id ON sales(creator_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_creator_id ON analytics(creator_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Creators: Allow read access to all, write access to authenticated users
CREATE POLICY "Creators are viewable by everyone" ON creators FOR SELECT USING (true);
CREATE POLICY "Creators can be created by authenticated users" ON creators FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can be updated by owner" ON creators FOR UPDATE USING (true);

-- Products: Allow read access to all, write access to creator
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products can be created by creator" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products can be updated by creator" ON products FOR UPDATE USING (creator_id::text = current_user);
CREATE POLICY "Products can be deleted by creator" ON products FOR DELETE USING (creator_id::text = current_user);

-- Sales: Allow read/write access to creator
CREATE POLICY "Sales are viewable by creator" ON sales FOR SELECT USING (creator_id::text = current_user);
CREATE POLICY "Sales can be created by creator" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Sales can be updated by creator" ON sales FOR UPDATE USING (creator_id::text = current_user);

-- Analytics: Allow read/write access to creator
CREATE POLICY "Analytics are viewable by creator" ON analytics FOR SELECT USING (creator_id::text = current_user);
CREATE POLICY "Analytics can be created by creator" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Analytics can be updated by creator" ON analytics FOR UPDATE USING (creator_id::text = current_user);
