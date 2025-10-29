# Plant Disease Diagnosis Setup Guide

## Overview

AI-powered plant disease diagnosis using Google Gemini AI to analyze uploaded photos and provide treatment recommendations.

---

## 🗄️ Database Setup

### Step 1: Run Plant Diagnosis Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste contents of `supabase-plant-diagnosis-schema.sql`
3. Click **Run**

This creates:
- `plant_diagnoses` table
- Indexes for performance
- RLS policies for security

### Step 2: Create Storage Bucket

1. In **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Or run `supabase-storage-plant-diagnoses.sql` in SQL Editor

**Bucket Settings:**
- Name: `plant-diagnoses`
- Public: ✅ Yes (for direct image access)
- File size limit: 10MB
- Allowed types: image/jpeg, image/png, image/webp

---

## 🔧 Configuration

### Environment Variables

The feature uses existing Gemini API key:
- `VITE_GEMINI_API_KEY` - Already configured

No additional API keys needed!

---

## 🎯 Features

### 1. **Image Upload & Capture**
- Upload images from device
- Capture photos directly with camera
- Preview before diagnosis
- Supports JPG, PNG, WebP (up to 10MB)

### 2. **AI-Powered Diagnosis**
- Uses Google Gemini 2.5 Flash with vision
- Analyzes plant images for diseases
- Provides disease name, scientific name, and confidence score
- Identifies severity and affected growth stage

### 3. **Treatment Recommendations**
- **Chemical Treatment**: Fungicides, pesticides with dosages
- **Organic Treatment**: Natural alternatives
- **Preventive Measures**: Long-term disease prevention
- **Agronomist Referral**: When expert consultation is needed

### 4. **Smart Analysis**
- Context-aware (uses crop type, plant part, location)
- Confidence scoring (0-100%)
- Urgency levels (Low, Medium, High, Urgent)
- Severity assessment (Low, Moderate, High, Critical)

### 5. **History Tracking**
- All diagnoses saved to database
- View past diagnoses
- Click to review previous results
- Track disease patterns over time

---

## 📸 How to Use

### For Farmers:

1. **Navigate** to "Plant Diagnosis" in sidebar
2. **Upload Image**:
   - Click "Choose File" to upload from device
   - OR click "Open Camera" to capture directly
3. **Add Context** (Optional):
   - Enter crop type (e.g., "Maize", "Coffee")
   - Select plant part (Leaf, Fruit, Stem, Root, Whole Plant)
4. **Diagnose**:
   - Click "🔍 Diagnose Plant Disease"
   - Wait for AI analysis (~5-10 seconds)
5. **Review Results**:
   - Disease identification
   - Treatment recommendations
   - Prevention tips
   - Expert consultation advice (if needed)

---

## 🧠 AI Analysis Process

### 1. Image Processing
```
Upload Image
    ↓
Convert to base64
    ↓
Send to Gemini AI with image + context
    ↓
AI analyzes visual symptoms
    ↓
Returns structured diagnosis
```

### 2. Diagnosis Output

The AI provides:
- **Disease Name**: Common and scientific names
- **Confidence Score**: How certain the diagnosis is (0-100%)
- **Severity**: Impact level (Low → Critical)
- **Symptoms**: Detailed description
- **Causes**: What might have caused it
- **Treatments**: Chemical and organic options
- **Prevention**: How to avoid in future
- **Referral**: When to see agronomist

### 3. Context-Aware Analysis

The AI considers:
- **Crop Type**: Specific diseases for that crop
- **Plant Part**: Different diseases affect different parts
- **Location**: Regional disease patterns (Kenya/East Africa)
- **Visual Symptoms**: From image analysis

---

## 📊 Database Schema

### `plant_diagnoses` Table

**Columns:**
- `id` - UUID primary key
- `farmer_id` - Links to farmer
- `image_url` - Image location (Supabase Storage or base64)
- `image_storage_path` - Storage path (if uploaded)
- `crop_type` - Crop being diagnosed
- `plant_part` - Which part of plant (leaf, fruit, stem, etc.)
- `disease_name` - Identified disease
- `disease_scientific_name` - Scientific/Latin name
- `confidence_score` - AI confidence (0-100)
- `severity` - Low, Moderate, High, Critical
- `affected_stage` - Growth stage affected
- `possible_causes` - Array of potential causes
- `symptoms_description` - Detailed symptoms
- `chemical_treatment` - Chemical solutions
- `organic_treatment` - Natural solutions
- `preventive_measures` - Prevention advice
- `seek_agronomist` - Boolean flag for expert referral
- `urgency_level` - Low, Medium, High, Urgent
- `ai_model_used` - Which AI model processed it
- `ai_analysis` - Full AI response (JSONB)
- `created_at`, `updated_at` - Timestamps

---

## 🎨 UI Features

