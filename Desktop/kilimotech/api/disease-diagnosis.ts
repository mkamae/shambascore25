import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isFeatureEnabled } from './_features';

interface DiagnosisRequestBody {
    imageUrl?: string;
    base64Image?: string;
    cropType?: string;
    plantPart?: 'leaf' | 'fruit' | 'stem' | 'root' | 'whole_plant' | 'unknown';
}

interface DiagnosisResponseBody {
    success: boolean;
    diagnosis?: string;
    advice?: string;
    confidence?: number;
    model?: string;
    error?: string;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse<DiagnosisResponseBody>
) {
    if (req.method === 'GET') {
        return res.status(200).json({ success: true, diagnosis: 'OK', advice: 'API is reachable', confidence: 1, model: 'mock' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    }

    try {
        if (!isFeatureEnabled('plantDiagnosis')) {
            // Align with requested disabled response shape
            return res.status(410).json({ feature_disabled: true, message: 'This feature is temporarily disabled' } as any);
        }

        const body: DiagnosisRequestBody = req.body || {};
        const { imageUrl, base64Image } = body;

        if (!imageUrl && !base64Image) {
            return res.status(400).json({ success: false, error: 'Image URL or base64Image is required' });
        }

        const diseases = ['Leaf Blight', 'Rust', 'Powdery Mildew'];
        const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];

        const recommendations: Record<string, string> = {
            'Leaf Blight': 'Remove infected leaves and use copper fungicides.',
            'Rust': 'Avoid overhead irrigation; apply sulfur spray.',
            'Powdery Mildew': 'Use neem oil and ensure better airflow.'
        };

        // Simple mock confidence
        const confidence = parseFloat((0.6 + Math.random() * 0.35).toFixed(2));

        return res.status(200).json({
            success: true,
            diagnosis: randomDisease,
            advice: recommendations[randomDisease],
            confidence,
            model: 'mock'
        });
    } catch (error: any) {
        console.error('Disease Diagnosis API error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}


