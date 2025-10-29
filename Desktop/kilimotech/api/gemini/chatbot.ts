/**
 * Secure API Route for AI Chatbot
 *
 * Returns advisory responses based on farmer context.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        // Health check: indicate whether backend is configured
        const hasKey = !!process.env.GEMINI_API_KEY;
        return res.status(200).json({ success: true, configured: hasKey });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'AI service configuration error: Missing GEMINI_API_KEY' });
        }

        const { question, farmer, farmerProfile } = req.body || {};
        if (!question || !farmer) {
            return res.status(400).json({ success: false, error: 'Missing question or farmer data' });
        }

        const context = buildContext(farmer, farmerProfile);

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${context}\n\nFarmer's Question: ${question}\n\nRespond in under 100 words with practical, supportive advice.`,
            config: { temperature: 0.7, maxOutputTokens: 300 }
        });

        return res.status(200).json({
            success: true,
            data: { response: response.text || '' }
        });
    } catch (error: any) {
        console.error('Chatbot error:', error);
        return res.status(500).json({ success: false, error: error.message || 'Failed to generate response' });
    }
}

function buildContext(farmer: any, farmerProfile?: any): string {
    let ctx = `You are FarmAdvisorAI for smallholder farmers in Kenya.\n`;
    ctx += `Farmer: ${farmer.name} | Location: ${farmer.location} | Type: ${farmer.farmType}\n`;
    if (farmer.farmData) {
        ctx += `Crop: ${farmer.farmData.cropType}, Acreage: ${farmer.farmData.acreage}, YieldEst: ${farmer.farmData.yieldEstimate}, Rainfall: ${farmer.farmData.rainfall}, Soil: ${farmer.farmData.soilHealth}\n`;
    }
    if (farmer.creditProfile) {
        ctx += `LoanEligibility: ${farmer.creditProfile.loanEligibility}, RepayScore: ${farmer.creditProfile.repaymentAbilityScore}, Risk: ${farmer.creditProfile.riskScore}\n`;
    }
    if (farmerProfile) {
        ctx += `RiskCategory: ${farmerProfile.riskCategory} (${(farmerProfile.riskScore ?? 0) * 100}%)\n`;
    }
    ctx += `Provide actionable, empathetic, sustainable tips.`;
    return ctx;
}


