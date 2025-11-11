-- JVA Designs Portfolio - Complete Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Table (Simple view tracking)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'click', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category_id);
CREATE INDEX IF NOT EXISTS idx_collections_published ON collections(is_published);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_analytics_collection ON analytics(collection_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for collections updated_at
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('theme', '{"gridSpacing": 16, "animationSpeed": 300}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, "order") VALUES
  ('Residential', 'residential', 1),
  ('Commercial', 'commercial', 2),
  ('Institutional', 'institutional', 3),
  ('Urban Planning', 'urban-planning', 4)
ON CONFLICT (slug) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published collections" ON collections
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public can view settings" ON settings
  FOR SELECT USING (true);

-- Authenticated users (admins) have full access
CREATE POLICY "Authenticated users have full access to collections" ON collections
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to analytics" ON analytics
  FOR ALL USING (auth.role() = 'authenticated');

-- Service role can insert analytics
CREATE POLICY "Service role can insert analytics" ON analytics
  FOR INSERT WITH CHECK (true);

-- Storage bucket will be created manually or via dashboard
-- Bucket name: portfolio-images
-- Public access: Enabled
-- File size limit: 50MB (recommended)
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policies (run these after creating the bucket)
-- CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-images');
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
