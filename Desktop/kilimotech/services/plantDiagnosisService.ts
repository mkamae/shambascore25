/**
 * Plant Diagnosis Service
 * 
 * Handles AI-powered plant disease diagnosis from images
 * Uses Google Gemini AI for image analysis and disease detection
 */

/**
 * Plant Diagnosis Service - Frontend Client
 * 
 * This service now calls secure backend API routes instead of using API keys directly.
 * The API key is stored server-side for security.
 */

import { supabase } from './supabaseClient';

export interface PlantDiagnosis {
    id: string;
    farmerId: string;
    imageUrl: string;
    imageStoragePath?: string;
    cropType?: string;
    plantPart: 'leaf' | 'fruit' | 'stem' | 'root' | 'whole_plant' | 'unknown';
    diseaseName?: string;
    diseaseScientificName?: string;
    confidenceScore: number;
    severity: 'Low' | 'Moderate' | 'High' | 'Critical';
    affectedStage?: string;
    possibleCauses: string[];
    symptomsDescription?: string;
    chemicalTreatment?: string;
    organicTreatment?: string;
    preventiveMeasures?: string;
    seekAgronomist: boolean;
    urgencyLevel: 'Low' | 'Medium' | 'High' | 'Urgent';
    aiModelUsed: string;
    aiAnalysis: any;
    createdAt: string;
    updatedAt: string;
}

export interface DiagnosisRequest {
    imageFile: File | Blob;
    imageUrl: string;
    cropType?: string;
    plantPart?: 'leaf' | 'fruit' | 'stem' | 'root' | 'whole_plant';
    farmerLocation?: string;
}

export interface DiagnosisResult {
    diseaseName: string;
    diseaseScientificName?: string;
    confidenceScore: number;
    severity: 'Low' | 'Moderate' | 'High' | 'Critical';
    affectedStage?: string;
    possibleCauses: string[];
    symptomsDescription: string;
    chemicalTreatment?: string;
    organicTreatment?: string;
    preventiveMeasures: string;
    seekAgronomist: boolean;
    urgencyLevel: 'Low' | 'Medium' | 'High' | 'Urgent';
    additionalNotes?: string;
}

// Removed: Gemini client initialization now handled server-side

/**
 * Convert image file to base64 for AI processing
 */
function fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Remove data URL prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Analyze plant image for disease diagnosis via secure backend API
 */
export async function diagnosePlantImage(
    request: DiagnosisRequest
): Promise<DiagnosisResult> {
    try {
        // Convert image to base64
        const imageBase64 = await fileToBase64(request.imageFile);

        // Call secure backend API
        const response = await fetch('/api/gemini/plant-diagnosis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageBase64,
                imageMimeType: request.imageFile.type || 'image/jpeg',
                cropType: request.cropType,
                plantPart: request.plantPart,
                farmerLocation: request.farmerLocation
            })
        });

        if (!response.ok) {
            // Provide helpful message for 404 in development
            if (response.status === 404 && import.meta.env.DEV) {
                throw new Error('API route not found. In local development, use `npm run dev:api` or `vercel dev` to enable API routes. Regular `npm run dev` does not support API routes.');
            }
            const error = await response.json().catch(() => ({ error: 'Failed to diagnose plant' }));
            if (response.status === 500 && typeof error.error === 'string' && error.error.includes('GEMINI_API_KEY')) {
                throw new Error('Server AI key missing. Set GEMINI_API_KEY in your .env (local) and Vercel project variables.');
            }
            throw new Error(error.error || 'Failed to diagnose plant image');
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Invalid response from AI service');
        }

        return result.data as DiagnosisResult;
    } catch (error: any) {
        console.error('Error in diagnosePlantImage:', error);
        throw new Error(error.message || 'Failed to diagnose plant image. Please try again.');
    }
}

/**
 * Build context-aware prompt for disease diagnosis
 */