### Main Interface
- **Image Preview**: Large preview before diagnosis
- **Crop Selection**: Dropdown for crop type
- **Plant Part Selection**: Radio/select for plant part
- **Camera Integration**: Direct camera access
- **Loading States**: Spinner during analysis
- **Error Handling**: Clear error messages

### Results Display
- **Severity Badges**: Color-coded severity indicators
- **Confidence Meter**: Visual confidence score
- **Treatment Cards**: Separated chemical/organic treatments
- **Urgency Alerts**: Prominent warnings for urgent cases
- **Agronomist Cards**: Special section for referral recommendations

### History View
- **Timeline**: Chronological list of past diagnoses
- **Quick Preview**: Thumbnail + key info
- **Click to Review**: Expand previous diagnoses
- **Filters**: By crop type, severity, date (future)

---

## 🔐 Security & Privacy

### Image Storage
- Images stored in Supabase Storage
- Public bucket for direct access
- Alternative: Base64 if storage fails
- 10MB file size limit

### Data Privacy
- Diagnoses linked to farmer ID
- RLS policies ensure data isolation
- Images only accessible to owner
- History not shared between farmers

---

## 🧪 Testing

### Test Cases

1. **Upload Image**:
   - Select JPG file → Preview shows → Diagnosis works

2. **Camera Capture**:
   - Click "Open Camera" → Grant permissions → Capture → Use image

3. **Diagnosis Flow**:
   - Upload image → Enter crop type → Diagnose → Results appear

4. **History**:
   - Complete diagnosis → Check history → See saved record

5. **Error Handling**:
   - Upload non-image file → Error message
   - Upload >10MB file → Error message
   - No internet → Error message

---

## 🚀 Production Considerations

### Image Optimization
- Consider resizing images before upload
- Compress images on client side
- Use WebP format when possible

### AI Improvements
- Fine-tune prompts based on feedback
- Add more crop-specific context
- Include regional disease database
- Implement confidence threshold warnings

### Performance
- Cache common diagnoses
- Batch image uploads
- Progressive image loading
- Lazy load history

---

## 📝 Example Workflow

### Scenario: Farmer notices yellow spots on maize leaves

1. **Upload Photo**: Farmer takes photo of affected leaves
2. **Add Context**: Selects "Maize" and "Leaf"
3. **AI Analysis**: 
   - Disease: "Northern Corn Leaf Blight"
   - Confidence: 87%
   - Severity: High
4. **Treatment Recommendation**:
   - Chemical: Specific fungicide with dosage
   - Organic: Neem oil application
   - Prevention: Crop rotation, resistant varieties
5. **Agronomist Referral**: Recommended due to High severity
6. **Save**: Diagnosis saved to history for future reference

---

## 🔄 Integration with Other Features

### Future Connections:
- **Risk Profile**: Poor plant health → Higher risk score
- **Insurance**: Disease outbreaks → Insurance claims
- **Farm Health**: Diagnoses → Satellite health correlation
- **Chatbot**: Ask questions about diagnosis results
- **Weather**: Disease risk based on weather patterns

---

## 📚 Documentation Files

- **PLANT_DIAGNOSIS_SETUP.md** (this file) - Setup guide
- **supabase-plant-diagnosis-schema.sql** - Database schema
- **supabase-storage-plant-diagnoses.sql** - Storage setup

---

## ✅ Verification Checklist

After setup:
- [ ] Database schema run successfully
- [ ] Storage bucket created
- [ ] Component visible in sidebar
- [ ] Image upload works
- [ ] Camera capture works (on mobile/tablet)
- [ ] Diagnosis returns results
- [ ] Results display correctly
- [ ] Diagnosis saves to database
- [ ] History loads correctly
- [ ] No console errors

---

## 🆘 Troubleshooting

### "Failed to diagnose plant"

**Check:**
1. Gemini API key is set
2. Image is valid format
3. Image size < 10MB
4. Network connection stable

**Fix:**
- Verify `.env.local` has `VITE_GEMINI_API_KEY`
- Check browser console for errors
- Try smaller image size

### "Could not access camera"

**Check:**
1. Browser permissions granted
2. HTTPS connection (required for camera)
3. Camera not used by another app

**Fix:**
- Use HTTPS (required for getUserMedia)
- Grant camera permissions in browser
- Close other apps using camera

### Images not uploading

**Check:**
1. Storage bucket exists
2. RLS policies allow upload
3. File size < 10MB

**Fix:**
- Run `supabase-storage-plant-diagnoses.sql`
- Check Storage policies in Supabase
- Verify bucket is public

---

## Summary

The Plant Disease Diagnosis feature provides:
- ✅ AI-powered disease detection
- ✅ Image upload and camera capture
- ✅ Treatment recommendations
- ✅ Expert consultation guidance
- ✅ Diagnosis history tracking
- ✅ Beautiful, user-friendly interface

All powered by Google Gemini AI with vision capabilities!

