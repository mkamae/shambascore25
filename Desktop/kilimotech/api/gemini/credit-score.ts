/**
 * Secure API Route for Credit Scoring
 * 
 * This endpoint handles AI-powered M-Pesa statement analysis for credit scoring.
 * The Gemini API key is stored server-side and never exposed to clients.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

interface CreditScoreRequest {
    statementContent: string;
}

interface CreditScoreResponse {
    success: boolean;
    data?: {
        loanEligibility: number;
        repaymentAbilityScore: number;
        riskScore: number;
        summary: string;
    };
    error?: string;
}

const creditScoreSchema = {
    type: Type.OBJECT,
    properties: {
        loanEligibility: {
            type: Type.NUMBER,
            description: "A revised loan eligibility amount in Kenyan Shillings (KES) based on the M-Pesa statement analysis."
        },
        repaymentAbilityScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing the farmer's ability to repay the loan."
        },
        riskScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing the credit risk. A lower score is better."
        },
        summary: {
            type: Type.STRING,
            description: "A concise, 1-2 sentence summary of the credit analysis, highlighting key positive or negative factors."
        }
    },
    required: ["loanEligibility", "repaymentAbilityScore", "riskScore", "summary"]
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse<CreditScoreResponse>
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        // Get API key from server-side environment variable (not VITE_ prefix)
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({
                success: false,
                error: 'AI service configuration error'
            });
        }

        const { statementContent }: CreditScoreRequest = req.body;

        if (!statementContent || statementContent.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing statement content'
            });
        }

        // Initialize Gemini AI client
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
           Act as a credit analyst for a Kenyan microfinance institution specializing in agricultural loans.
           Analyze the following M-Pesa statement data to assess the creditworthiness of a smallholder farmer.

           M-Pesa Statement Data:
           ---
           ${statementContent}
           ---

           Your task is to:
           1.  Identify patterns in income (e.g., from M-Shwari, business payments).
           2.  Identify patterns in expenses (e.g., payments to suppliers, utility bills like KPLC).
           3.  Note any existing loan repayments (e.g., to Fuliza, M-Shwari, Tala).
           4.  Identify any high-risk behavior like frequent transactions with betting companies (e.g., SportPesa).
           5.  Based on the overall financial health, calculate a new credit profile for the farmer.

           Provide the output as a JSON object with the following keys: "loanEligibility" (KES), "repaymentAbilityScore" (0-100), "riskScore" (0-100, lower is better), and "summary" (a brief analysis).
       `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: creditScoreSchema,
                temperature: 0.2, // Lower temperature for more deterministic financial analysis
            },
        });

        const text = response.text;
        const profile = JSON.parse(text);

        if (profile.loanEligibility !== undefined && profile.repaymentAbilityScore !== undefined && profile.riskScore !== undefined && profile.summary) {
            return res.status(200).json({
                success: true,
                data: profile
            });
        } else {
            throw new Error('AI response was not in the expected format.');
        }
    } catch (error: any) {
        console.error('Error generating credit score:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate credit score'
        });
    }
}

