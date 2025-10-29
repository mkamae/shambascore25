/**
 * Secure API Route for Plant Disease Diagnosis
 * 
 * This endpoint handles AI-powered plant disease diagnosis from images.
 * The Gemini API key is stored server-side and never exposed to clients.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

interface PlantDiagnosisRequest {
    imageBase64: string;
    imageMimeType: string;
    cropType?: string;
    plantPart?: 'leaf' | 'fruit' | 'stem' | 'root' | 'whole_plant';
    farmerLocation?: string;
}

interface PlantDiagnosisResponse {
    success: boolean;
    data?: {
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
    };
    error?: string;
}

function buildDiagnosisPrompt(request: PlantDiagnosisRequest): string {
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

function parseDiagnosisResponse(aiResponse: string, request: PlantDiagnosisRequest): PlantDiagnosisResponse['data'] {
    try {
        let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
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

function createFallbackDiagnosis(aiResponse: string, request: PlantDiagnosisRequest): PlantDiagnosisResponse['data'] {
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

export default async function handler(
    req: VercelRequest,
    res: VercelResponse<PlantDiagnosisResponse>
) {
    if (req.method === 'GET') {
        const hasKey = !!process.env.GEMINI_API_KEY;
        return res.status(200).json({ success: true, data: { diseaseName: hasKey ? 'OK' : 'MISSING_KEY', confidenceScore: 100, severity: 'Low', possibleCauses: [], symptomsDescription: 'Health check', preventiveMeasures: '', seekAgronomist: false, urgencyLevel: 'Low' } });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ success: false, error: 'AI service configuration error: Missing GEMINI_API_KEY' });
        }

        const { imageBase64, imageMimeType, cropType, plantPart, farmerLocation }: PlantDiagnosisRequest = req.body;

        if (!imageBase64) {
            return res.status(400).json({
                success: false,
                error: 'Missing image data'
            });
        }

        // Basic payload validation
        const maxBytes = 10 * 1024 * 1024; // 10MB
        // Rough base64 length -> bytes estimate
        const estimatedBytes = Math.ceil((imageBase64.length * 3) / 4);
        if (estimatedBytes > maxBytes) {
            return res.status(413).json({
                success: false,
                error: 'Image too large. Please upload an image under 10MB.'
            });
        }

        const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        const effectiveMime = imageMimeType || 'image/jpeg';
        if (!allowedMime.includes(effectiveMime)) {
            return res.status(415).json({
                success: false,
                error: 'Unsupported image type. Use JPEG, PNG, or WEBP.'
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const request = { cropType, plantPart, farmerLocation };
        const prompt = buildDiagnosisPrompt({ imageBase64: '', imageMimeType, ...request });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    text: prompt
                },
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: effectiveMime
                    }
                }
            ],
            config: {
                temperature: 0.3,
                maxOutputTokens: 1500
            }
        });

        const aiResponse = response.text;
        const diagnosis = parseDiagnosisResponse(aiResponse, { imageBase64: '', imageMimeType, ...request });

        return res.status(200).json({
            success: true,
            data: diagnosis
        });
    } catch (error: any) {
        console.error('Error diagnosing plant:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to diagnose plant image'
        });
    }
}