function buildDiagnosisPrompt(request: DiagnosisRequest): string {
    let prompt = `You are an expert agricultural pathologist specializing in crop diseases in Kenya and East Africa.

Analyze this plant image and provide a detailed disease diagnosis in the following JSON format:

{
  "diseaseName": "Common name of the disease",
  "diseaseScientificName": "Scientific/Latin name if known",
  "confidenceScore": 85,
  "severity": "Low|Moderate|High|Critical",
  "affectedStage": "Growth stage affected (e.g., 'Early Growth', 'Flowering', 'Fruiting')",
  "possibleCauses": ["Cause 1", "Cause 2"],
  "symptomsDescription": "Detailed description of visible symptoms",
  "chemicalTreatment": "Recommended chemical fungicides/pesticides with dosage (if needed)",
  "organicTreatment": "Natural/organic treatment options",
  "preventiveMeasures": "How to prevent this disease in future",
  "seekAgronomist": true/false,
  "urgencyLevel": "Low|Medium|High|Urgent",
  "additionalNotes": "Any additional important information"
}

Guidelines:
- Be specific and accurate. If uncertain, indicate lower confidence.
- Consider common diseases in Kenya: Maize Lethal Necrosis, Coffee Berry Disease, Banana Xanthomonas Wilt, etc.
- Provide practical, locally available treatment options.
- Recommend seeking an agronomist if disease is severe, unknown, or spreading rapidly.
- Consider the crop type and plant part when diagnosing.
- Urgency: Critical/High if disease can cause total crop loss or spreads quickly.

`;

    if (request.cropType) {
        prompt += `\nCrop Type: ${request.cropType}\n`;
    }

    if (request.plantPart) {
        prompt += `Plant Part: ${request.plantPart}\n`;
    }

    if (request.farmerLocation) {
        prompt += `Location: ${request.farmerLocation} (consider local disease patterns)\n`;
    }

    prompt += `\nNow analyze the image and provide the diagnosis in the JSON format above.`;

    return prompt;
}

/**
 * Parse AI response into structured diagnosis result
 */
function parseDiagnosisResponse(
    aiResponse: string,
    request: DiagnosisRequest
): DiagnosisResult {
    try {
        // Try to extract JSON from response
        let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            // If no JSON found, create structured response from text
            return createFallbackDiagnosis(aiResponse, request);
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
            diseaseName: parsed.diseaseName || 'Unidentified Disease',
            diseaseScientificName: parsed.diseaseScientificName,
            confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore || 50)),
            severity: parsed.severity || 'Moderate',
            affectedStage: parsed.affectedStage,
            possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
            symptomsDescription: parsed.symptomsDescription || aiResponse.substring(0, 200),
            chemicalTreatment: parsed.chemicalTreatment,
            organicTreatment: parsed.organicTreatment,
            preventiveMeasures: parsed.preventiveMeasures || 'Continue monitoring and maintain good agricultural practices.',
            seekAgronomist: parsed.seekAgronomist !== undefined ? parsed.seekAgronomist : parsed.severity === 'High' || parsed.severity === 'Critical',
            urgencyLevel: parsed.urgencyLevel || (parsed.severity === 'Critical' ? 'Urgent' : 'Medium'),
            additionalNotes: parsed.additionalNotes
        };
    } catch (error) {
        console.error('Error parsing diagnosis response:', error);
        return createFallbackDiagnosis(aiResponse, request);
    }
}

/**
 * Create fallback diagnosis if JSON parsing fails
 */
function createFallbackDiagnosis(
    aiResponse: string,
    request: DiagnosisRequest
): DiagnosisResult {
    // Extract key information from text response
    const lowerResponse = aiResponse.toLowerCase();
    
    let severity: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate';
    if (lowerResponse.includes('critical') || lowerResponse.includes('severe')) {
        severity = 'Critical';
    } else if (lowerResponse.includes('high') || lowerResponse.includes('serious')) {
        severity = 'High';
    } else if (lowerResponse.includes('mild') || lowerResponse.includes('low')) {
        severity = 'Low';
    }
    
    let urgencyLevel: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium';
    if (severity === 'Critical' || severity === 'High') {
        urgencyLevel = 'Urgent';
    }
    
    return {
        diseaseName: 'Analysis In Progress',
        confidenceScore: 60,
        severity,
        possibleCauses: [],
        symptomsDescription: aiResponse.substring(0, 300),
        preventiveMeasures: 'Please consult with an agronomist for detailed diagnosis and treatment plan.',
        seekAgronomist: true,
        urgencyLevel
    };
}

