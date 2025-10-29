/**
 * Secure API Route for AI Chatbot
 * 
 * This endpoint handles AI-powered chatbot responses.
 * The Gemini API key is stored server-side and never exposed to clients.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

interface ChatbotRequest {
    question: string;
    farmer: {
        name: string;
        location: string;
        farmType: string;
        farmData?: {
            cropType: string;
            acreage: number;
            yieldEstimate: number;
            annualExpenses: number;
            rainfall: string;
            soilHealth: string;
        };
        creditProfile?: {
            loanEligibility: number;
            repaymentAbilityScore: number;
            riskScore: number;
        };
    };
    farmerProfile?: {
        riskCategory: string;
        riskScore: number;
        productionProfile?: any;
        financialBackground?: any;
    };
}

interface ChatbotResponse {
    success: boolean;
    data?: {
        response: string;
    };
    error?: string;
}

function buildContextPrompt(farmer: ChatbotRequest['farmer'], farmerProfile?: ChatbotRequest['farmerProfile']): string {
    let context = `Current Farmer Profile:\n`;
    
    context += `- Name: ${farmer.name}\n`;
    context += `- Location: ${farmer.location}\n`;
    context += `- Farm Type: ${farmer.farmType}\n\n`;

    if (farmer.farmData) {
        context += `Farm Production:\n`;
        context += `- Crop: ${farmer.farmData.cropType}\n`;
        context += `- Acreage: ${farmer.farmData.acreage} acres\n`;
        context += `- Yield Estimate: ${farmer.farmData.yieldEstimate} tons/acre\n`;
        context += `- Annual Expenses: KES ${farmer.farmData.annualExpenses.toLocaleString()}\n`;
        context += `- Rainfall Pattern: ${farmer.farmData.rainfall}\n`;
        context += `- Soil Health: ${farmer.farmData.soilHealth}\n\n`;
    }

    if (farmer.creditProfile) {
        context += `Financial Status:\n`;
        context += `- Loan Eligibility: KES ${farmer.creditProfile.loanEligibility.toLocaleString()}\n`;
        context += `- Repayment Ability: ${farmer.creditProfile.repaymentAbilityScore}%\n`;
        context += `- Risk Score: ${farmer.creditProfile.riskScore} (lower is better)\n\n`;
    }

    if (farmerProfile) {
        context += `Risk Assessment:\n`;
        context += `- Risk Category: ${farmerProfile.riskCategory || 'Not assessed'}\n`;
        context += `- Risk Score: ${(farmerProfile.riskScore * 100).toFixed(1)}%\n\n`;
    }

    return context;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse<ChatbotResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({
                success: false,
                error: 'AI service configuration error'
            });
        }

        const { question, farmer, farmerProfile }: ChatbotRequest = req.body;

        if (!question || !farmer) {
            return res.status(400).json({
                success: false,
                error: 'Missing question or farmer data'
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const contextPrompt = buildContextPrompt(farmer, farmerProfile);

        const systemPrompt = `You are FarmAdvisorAI, an expert agricultural and financial assistant for smallholder farmers in Kenya. 

Your role:
- Provide simple, actionable guidance based on production data, risk level, and local conditions
- Keep responses under 100 words and conversational
- Always encourage sustainable farming practices
- Be supportive and encouraging, especially for high-risk farmers
- Reference specific data from the farmer's profile when relevant

${contextPrompt}

Remember:
- If risk is low → encourage growth and sustainable investments
- If risk is high → suggest saving tips, input optimization, or joining insurance
- If rainfall is low → suggest drought-resistant crops or irrigation methods
- Always provide practical, actionable advice
- Use simple language that farmers can understand
- Be empathetic and understanding`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nFarmer's Question: ${question}\n\nPlease provide helpful advice:`,
            config: {
                temperature: 0.7,
                maxOutputTokens: 300,
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                response: response.text || 'I apologize, but I couldn\'t generate a response. Please try again.'
            }
        });
    } catch (error: any) {
        console.error('Error generating chatbot response:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate AI response'
        });
    }
}

