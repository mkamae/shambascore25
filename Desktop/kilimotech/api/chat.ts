import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { getAdminClient } from './_supabase';
import { isFeatureEnabled } from './_features';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'GET') {
            const hasKey = !!process.env.GEMINI_API_KEY;
            return res.status(200).json({ success: true, configured: hasKey });
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        if (!isFeatureEnabled('aiAdvisory')) {
            return res.status(410).json({ feature_disabled: true, message: 'This feature is temporarily disabled' });
        }

        const { farmerId, message, context } = req.body || {};
        if (!farmerId || !message) return res.status(400).json({ success: false, error: 'Missing farmerId or message' });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ success: false, error: 'AI service configuration error: Missing GEMINI_API_KEY' });

        const prompt = buildPrompt(context, message);
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { temperature: 0.7, maxOutputTokens: 300 } });
        const text = response.text || '';

        // Save chat
        const supabase = getAdminClient();
        await supabase.from('farmer_chats').insert({ farmer_id: farmerId, message, response: text });

        return res.status(200).json({ success: true, data: { response: text } });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}

function buildPrompt(context: any, message: string) {
    const base = `You are FarmAdvisorAI for smallholder farmers. Keep answers under 100 words and practical.`;
    const ctx = context ? `\nContext: ${JSON.stringify(context).slice(0, 1200)}` : '';
    return `${base}${ctx}\n\nQuestion: ${message}`;
}