/**
 * Save diagnosis to Supabase
 */
export async function saveDiagnosis(
    farmerId: string,
    diagnosis: DiagnosisResult,
    request: DiagnosisRequest,
    storagePath?: string
): Promise<PlantDiagnosis | null> {
    try {
        const { data, error } = await supabase
            .from('plant_diagnoses')
            .insert({
                farmer_id: farmerId,
                image_url: request.imageUrl,
                image_storage_path: storagePath,
                crop_type: request.cropType || null,
                plant_part: request.plantPart || 'unknown',
                disease_name: diagnosis.diseaseName,
                disease_scientific_name: diagnosis.diseaseScientificName || null,
                confidence_score: diagnosis.confidenceScore,
                severity: diagnosis.severity,
                affected_stage: diagnosis.affectedStage || null,
                possible_causes: diagnosis.possibleCauses,
                symptoms_description: diagnosis.symptomsDescription || null,
                chemical_treatment: diagnosis.chemicalTreatment || null,
                organic_treatment: diagnosis.organicTreatment || null,
                preventive_measures: diagnosis.preventiveMeasures || null,
                seek_agronomist: diagnosis.seekAgronomist,
                urgency_level: diagnosis.urgencyLevel,
                ai_model_used: 'gemini-2.5-flash',
                ai_analysis: diagnosis
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving diagnosis:', error);
            return null;
        }

        return mapDatabaseRowToDiagnosis(data);
    } catch (error) {
        console.error('Error in saveDiagnosis:', error);
        return null;
    }
}

/**
 * Get diagnosis history for a farmer
 */
export async function getDiagnosisHistory(
    farmerId: string,
    limit: number = 20
): Promise<PlantDiagnosis[]> {
    try {
        const { data, error } = await supabase
            .from('plant_diagnoses')
            .select('*')
            .eq('farmer_id', farmerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching diagnosis history:', error);
            return [];
        }

        return (data || []).map(mapDatabaseRowToDiagnosis);
    } catch (error) {
        console.error('Error in getDiagnosisHistory:', error);
        return [];
    }
}

/**
 * Map database row to PlantDiagnosis interface
 */
function mapDatabaseRowToDiagnosis(row: any): PlantDiagnosis {
    return {
        id: row.id,
        farmerId: row.farmer_id,
        imageUrl: row.image_url,
        imageStoragePath: row.image_storage_path,
        cropType: row.crop_type,
        plantPart: row.plant_part,
        diseaseName: row.disease_name,
        diseaseScientificName: row.disease_scientific_name,
        confidenceScore: row.confidence_score || 0,
        severity: row.severity,
        affectedStage: row.affected_stage,
        possibleCauses: row.possible_causes || [],
        symptomsDescription: row.symptoms_description,
        chemicalTreatment: row.chemical_treatment,
        organicTreatment: row.organic_treatment,
        preventiveMeasures: row.preventive_measures,
        seekAgronomist: row.seek_agronomist || false,
        urgencyLevel: row.urgency_level,
        aiModelUsed: row.ai_model_used,
        aiAnalysis: row.ai_analysis,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadDiagnosisImage(
    farmerId: string,
    file: File | Blob,
    fileName?: string
): Promise<{ url: string; path: string } | null> {
    try {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const fileName_ = fileName || `diagnosis-${Date.now()}.${fileExt}`;
        const filePath = `plant-diagnoses/${farmerId}/${fileName_}`;

        const { data, error } = await supabase.storage
            .from('plant-diagnoses')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('plant-diagnoses')
            .getPublicUrl(filePath);

        return {
            url: urlData.publicUrl,
            path: filePath
        };
    } catch (error) {
        console.error('Error in uploadDiagnosisImage:', error);
        return null;
    }
}

