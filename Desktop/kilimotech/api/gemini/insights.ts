/**
 * Secure API Route for Farm Insights
 * 
 * This endpoint handles AI-powered farm insights generation.
 * The Gemini API key is stored server-side and never exposed to clients.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

interface InsightsRequest {
    farmer: {
        name: string;
        location: string;
        farmType: string;
        farmData: {
            cropType: string;
            acreage: number;
            yieldEstimate: number;
            annualExpenses: number;
            rainfall: string;
            soilHealth: string;
        };
        creditProfile: {
            loanEligibility: number;
            repaymentAbilityScore: number;
            riskScore: number;
        };
        mpesaStatement: boolean;
    };
}

interface InsightsResponse {
    success: boolean;
    data?: {
        yieldAdvice: string;
        riskAdvice: string;
        loanAdvice: string;
    };
    error?: string;
}

const insightsSchema = {
    type: Type.OBJECT,
    properties: {
        yieldAdvice: {
            type: Type.STRING,
            description: "Personalized advice for the farmer to improve their crop yield. Provide 2-3 actionable, concise bullet points."
        },
        riskAdvice: {
            type: Type.STRING,
            description: "Analysis of potential financial and operational risks based on the farmer's data. Provide 2-3 actionable, concise bullet points for mitigation."
        },
        loanAdvice: {
            type: Type.STRING,
            description: "Suggestions for the farmer to improve their loan eligibility and credit profile. Provide 2-3 actionable, concise bullet points."
        }
    },
    required: ["yieldAdvice", "riskAdvice", "loanAdvice"]
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse<InsightsResponse>
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

        const { farmer }: InsightsRequest = req.body;

        if (!farmer) {
            return res.status(400).json({
                success: false,
                error: 'Missing farmer data'
            });
        }

        // Initialize Gemini AI client
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
            Analyze the following farmer's data and provide personalized, actionable insights.
            The farmer is from ${farmer.location}.

            Farmer Profile:
            - Name: ${farmer.name}
            - Farm Type: ${farmer.farmType}

            Farm Data:
            - Crop: ${farmer.farmData.cropType}
            - Acreage: ${farmer.farmData.acreage} acres
            - Estimated Yield: ${farmer.farmData.yieldEstimate} tons/acre
            - Annual Expenses: KES ${farmer.farmData.annualExpenses}
            - Rainfall: ${farmer.farmData.rainfall}
            - Soil Health: ${farmer.farmData.soilHealth}

            Financial Profile:
            - Current Loan Eligibility: KES ${farmer.creditProfile.loanEligibility}
            - Repayment Score: ${farmer.creditProfile.repaymentAbilityScore}%
            - Risk Score: ${farmer.creditProfile.riskScore} (lower is better)
            - M-Pesa Statement Uploaded: ${farmer.mpesaStatement ? 'Yes' : 'No'}

            Based on this data, generate concise and practical advice for the farmer in three key areas:
            1.  **Improving Yield:** What can they do to increase their farm's productivity?
            2.  **Managing Risks:** What are the key financial or environmental risks, and how can they be mitigated?
            3.  **Boosting Loan Eligibility:** What steps can they take to improve their credit profile and access more capital?

            Format the response as a JSON object with keys "yieldAdvice", "riskAdvice", and "loanAdvice". The advice in each section should be a string containing a few bullet points.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: insightsSchema,
                temperature: 0.5,
            },
        });

        const text = response.text;
        const insights = JSON.parse(text);

        if (insights.yieldAdvice && insights.riskAdvice && insights.loanAdvice) {
            return res.status(200).json({
                success: true,
                data: insights
            });
        } else {
            throw new Error('AI response was not in the expected format.');
        }
    } catch (error: any) {
        console.error('Error generating insights:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate AI insights'
        });
    }
}

