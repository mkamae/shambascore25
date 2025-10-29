-- Create Storage Bucket for Plant Diagnosis Images
-- Run this in Supabase SQL Editor after creating the plant_diagnoses table

-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'plant-diagnoses',
    'plant-diagnoses',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Allow authenticated users to upload
CREATE POLICY "Farmers can upload diagnosis images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'plant-diagnoses');

CREATE POLICY "Farmers can view diagnosis images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'plant-diagnoses');

CREATE POLICY "Farmers can delete their own diagnosis images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'plant-diagnoses');

